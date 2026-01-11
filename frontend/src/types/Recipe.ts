export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export interface RecipeCard {
  id: string;
  author: string;
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