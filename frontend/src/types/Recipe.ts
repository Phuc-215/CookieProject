export type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface RecipeAuthor {
  username: string;
  avatar: string | null;
}
export interface RecipeCard {
  id: string;
  author: RecipeAuthor;
  title: string;
  image: string;
  difficulty: Difficulty;
  cookTime: string;
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface RecipeDetail extends RecipeCard {
  servings: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
}