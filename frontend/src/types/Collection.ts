export interface Collection {
  id: string;
  title: string;
  ownerUsername: string;
  coverImages: string[];
  description: string;
  recipeIds: string[];
  recipeCount: number;
}