const { pool } = require('../config/db');

exports.getUserCollections = async (targetUserId, currentUserId) => {

  const isOwner = Number(targetUserId) === Number(currentUserId);
  const privacyClause = isOwner ? "" : "AND c.is_private = false";

  const query = `
    SELECT 
      c.id, 
      c.title, 
      c.description, 
      c.is_private, 
      c.updated_at,
      
      -- Count total recipes in this jar
      COUNT(cr.recipe_id)::int as recipe_count,

      -- Fetch up to 3 thumbnails for the folder preview UI
      COALESCE(
        (
          SELECT json_agg(t.thumbnail_url)
          FROM (
            SELECT r.thumbnail_url 
            FROM public.collection_recipes cr_sub
            JOIN public.recipes r ON cr_sub.recipe_id = r.id
            WHERE cr_sub.collection_id = c.id AND r.thumbnail_url IS NOT NULL
            LIMIT 3
          ) t
        ), 
        '[]'
      ) as cover_images

    FROM public.collections c
    LEFT JOIN public.collection_recipes cr ON c.id = cr.collection_id
    WHERE c.user_id = $1 ${privacyClause}
    GROUP BY c.id
  `;

  const res = await pool.query(query, [targetUserId]);
  return res.rows;
};

exports.getCollectionDetails = async (collectionId, currentUserId) => {
  console.log(collectionId, currentUserId);
  const client = await pool.connect();
  try {

    const metaQuery = `
      SELECT 
        c.*, 
        u.username as owner_name, u.avatar_url as owner_avatar,
        -- FETCH COVER IMAGES HERE (Correct Context)
        COALESCE(
          (
            SELECT json_agg(t.thumbnail_url)
            FROM (
              SELECT r.thumbnail_url 
              FROM public.collection_recipes cr_sub
              JOIN public.recipes r ON cr_sub.recipe_id = r.id
              WHERE cr_sub.collection_id = c.id 
                AND r.thumbnail_url IS NOT NULL
              ORDER BY cr_sub.added_at DESC
              LIMIT 3
            ) t
          ), 
          '[]'
        ) as cover_images
      FROM public.collections c
      JOIN public.users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const metaRes = await client.query(metaQuery, [collectionId]);

    if (metaRes.rows.length === 0) return null; // 404 Not Found
    const collection = metaRes.rows[0];
    console.log(collection);

    if (collection.is_private && parseInt(collection.user_id) !== currentUserId) {
      throw new Error("Unauthorized: This cookie jar is private.");
    }

    const recipesQuery = `
      SELECT 
        r.id, 
        r.title, 
        r.thumbnail_url, 
        r.difficulty, 
        r.cook_time_min,
        r.likes_count,
        u.username as author_name,
        
        -- Check if Current User Liked It (Personalized)
        (EXISTS (
           SELECT 1 FROM public.likes rl 
           WHERE rl.recipe_id = r.id AND rl.user_id = $2
        )) as is_liked,

        -- Check if Current User Saved It (Personalized)
        (EXISTS (
           SELECT 1 FROM public.collection_recipes cr2 
           JOIN public.collections c2 ON cr2.collection_id = c2.id 
           WHERE cr2.recipe_id = r.id AND c2.user_id = $2
        )) as is_saved

      FROM public.collection_recipes cr
      JOIN public.recipes r ON cr.recipe_id = r.id
      JOIN public.users u ON r.user_id = u.id
      WHERE cr.collection_id = $1 AND r.status = 'published'
      ORDER BY cr.added_at DESC
    `;

    const recipesRes = await client.query(recipesQuery, [collectionId, currentUserId]);

    const formattedRecipes = recipesRes.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      image: row.thumbnail_url || '',
      author: row.author_name,
      difficulty: row.difficulty,
      time: `${row.cook_time_min} min`,      
      likes: parseInt(row.likes_count || 0), 
      isLiked: row.is_liked,
      isSaved: row.is_saved,
    }));

    return {
      ...collection,
      recipes: formattedRecipes,
    };

  } finally {
    client.release();
  }
};

exports.createCollection = async ({ userId, title, description, isPrivate }) => {
  const query = `
    INSERT INTO public.collections (user_id, title, description, is_private)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, is_private, created_at, updated_at
  `;

  const values = [userId, title, description, isPrivate];

  const res = await pool.query(query, values);
  return res.rows[0];
};

exports.addRecipeToCollection = async (userId, collectionId, recipeId) => {
  const client = await pool.connect();
  try {
    const checkQuery = `
      SELECT id FROM public.collections 
      WHERE id = $1 AND user_id = $2
    `;
    const checkRes = await client.query(checkQuery, [collectionId, userId]);
    
    if (checkRes.rows.length === 0) {
      throw new Error("Collection not found or access denied");
    }

    const insertQuery = `
      INSERT INTO public.collection_recipes (collection_id, recipe_id)
      VALUES ($1, $2)
      ON CONFLICT (collection_id, recipe_id) DO NOTHING
      RETURNING added_at
    `;
    
    const insertRes = await client.query(insertQuery, [collectionId, recipeId]);

    // Return true if added, false if it was already there
    return { 
      success: true, 
      isNew: insertRes.rowCount > 0 
    };

  } finally {
    client.release();
  }
};

exports.updateCollection = async (collectionId, userId, { title, description, isPrivate }) => {
  const query = `
    UPDATE public.collections
    SET 
      title = $3,
      description = $4,
      is_private = $5,
      updated_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;

  // Note: We map 'isPrivate' (frontend) to 'is_private' (database)
  const values = [collectionId, userId, title, description, isPrivate];

  const res = await pool.query(query, values);
  
  // If no rows were returned, it means the collection doesn't exist 
  // OR the user doesn't own it.
  return res.rows[0];
};