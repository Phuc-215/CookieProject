export interface ingredient {
    id: string;
    name: string;
}


export interface RecipeIncredient {
    recipe_id: string;
    ingredient_id: string;
    amount: string;
    unit: string;
    extra_notes?: string;
}