import { useState, useEffect } from "react"
import { useParams } from "react-router-dom";
import { RecipeCard } from "@/components/RecipeCard";
import { Headline } from "@/pages/HomeFeed/Headline";
import { useNav } from "@/hooks/useNav";
import { getCollectionDetailApi } from "@/api/collection.api";
import { Pencil, Loader2} from "lucide-react";
import type { RecipeCard as RecipeCardType } from '@/types/Recipe'

interface Viewer {
  id: number;
  username: string;
  email?: string;
}

interface CollectionPageProps {
  isLoggedIn: boolean;
  viewer?: Viewer | null;
}

interface CollectionDetail {
  id: number;
  user_id: string; // ID of the owner
  title: string;
  description: string | null;
  cover_images: string[];
  is_private: boolean;
  owner_name: string;
  recipes: RecipeCardType[];
  recipeCount?: number;
}

export function CollectionPage({
  isLoggedIn = false,
  viewer,
}: CollectionPageProps) {
  const nav = useNav();
  const { id } = useParams<{ id: string }>();

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log(collection);
  }, [collection]);

  useEffect(() => {
    if (!id) return;

    let active = true;

    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getCollectionDetailApi(id);
        console.log(res);
        
        if (active) {
          console.log("Assign");
          setCollection(res.data.data);
        }
      } catch (err: any) {
        if (active) {
          console.error("Failed to load collection", err);
          const msg = err.response?.data?.message || "Collection not found";
          setError(msg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchCollection();

    return () => {
      active = false;
    };
  }, [id]);

  const isOwner = isLoggedIn && String(viewer?.id) === String(collection?.user_id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background-image)]">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  // --- Error State ---
  if (error || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background-image)]">
        <div className="bg-white p-6 pixel-border text-center">
          <h2 className="text-xl mb-2 text-red-500 font-bold">Error</h2>
          <p>{error || "Collection not found"}</p>
          <button 
            onClick={() => nav.home()} 
            className="mt-4 px-4 py-2 pixel-btn"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
    <section className="max-w-7xl mx-auto px-4 py-10">
    <div className="pixel-card bg-white p-6 flex gap-6 items-start">
        <img
        src={collection.cover_images[0] || 'https://via.placeholder.com/150'}
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
          {collection.recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              {...recipe}
              // FIX: Explicitly check for isLiked from DB response
              isLiked={recipe.isLiked || (recipe as any).is_liked || false}
              isSaved={recipe.isSaved || (recipe as any).is_saved || false}
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