import { getCategoriesListApi } from '@/api/category.api';
import { RecipeForm } from '@/components/RecipeForm';
import { Category } from '@/types/Category';
import { RecipeFormData } from '@/types/Recipe';
import { useEffect, useState } from 'react';

export function EditRecipe() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== MOCK DRAFT DATA =====
  const mockInitialData: RecipeFormData = {
    id:'1',
    title: 'Draft Red Velvet Cake',
    description: 'This is a draft recipe',
    difficulty: 'medium',
    category: 'Dessert',
    cookTime: 45,
    servings: 6,
    mainImage: 'https://placehold.co/800x450',
    ingredients: [
      { id: '1', name: 'Flour', quantity: '250g' },
      { id: '2', name: 'Cocoa Powder', quantity: '20g' },
    ],
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        description: 'Mix dry ingredients',
        images: [],
      },
      {
        id: 's2',
        stepNumber: 2,
        description: 'Bake at 170°C for 40 minutes',
        images: [],
      },
    ],
  };

  async function getCategoriesList() {
    try {
      setLoading(true);
      const response = await getCategoriesListApi();
      setCategories(response.data.categories);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCategoriesList();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <RecipeForm
          mode="edit"
          categories={categories}
          initialData={mockInitialData}
        />
      )}
    </div>
  );
}