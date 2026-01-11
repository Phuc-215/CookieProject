import { getCategoriesListApi } from '@/api/category.api';
import { RecipeForm } from '@/components/RecipeForm';
import { Category } from '@/types/Category';
import { RecipeFormData } from '@/types/Recipe';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDetailApi } from '@/api/recipe.api';

export function EditRecipe() {
  const { id } = useParams<{ id: string }>();
  const [recipeData, setRecipeData] = useState<RecipeFormData | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== MOCK DRAFT DATA =====
  // const mockInitialData: RecipeFormData = {
  //   id:'1',
  //   title: 'Draft Red Velvet Cake',
  //   description: 'This is a draft recipe',
  //   difficulty: 'medium',
  //   category: 'Dessert',
  //   cookTime: 45,
  //   servings: 6,
  //   mainImage: 'https://placehold.co/800x450',
  //   ingredients: [
  //     { id: '1', name: 'Flour', quantity: '250g' },
  //     { id: '2', name: 'Cocoa Powder', quantity: '20g' },
  //   ],
  //   steps: [
  //     {
  //       id: 's1',
  //       stepNumber: 1,
  //       description: 'Mix dry ingredients',
  //       images: [],
  //     },
  //     {
  //       id: 's2',
  //       stepNumber: 2,
  //       description: 'Bake at 170°C for 40 minutes',
  //       images: [],
  //     },
  //   ],
  // };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        
        const [categoriesRes, recipeRes] = await Promise.all([
          getCategoriesListApi(),
          getDetailApi(id) 
        ]);

        setCategories(categoriesRes.data.categories);
        const apiData = recipeRes.data.data;
        
        const formattedData: RecipeFormData = {
            id: apiData.id,
            title: apiData.title,
            description: apiData.description,
            difficulty: apiData.difficulty,
            category: apiData.category,
            cookTime: apiData.cook_time_min,
            servings: apiData.servings,
            mainImage: apiData.thumbnail_url || apiData.mainImage,
            ingredients: apiData.ingredients || [],
            steps: apiData.steps || [],
        };

        setRecipeData(formattedData);

      } catch (error) {
        console.error("Failed to load edit data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // async function getCategoriesList() {
  //   try {
  //     setLoading(true);
  //     const response = await getCategoriesListApi();
  //     setCategories(response.data.categories);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // useEffect(() => {
  //   getCategoriesList();
  // }, []);

  return (
    <div>
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <RecipeForm
          mode="edit"
          categories={categories}
          initialData={recipeData}
        />
      )}
    </div>
  );
}