import { RecipeForm } from '@/components/RecipeForm';
import { useNav } from '@/hooks/useNav';

export function CreateRecipe() {
  const nav = useNav();

  return (
    <RecipeForm
      mode="create"
      onSaveDraft={() => nav.home()}
      onPublish={() => nav.home()}
    />
  );
}