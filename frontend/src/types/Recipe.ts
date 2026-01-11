export type Difficulty = 'easy' | 'medium' | 'hard';

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
export interface RecipeStep {
  id: string;
  description: string;
  images: string[];
  stepNumber: number;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

export interface RecipeFormData {
  id?: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string | null;
  cookTime: number | null;
  servings: number | null;
  mainImage: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}