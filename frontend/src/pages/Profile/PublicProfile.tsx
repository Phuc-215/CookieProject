import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { getUserProfileApi, getUserRecipesApi } from '@/api/user.api';
import { getUserCollectionsApi } from '@/api/collection.api';
import type { UserProfile } from '@/types/User';
import type { RecipeCard } from '@/types/Recipe';
import type { Collection } from '@/types/Collection';

interface Viewer {
  id: number;
  username: string;
  email?: string;
  avatar_url?: string | null;
}

interface PublicProfileProps {
  isLoggedIn: boolean;
  viewer?: Viewer | null;
  onLogout?: () => void;
}

export function PublicProfile({ isLoggedIn, viewer, onLogout: _onLogout }: PublicProfileProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recipes, setRecipes] = useState<RecipeCard[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    (async () => {
      try {
        setError(null);
        
          // Fetch profile, recipes, and collections in parallel
          const [profileRes, recipesRes, collectionsRes] = await Promise.allSettled([
            getUserProfileApi(id),
            getUserRecipesApi(id),
            getUserCollectionsApi(id)
          ]);

          if (!active) return;

          // Handle profile
          if (profileRes.status === 'fulfilled') {
            setProfile(profileRes.value.data);
          } else {
            throw profileRes.reason;
          }

          // Handle recipes
          if (recipesRes.status === 'fulfilled') {
            const rawRecipes = recipesRes.value.data.recipes || [];
            const transformed: RecipeCard[] = rawRecipes.map((r: any) => {
              const difficulty = r.difficulty
                ? (r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1).toLowerCase()) as RecipeCard['difficulty']
                : 'Medium';
              const cookMinutes = r.cook_time_min ?? r.cook_time;
              const timeStr = cookMinutes ? `${cookMinutes} min` : '30 min';
              return {
                id: String(r.id),
                title: r.title,
                image: r.thumbnail_url || r.image,
                author: profileRes.status === 'fulfilled' ? profileRes.value.data.username : 'User',
                difficulty,
                time: timeStr,
                cookTime: timeStr,
                likes: r.likes_count || 0,
                isLiked: Boolean(r.is_liked),
                isSaved: Boolean(r.is_saved),
              };
            });
            setRecipes(transformed);
          } else {
            console.warn('Failed to load recipes', recipesRes.reason);
            setRecipes([]);
          }

          // Handle collections
          if (collectionsRes.status === 'fulfilled') {
            const rawCollections = collectionsRes.value.data.collections || [];
            const mapped: Collection[] = rawCollections.map((c: any) => ({
              id: c.id,
              title: c.title,
              ownerUsername: profileRes.status === 'fulfilled' ? profileRes.value.data.username : 'Unknown',
              coverImages: Array.isArray(c.image) ? c.image : [],
              description: c.description || '',
              recipeIds: [],
              recipeCount: 0,
            }));
            setCollections(mapped);
          } else {
            console.warn('Failed to load collections', collectionsRes.reason);
            setCollections([]);
          }
      } catch (err: any) {
        if (!active) return;
        // Handle 404 - user not found
        if (err?.response?.status === 404) {
          navigate('/error', { state: { statusCode: 404, message: 'User not found' } });
          return;
        }
        const msg = err?.response?.data?.message || 'Failed to load profile';
        setError(msg);
      }
    })();

    return () => {
      active = false;
    };
  }, [id, navigate]);

  const profileUser = useMemo(() => {
    if (!profile) {
      return {
        id,
        username: 'Loading...',
        followers: 0,
        following: 0,
        bio: '',
        avatarUrl: null,
      };
    }

    return {
      id,
      username: profile.username,
      followers: profile.followers_count || 0,
      following: profile.following_count || 0,
      bio: profile.bio || '',
      avatarUrl: profile.avatar_url || null,
      recipes: profile.recipes_count ?? recipes.length,
    };
  }, [profile, recipes.length]);

  if (!id) {
    return <div className="p-8">Invalid profile link</div>;
  }

  if (error) {
    return <div className="p-8 text-pink-600">{error}</div>;
  }

  return (
    <ProfilePage
      viewer={{ username: viewer?.username ?? null }}
      profileId={id}
      profileUser={profileUser}
        recipes={recipes}
        collections={collections}
      isLoggedIn={isLoggedIn}
    />
  );
}