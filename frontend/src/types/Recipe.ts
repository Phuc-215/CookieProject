import { Category } from "./Category";

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
export interface RecipeStep {
  id: string;
  instruction: string;
  images: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string | null;
  cookTime: string;
  servings: string;
  mainImage: string | null;
  ingredients: Ingredient[];
  steps: RecipeStep[];
}