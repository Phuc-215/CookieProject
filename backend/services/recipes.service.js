// services/recipes.service.js
const { pool } = require('../config/db');
const { deleteFromSupabase } = require('../utils/storage')
const notificationService = require('./notifications.service');

exports.getById = async (recipeId, currentUserId) => {
  const client = await pool.connect();
  try {
    // 1. Updated Query: Includes is_liked and is_saved checks
    console.log("Fetching recipe by ID:", recipeId, "for user:", currentUserId);
    const query = `
      SELECT r.*, 
             u.id as author_id,
             u.username as author_name,
             u.avatar_url as author_avatar,
             (
               SELECT COUNT(*) > 0 
               FROM public.likes l 
               WHERE l.recipe_id = r.id AND l.user_id = $2
             ) as is_liked,
             (
               SELECT COUNT(*) > 0 
               FROM public.collection_recipes cr 
               JOIN public.collections c ON cr.collection_id = c.id 
               WHERE cr.recipe_id = r.id AND c.user_id = $2
             ) as is_saved,
             c.name as category
      FROM public.recipes r
      JOIN public.users u ON r.user_id = u.id
      LEFT JOIN public.categories c ON r.category_id = c.id
      WHERE r.id = $1
    `;
    
    // Pass currentUserId (can be null for guests)
    const res = await client.query(query, [recipeId, currentUserId]);
    console.log("Recipe query result:", res.rows);

    if (res.rows.length === 0) return null;
    const recipe = res.rows[0];

    // Security Check
    if (recipe.status !== 'published' && (!currentUserId || recipe.user_id !== currentUserId)) {
      throw new Error("Unauthorized: This recipe is private.");
    }

    // Fetch Children
    const ingRes = await client.query(
      `SELECT i.name, ri.amount, ri.unit
       FROM public.recipe_ingredients ri
       JOIN public.ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = $1`,
      [recipeId]
    );

    const stepsRes = await client.query(
      `SELECT s.step_number, s.description,
              (SELECT json_agg(si.image_url) FROM public.step_images si WHERE si.step_id = s.id) as image_urls
       FROM public.steps s
       WHERE s.recipe_id = $1
       ORDER BY s.step_number ASC`,
      [recipeId]
    );

    return {
      ...recipe,
      category: recipe.category,
      ingredients: ingRes.rows,
      steps: stepsRes.rows
    };

  } finally {
    client.release();
  }
};

