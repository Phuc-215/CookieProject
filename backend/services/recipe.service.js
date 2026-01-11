const { pool } = require('../config/db');
const { deleteFromSupabase } = require('../utils/storage')

exports.getById = async (recipeId, currentUserId) => {
  const client = await pool.connect();
  try {
    const query = `
      SELECT r.*, 
             u.username as author_name,
             u.avatar_url as author_avatar
      FROM public.recipes r
      JOIN public.users u ON r.user_id = u.id
      WHERE r.id = $1
    `;

    const res = await client.query(query, [recipeId]);

    if (res.rows.length === 0) return null;
    const recipe = res.rows[0];

    // Security Check (Private Protection)
    // If it's not published, ONLY the author can see it
    if (recipe.status !== 'published' && recipe.user_id !== currentUserId) {
      throw new Error("Unauthorized: This recipe is private.");
    }

    // Fetch Children (Ingredients & Steps)
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
      ingredients: ingRes.rows,
      steps: stepsRes.rows
    };

  } finally {
    client.release();
  }
};

exports.saveRecipe = async ({
  recipeId, userId, title, difficulty = 'Easy', category, servings, 
  cookTime, thumbnailUrl = null, status = 'published', ingredients, steps
}) => {
  // Get a dedicated client from the pool (Required for Transactions)
  const client = await pool.connect();
  let imageToDelete = null;
  
  try {
    // Start the Transaction
    await client.query('BEGIN');

    // --- STEP A: Upsert (Update/Insert) the Recipe ---
    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    
    if (recipeId) {
      // --- UPDATE DRAFT ---
      const oldRes = await client.query(
        `SELECT thumbnail_url FROM public.recipes WHERE id = $1`, 
        [recipeId]
      );

      const oldThumbnailUrl = oldRes.rows[0]?.thumbnail_url;

      const updateQuery = `
        UPDATE public.recipes 
        SET slug = $1, title = $2, difficulty = $3, category = $4, 
            servings = $5, cook_time_min = $6, thumbnail_url = COALESCE($7, thumbnail_url), 
            status = $8, updated_at = NOW()
        WHERE id = $9 AND user_id = $10
        RETURNING id;
      `;

      const updateRes = await client.query(updateQuery, [
        slug, title, difficulty, category, servings, 
        cookTime, thumbnailUrl, status, recipeId, userId
      ]);

      if (updateRes.rowCount === 0) {
        throw new Error("Recipe not found or you do not have permission to edit it.");
      }

      // CLEAR OLD RELATIONS (Wipe & Rewrite Strategy / Delete & Re-insert)
      /*
      Trying to calculate the "Diff" (e.g., "User changed Step 2, deleted Step 3, and added Step 4") is extremely complex and error-prone.
      "Wipe and Rewrite" is fast, safe, and ensures the database exactly matches what is on the user's screen.
      */
      await client.query(`DELETE FROM public.recipe_ingredients WHERE recipe_id = $1`, [recipeId]);
      await client.query(`DELETE FROM public.steps WHERE recipe_id = $1`, [recipeId]);

      if (oldThumbnailUrl && data.thumbnailUrl && oldThumbnailUrl !== data.thumbnailUrl) {
        imageToDelete = oldThumbnailUrl;
      }

    } else {
      // --- CREATE RECIPE/DRAFT ---
      const insertQuery = `
        INSERT INTO public.recipes (
          user_id, slug, title, difficulty, category, 
          servings, cook_time_min, thumbnail_url, status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id;
      `;

      // Note: Zod has already validated these values earlier
      const insertRes = await client.query(insertQuery, [
        userId, slug, title, difficulty, category, 
        servings, cookTime, thumbnailUrl, status
      ]);

      recipeId = insertRes.rows[0].id;
    }

    // --- STEP B: Process Ingredients ---
    if (ingredients && ingredients.length > 0) {
      for (const item of ingredients) {
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

        await client.query(
          `INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, amount, unit) 
           VALUES ($1, $2, $3, $4)`,
          [recipeId, ingredientId, item.amount, item.unit]
        );
      }
    }

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

    // Return success

  } catch (error) {
    // --- ROLLBACK on any error ---
    await client.query('ROLLBACK');
    console.error("Transaction Error:", error);
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