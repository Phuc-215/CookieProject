import { getCategoriesListApi } from '@/api/category.api';
import { RecipeForm } from '@/components/RecipeForm';
import { Category } from '@/types/Category';
import { useEffect, useState } from 'react';

export function CreateRecipe() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  async function getCategoriesList(){
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
  
  useEffect(()=>{
    getCategoriesList();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="p-4 text-center">Loading...</div>
      ) : (
        <RecipeForm
          mode="create"
          categories={categories}
        />
      )}
    </div>
  );
}