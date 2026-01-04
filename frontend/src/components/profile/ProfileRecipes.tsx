import { RecipeCard } from '@/components/RecipeCard';
import type { Recipe } from '@/types/Recipe';

type ProfileTab = 'recipes' | 'drafts' | 'collections';

interface ProfileRecipesProps {
  tab: ProfileTab;
  isOwner: boolean;
  recipes: Recipe[];
  drafts: Recipe[];
  savedRecipes: Recipe[];
}

export function ProfileRecipes({
  tab,
  isOwner,
  recipes,
  drafts,
  savedRecipes,
}: ProfileRecipesProps) {
  const data: Recipe[] =
    tab === 'recipes'
      ? recipes
      : tab === 'drafts'
      ? drafts
      : savedRecipes;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          {...recipe}
          showEdit={isOwner && tab !== 'collections'}
          showDelete={isOwner && tab !== 'collections'}
        />
      ))}
    </div>
  );
}