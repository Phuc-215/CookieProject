import { RecipeCard } from '@/components/RecipeCard';
import { useNav } from '../../hooks/useNav'; 
import type { Recipe } from '@/types/Recipe';

type ProfileRecipeTab = 'recipes' | 'drafts';
interface ProfileRecipesProps {
  tab: ProfileRecipeTab;
  isOwner: boolean;
  recipes: Recipe[];
  drafts: Recipe[];
  onDeleteRecipe: (id: string) => void;
}

export function ProfileRecipes({
  tab,
  isOwner,
  recipes,
  drafts,
  onDeleteRecipe,
}: ProfileRecipesProps) {
  const data = tab === 'recipes' ? recipes : drafts;
  const nav = useNav();

  const handleEdit = (id: string) => {
    nav.editRecipe(id);
  };

  const handleDelete = (id: string) => {
    const ok = window.confirm('Delete this recipe?');
    if (!ok) return;
    // Xóa UI
    onDeleteRecipe(id); 

    // TODO: call API delete ở đây
  };
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          {...recipe}
          onClick={() => nav.recipe(recipe.id)}
          showEdit={isOwner}
          showDelete={isOwner}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}