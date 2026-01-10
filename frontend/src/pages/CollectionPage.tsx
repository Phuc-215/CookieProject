import { useParams } from "react-router-dom";
import { RecipeCard } from "@/components/RecipeCard";
import { Headline } from "@/pages/HomeFeed/Headline";
import { useNav } from "@/hooks/useNav";
import { MOCK_RECIPES } from "@/mocks/mock_recipe";
import { MOCK_COLLECTIONS } from "@/mocks/mock_collection";
import { Pencil} from "lucide-react";
interface Viewer {
  id: number;
  username: string;
  email?: string;
}

interface CollectionPageProps {
  isLoggedIn: boolean;
  viewer?: Viewer | null;
}

export function CollectionPage({
  isLoggedIn = false,
  viewer,
}: CollectionPageProps) {
  const nav = useNav();
  const { id } = useParams<{ id: string }>();

  const collection = MOCK_COLLECTIONS.find(c => c.id === id);

  if (!collection) {
    return <div>Collection not found</div>;
  }

  const isOwner =
    isLoggedIn &&
    viewer?.username === collection.ownerUsername;

  const recipesInCollection = MOCK_RECIPES.filter(recipe =>
    collection.recipeIds.includes(recipe.id)
  );

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
    <section className="max-w-7xl mx-auto px-4 py-10">
    <div className="pixel-card bg-white p-6 flex gap-6 items-start">
        <img
        src={collection.coverImages[0]}
        className="w-48 h-48 pixel-border object-cover"
        />

        <div className="flex-1">
        <h2
            className="mb-2"
            style={{ fontFamily: "'Press Start 2P', cursive" }}
        >
            {collection.title}
        </h2>

        <p className="text-sm mb-1">
            {collection.recipeCount} recipes
        </p>

        <p className="text-xs text-gray-500 mb-4">
            Description: {collection.description}
        </p>

        {isOwner && (
            <div className="flex gap-2">
            {/* EDIT */}
            <button
                className="
                pixel-btn
                flex items-center gap-2
                px-4 py-2
                "
                onClick={() => nav.editCollection(collection.id)}
            >
                <Pencil className="w-4 h-4" />
                EDIT COOKIE JAR
            </button>
            </div>
        )}
        </div>
    </div>
    </section>


      <section className="max-w-7xl mx-auto px-4 pb-12">
        <Headline>RECIPES</Headline>

        <div className="grid grid-cols-3 gap-6 mt-6">
          {recipesInCollection.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              {...recipe}
              canRemove={isOwner}
              onRemove={() => console.log("remove", recipe.id)}
              onClick={() => nav.recipe(recipe.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}