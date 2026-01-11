
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

--- ENUM types ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recipe_difficulty') THEN
    CREATE TYPE recipe_difficulty AS ENUM ('easy','medium','hard');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE notification_type AS ENUM ('like','follow','comment','recipe_trending','system');
  END IF;
END$$;

--- USERS ---
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(150),
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

--- Keep follower/following counts denormalized on users for quick access
ALTER TABLE users ADD COLUMN IF NOT EXISTS followers_count INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS following_count INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recipes_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_users_displayname ON users(display_name);

--- FOLLOWS (many-to-many user - user) ---
DROP TABLE IF EXISTS follows CASCADE;
CREATE TABLE IF NOT EXISTS follows (
  follower_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_followee ON follows(followee_id);

--- RECIPES ---
DROP TABLE IF EXISTS recipes CASCADE;
CREATE TABLE IF NOT EXISTS recipes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  difficulty recipe_difficulty NOT NULL DEFAULT 'easy',
  category VARCHAR(100),
  servings INT,
  cook_time_min INT,  
  thumbnail_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'published', -- 'draft','published'
  is_trending BOOLEAN NOT NULL DEFAULT FALSE,
  likes_count INT NOT NULL DEFAULT 0,
  saved_count INT NOT NULL DEFAULT 0, 
  comments_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- tsvector column for full-text search
  search_vector tsvector
);

CREATE INDEX IF NOT EXISTS idx_recipes_userid_createdat ON recipes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recipes_is_trending ON recipes(is_trending, created_at DESC);
-- GIN index on search_vector for full-text search
CREATE INDEX IF NOT EXISTS idx_recipes_search_vector ON recipes USING GIN (search_vector);

-- For trigram similarity on title
CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON recipes USING GIN (title gin_trgm_ops);

--- INGREDIENTS (master list) ---
DROP TABLE IF EXISTS ingredients CASCADE;
CREATE TABLE IF NOT EXISTS ingredients (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(200) NOT NULL UNIQUE
);

--- RECIPE_INGREDIENTS (many-to-many with amounts) ---
DROP TABLE IF EXISTS recipe_ingredients CASCADE;
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  amount NUMERIC, -- decimal amount
  unit VARCHAR(50),
  extra_note TEXT,
  PRIMARY KEY (recipe_id, ingredient_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);