exports.saveRecipe = async ({
  recipeId, userId, title, difficulty = 'easy', category, servings, 
  cookTime, thumbnailUrl = null, status = 'published', ingredients, steps
}) => {
  console.log('saveRecipe', recipeId, userId, title, difficulty, category, servings, cookTime, thumbnailUrl, status, ingredients, steps);
  // Get a dedicated client from the pool (Required for Transactions)
  const client = await pool.connect();
  let imageToDelete = null;
  let categoryIdToSave = undefined;
  
  try {
    // Start the Transaction
    await client.query('BEGIN');

    // --- STEP A: Upsert (Update/Insert) the Recipe ---
    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    
    if (category !== undefined) {
        // Check if it's already an ID (number) or a Name (string)
        if (typeof category === 'number') {
            categoryIdToSave = category;
        } else {
            // Lookup ID by Name (Case Insensitive)
            const catRes = await client.query(
                `SELECT id FROM public.categories WHERE LOWER(name) = LOWER($1)`, 
                [category.trim()]
            );
            
            if (catRes.rows.length > 0) {
                categoryIdToSave = catRes.rows[0].id;
            } else {
                throw new Error(`Category '${category}' does not exist.`);
            }
        }
    }

    if (recipeId) {
        console.log("UPDATE");
        // --- UPDATE DRAFT ---
        const oldRes = await client.query(
            `SELECT thumbnail_url, status FROM public.recipes WHERE id = $1`, 
            [recipeId]
        );

        const oldThumbnailUrl = oldRes.rows[0]?.thumbnail_url;
        const oldStatus = oldRes.rows[0]?.status;

        const fieldsToUpdate = [];
        const values = [];
        let paramIndex = 1;

        const addField = (col, val, cast = null) => {
            if (val !== undefined) {
                const castStr = cast ? `::${cast}` : '';
                fieldsToUpdate.push(`${col} = $${paramIndex++}${castStr}`);
                values.push(val);
            }
        };

        if (difficulty) addField('difficulty', difficulty);
        if (categoryIdToSave) addField('category_id', categoryIdToSave);
        if (servings) addField('servings', servings);
        if (cookTime) addField('cook_time_min', cookTime);
        if (thumbnailUrl) addField('thumbnail_url', thumbnailUrl);
        if (status) addField('status', status);

        if (values.length > 0) {
            values.push(recipeId);
            values.push(userId);

            const updateQuery = `
                UPDATE public.recipes 
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
                RETURNING id
            `;

            const updateRes = await client.query(updateQuery, values);
            if (updateRes.rowCount === 0) {
                throw new Error("Recipe not found or permission denied.");
            }

            // CLEAR OLD RELATIONS (Wipe & Rewrite Strategy / Delete & Re-insert)
            /*
            Trying to calculate the "Diff" (e.g., "User changed Step 2, deleted Step 3, and added Step 4") is extremely complex and error-prone.
            "Wipe and Rewrite" is fast, safe, and ensures the database exactly matches what is on the user's screen.
            */
            await client.query(`DELETE FROM public.recipe_ingredients WHERE recipe_id = $1`, [recipeId]);
            await client.query(`DELETE FROM public.steps WHERE recipe_id = $1`, [recipeId]);

            if (oldThumbnailUrl && updateRes.thumbnailUrl && oldThumbnailUrl !== updateRes.thumbnailUrl) {
                imageToDelete = oldThumbnailUrl;
            }

                // Trigger notification if recipe was just published (status changed to 'published')
            if (recipeId && status === 'published' && oldStatus && oldStatus !== 'published') {
                await notificationService.triggerNewRecipeNotification(userId, recipeId).catch(err => 
                console.error('New recipe notification error:', err)
                );
            }
        }
    } else {
        console.log("INSERT");
        // --- CREATE RECIPE/DRAFT ---
        const insertQuery = `
            INSERT INTO public.recipes (
            user_id, slug, title, difficulty, category_id, 
            servings, cook_time_min, thumbnail_url, status
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id;
        `;

        console.log("Inserting recipe with values:", [
            userId, slug, title, difficulty, categoryIdToSave, 
            servings, cookTime, thumbnailUrl, status
        ]);

        // Note: Zod has already validated these values earlier
        const insertRes = await client.query(insertQuery, [
            userId, slug, title, difficulty, categoryIdToSave, 
            servings, cookTime, thumbnailUrl, status
        ]);

        recipeId = insertRes.rows[0].id;
    }

    // --- STEP B: Process Ingredients ---
    console.log("Ingredients:", ingredients);
    if (ingredients && ingredients.length > 0) {
        for (const item of ingredients) {
            console.log(item);
            let ingredientId;

            // Find existing ingredient by name (Case insensitive)
            const findIngRes = await client.query(
            `SELECT id FROM public.ingredients WHERE LOWER(name) = LOWER($1)`, 
            [item.name]
            );

            if (findIngRes.rows.length > 0) {
            ingredientId = findIngRes.rows[0].id;
            } else {
            const insertIngRes = await client.query(
                `INSERT INTO public.ingredients (name) VALUES ($1) RETURNING id`,
                [item.name]
            );
            ingredientId = insertIngRes.rows[0].id;
            }

            const insertResult = await client.query(
            `INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit) 
            VALUES ($1, $2, $3, $4) RETURNING *`,
            [recipeId, ingredientId, item.amount, item.unit]
            );
        }
    }

    console.log("HELLO");

    // --- STEP C: Process Steps & Images ---
    if (steps && steps.length > 0) {
        for (const step of steps) {
            const stepRes = await client.query(
            `INSERT INTO public.steps (recipe_id, step_number, description)
            VALUES ($1, $2, $3)
            RETURNING id`,
            [recipeId, step.stepNumber, step.description]
            );
            
            const stepId = stepRes.rows[0].id;

            if (step.imageUrls && step.imageUrls.length > 0) {
            for (const url of step.imageUrls) {
                await client.query(
                `INSERT INTO public.step_images (step_id, image_url) VALUES ($1, $2)`,
                [stepId, url]
                );
            }
            }
        }
    }

    // --- STEP D: Commit Transaction ---
    await client.query('COMMIT');



    if (imageToDelete) {
        deleteFromSupabase(imageToDelete).catch(err => console.error("Cleanup failed:", err));
    }

    // Return the recipe ID
    return { id: recipeId };

  } catch (error) {
    // --- ROLLBACK on any error ---
    await client.query('ROLLBACK');
    console.error("Transaction Error:", error);
    throw error; // Re-throw to be handled by controller
  } finally {
    // 3. Release the client back to the pool
    client.release();
  }
};

