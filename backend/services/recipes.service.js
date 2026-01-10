const { pool } = require('../config/db');

exports.create = async ({
  userId, title, difficulty = 'easy', category, servings, 
  cookTime, thumbnailUrl = null, status = 'published', ingredients, steps
}) => {
  // 1. Get a dedicated client from the pool (Required for Transactions)
  const client = await pool.connect();
  
  try {
    // 2. Start the Transaction
    await client.query('BEGIN');

    // --- STEP A: Insert the Recipe ---
    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    const recipeQuery = `
      INSERT INTO public.recipes (
        user_id, slug, title, difficulty, category, 
        servings, cook_time_min, thumbnail_url, status
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, title, created_at;
    `;
    
    // Note: Zod has already validated these values earlier
    const recipeRes = await client.query(recipeQuery, [
      userId, slug, title, difficulty, category, 
      servings, cookTime, thumbnailUrl, status
    ]);
    
    const recipeId = recipeRes.rows[0].id;
    console.log("Recipe Id: ", recipeId);

    // --- STEP B: Process Ingredients ---
    if (ingredients && ingredients.length > 0) {
      for (const item of ingredients) {
        let ingredientId;

        // 1. Try to find existing ingredient by name (Case insensitive)
        const findIngRes = await client.query(
          `SELECT id FROM public.ingredients WHERE LOWER(name) = LOWER($1)`, 
          [item.name]
        );

        if (findIngRes.rows.length > 0) {
          ingredientId = findIngRes.rows[0].id;
        } else {
          // 2. Create new ingredient if it doesn't exist
          const insertIngRes = await client.query(
            `INSERT INTO public.ingredients (name) VALUES ($1) RETURNING id`,
            [item.name]
          );
          ingredientId = insertIngRes.rows[0].id;
        }

        // 3. Link Recipe to Ingredient (The Junction Table)
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
        // 1. Insert the Step
        const stepRes = await client.query(
          `INSERT INTO public.steps (recipe_id, step_number, description)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [recipeId, step.stepNumber, step.description]
        );
        
        const stepId = stepRes.rows[0].id;

        // 2. Insert Images for this step (if any)
        if (step.imageUrl) {
          await client.query(
            `INSERT INTO public.step_images (step_id, image_url) VALUES ($1, $2)`,
            [stepId, step.imageUrl]
          );
        }
      }
    }

    // --- STEP D: Commit Transaction ---
    await client.query('COMMIT');

    // Return success
    return recipeRes.rows[0]

  } catch (error) {
    // --- ROLLBACK on any error ---
    await client.query('ROLLBACK');
    console.error("Transaction Error:", error);
  } finally {
    // 3. Release the client back to the pool
    client.release();
  }
};