--- STEPS (ordered) ---
DROP TABLE IF EXISTS steps CASCADE;
CREATE TABLE IF NOT EXISTS steps (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  description TEXT NOT NULL,
  CONSTRAINT uniq_step_per_recipe UNIQUE (recipe_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_steps_recipe ON steps(recipe_id, step_number);

CREATE TABLE IF NOT EXISTS step_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  step_id BIGINT NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL, 
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_step_images_step_id 
ON step_images(step_id);


--- COLLECTIONS (cookie jars) ---
DROP TABLE IF EXISTS collections CASCADE;
CREATE TABLE IF NOT EXISTS collections (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);

DROP TABLE IF EXISTS collection_recipes CASCADE;
CREATE TABLE IF NOT EXISTS collection_recipes (
  collection_id BIGINT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_collectionrecipes_recipe ON collection_recipes(recipe_id);

--- LIKES ---
DROP TABLE IF EXISTS likes CASCADE;
CREATE TABLE IF NOT EXISTS likes (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_recipe ON likes(recipe_id);

--- COMMENTS ---
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  recipe_id BIGINT NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id BIGINT REFERENCES comments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_recipe_createdat ON comments(recipe_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comment_images (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  comment_id BIGINT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comment_images_comment_id
ON comment_images(comment_id);

--- NOTIFICATIONS ---
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- receiver
  actor_id BIGINT REFERENCES users(id), -- who triggered
  recipe_id BIGINT REFERENCES recipes(id),
  type notification_type NOT NULL,
  payload JSONB, -- extra data if needed
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC);

--- TRIGGER
-- Function to update updated_at
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to tables that have updated_at
CREATE TRIGGER users_set_timestamp BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER recipes_set_timestamp BEFORE UPDATE ON recipes
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER collections_set_timestamp BEFORE UPDATE ON collections
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER comments_set_timestamp BEFORE UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

--- SEARCH
CREATE OR REPLACE FUNCTION recipes_search_vector_update() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  ing_text TEXT;
  step_text TEXT;
  combined TEXT;
BEGIN
  -- aggregate ingredient names
  SELECT string_agg(i.name, ' ') INTO ing_text
    FROM recipe_ingredients ri JOIN ingredients i ON ri.ingredient_id = i.id
    WHERE ri.recipe_id = COALESCE(NEW.id, OLD.id);

  -- aggregate steps
  SELECT string_agg(s.description, ' ') INTO step_text
    FROM steps s WHERE s.recipe_id = COALESCE(NEW.id, OLD.id);

  combined := coalesce(NEW.title,'') || ' ' ||
              coalesce(ing_text,'') || ' ' ||
              coalesce(step_text,'');
  -- Use unaccent + simple parser — adjust locale if needed
  NEW.search_vector := to_tsvector('simple', unaccent(coalesce(combined,'')));
  RETURN NEW;
END;
$$;

-- Trigger for INSERT
CREATE TRIGGER trg_recipes_search_vector BEFORE INSERT ON recipes
FOR EACH ROW EXECUTE FUNCTION recipes_search_vector_update();

-- Trigger for UPDATE (title, content changes)
CREATE TRIGGER trg_recipes_search_vector_update BEFORE UPDATE ON recipes
FOR EACH ROW WHEN (OLD.title IS DISTINCT FROM NEW.title)
EXECUTE FUNCTION recipes_search_vector_update();

-- When recipe_ingredients or steps change, update the parent recipe's search_vector
CREATE OR REPLACE FUNCTION touch_recipe_search_vector() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE recipes SET search_vector = recipes.search_vector WHERE id = NEW.recipe_id;
  -- This triggers recipes' BEFORE UPDATE? Simpler: recalc using function:
  PERFORM recipes_search_vector_update();
  RETURN NEW;
END;
$$;

-- Simpler approach: when steps/recipe_ingredients change, update recipe.updated_at to fire recalculation via recipes trigger:
CREATE OR REPLACE FUNCTION bump_recipe_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  UPDATE recipes SET updated_at = now() WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_steps_images_bump_recipe
AFTER INSERT OR UPDATE OR DELETE ON step_images
FOR EACH ROW
EXECUTE FUNCTION bump_recipe_updated_at();


CREATE TRIGGER trg_recipe_ingredients_bump_recipe AFTER INSERT OR UPDATE OR DELETE ON recipe_ingredients
FOR EACH ROW EXECUTE FUNCTION bump_recipe_updated_at();

-- Top trending recipes in last 7 days by likes + saves (simple example)
CREATE OR REPLACE VIEW view_trending_recipes AS
SELECT r.id, r.title, r.user_id, r.thumbnail_url, r.likes_count, r.saved_count,
       (r.likes_count * 1.0 + r.saved_count * 1.5) AS score
FROM recipes r
WHERE r.status = 'published'
ORDER BY score DESC;

---Sample function to increment counters atomically (likes) ---
CREATE OR REPLACE FUNCTION like_recipe(p_user_id BIGINT, p_recipe_id BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO likes(user_id, recipe_id) VALUES (p_user_id, p_recipe_id)
    ON CONFLICT DO NOTHING;
  UPDATE recipes SET likes_count = likes_count + 1 WHERE id = p_recipe_id;
  -- create notification
  INSERT INTO notifications(user_id, actor_id, recipe_id, type)
    SELECT r.user_id, p_user_id, p_recipe_id, 'like' FROM recipes r WHERE r.id = p_recipe_id;
END;
$$;

CREATE OR REPLACE FUNCTION unlike_recipe(p_user_id BIGINT, p_recipe_id BIGINT) RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM likes WHERE user_id = p_user_id AND recipe_id = p_recipe_id;
  UPDATE recipes SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = p_recipe_id;
END;
$$;

--- Index suggestions for performance ---
CREATE INDEX IF NOT EXISTS idx_recipes_created_at ON recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);