exports.deleteRecipe = async (recipeId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // A. Verify Ownership
    const check = await client.query('SELECT user_id FROM public.recipes WHERE id = $1', [recipeId]);
    if (check.rows.length === 0) throw new Error("Recipe not found");
    if (parseInt(check.rows[0].user_id) !== userId) throw new Error("Unauthorized");

    // B. Soft Delete (Set status)
    await client.query(
      `UPDATE public.recipes SET status = 'deleted' WHERE id = $1`,
      [recipeId]
    );

    // C. Cleanup User Lists (Cookie Jars / Watchlists)
    // We remove it from other users' saved lists so they don't see dead links
    await client.query(`DELETE FROM public.collection_recipes WHERE recipe_id = $1`, [recipeId]);
    
    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

exports.likeRecipe = async (userId, recipeId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log("Liking recipe:", recipeId, "by user:", userId);
        // Insert like record
        const insertLikeText = `
            INSERT INTO likes (user_id, recipe_id, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT DO NOTHING
        `;
        const result = await client.query(insertLikeText, [userId, recipeId]);

        // Update likes count
        const updateLikesCountText = `
            UPDATE recipes
            SET likes_count = likes_count + 1
            WHERE id = $1
        `;
        await client.query(updateLikesCountText, [recipeId]);

        await client.query('COMMIT');
        
        // Trigger notification (only if new like was inserted)
        if (result.rowCount > 0) {
            await notificationService.triggerLikeNotification(userId, recipeId).catch(err => 
                console.error('Like notification error:', err)
            );
        }
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

exports.unlikeRecipe = async (userId, recipeId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete like record
        const deleteLikeText = `
            DELETE FROM likes
            WHERE user_id = $1 AND recipe_id = $2
        `;
        await client.query(deleteLikeText, [userId, recipeId]);

        // Update likes count
        const updateLikesCountText = `
            UPDATE recipes
            SET likes_count = GREATEST(likes_count - 1, 0)
            WHERE id = $1
        `;
        await client.query(updateLikesCountText, [recipeId]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.addComment = async (userId, recipeId, content) => {
    const insertCommentText = `
        INSERT INTO comments (user_id, recipe_id, content, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, user_id, recipe_id, content, created_at
    `;
    const result = await pool.query(insertCommentText, [userId, recipeId, content]);
    
    // Trigger notification
    await notificationService.triggerCommentNotification(userId, recipeId, content).catch(err => 
        console.error('Comment notification error:', err)
    );
    
    return result.rows[0];
};

exports.getComments = async (recipeId) => {
    const getCommentsText = `
        SELECT rc.id, rc.user_id, rc.recipe_id, rc.content, rc.created_at, u.username
        FROM comments rc
        JOIN users u ON rc.user_id = u.id
        WHERE rc.recipe_id = $1
        ORDER BY rc.created_at DESC
    `;
    const result = await pool.query(getCommentsText, [recipeId]);
    return result.rows;
};

exports.deleteComment = async (userId, recipeId, commentId) => {
    const deleteCommentText = `
        DELETE FROM comments
        WHERE id = $1 AND recipe_id = $2 AND user_id = $3
    `;
    await pool.query(deleteCommentText, [commentId, recipeId, userId]);
};
