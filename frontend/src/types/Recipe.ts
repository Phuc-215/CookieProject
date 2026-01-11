export type Difficulty = 'easy' | 'medium' | 'hard';

export interface RecipeCard {
  id: string;
  author: string;
  title: string;
  image: string;
  difficulty: Difficulty;
  time: string;      // used by RecipeCard component
  cookTime?: string; // optional alias
  likes: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

  // Alias for backward compatibility
  export type Recipe = RecipeCard;

export interface RecipeDetail extends RecipeCard {
  servings: string;
  ingredients: string[];
  steps: string[];
  tags: string[];
}
export interface RecipeStep {
  id: string;
  description: string;
  image_urls: string[];
  stepNumber: number;
  _newImages: File[];
}

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
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