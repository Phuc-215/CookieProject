import { useEffect, useMemo, useState } from 'react';
import { ProfilePage } from './ProfilePage';
import { getUserProfileApi, getUserRecipesApi } from '@/api/user.api';
import { getUserCollectionsApi } from '@/api/collection.api'
import type { UserProfile } from '@/types/User';
import type { RecipeCard } from '@/types/Recipe';
import type { Collection } from '@/types/Collection'

interface Viewer {
  id: number;
  username: string;
  email?: string;
  avatar_url?: string | null;
  bio?: string | null;
}
interface MyProfileProps {
  isLoggedIn: boolean;
  viewer?: Viewer | null;
  onLogout: () => void;
}

export function MyProfile({ isLoggedIn, viewer, onLogout: _onLogout }: MyProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<RecipeCard[]>([]);
  const [drafts, setDrafts] = useState<RecipeCard[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);

  const userId = useMemo(() => {
    if (viewer?.id) return viewer.id;
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.id;
      } catch {
        return null;
      }
    }
    return null;
  }, [viewer]);

  useEffect(() => {
    console.log("Collections updated:", collections);
  }, [collections]);

  useEffect(() => {
    if (!userId) {
      setError('Missing user ID');
      return;
    }

    let active = true;

    // Helper to handle safe state updates
    const safeSet = <T,>(setter: (val: T) => void, val: T) => {
      if (active) setter(val);
    };

    (async () => {
      try {
        setError(null);
        // Run fetches in parallel for better performance
        const [profileRes, recipesRes, collectionsRes] = await Promise.allSettled([
          getUserProfileApi(userId),
          getUserRecipesApi(userId),
          getUserCollectionsApi(userId)
        ]);

        // A. Handle Profile
        if (profileRes.status === 'fulfilled') {
          safeSet(setProfile, profileRes.value.data);
        } else {
          // If profile fails, that's a critical error
          throw profileRes.reason; 
        }

        // B. Handle Recipes
        if (recipesRes.status === 'fulfilled') {
          const rawRecipes = recipesRes.value.data.recipes || [];
          const published: RecipeCard[] = [];
          const draftsFetched: RecipeCard[] = [];

          rawRecipes.forEach((r: any) => {
            const difficulty = r.difficulty
              ? (r.difficulty.charAt(0).toUpperCase() + r.difficulty.slice(1).toLowerCase()) as RecipeCard['difficulty']
              : 'Medium';
            const cookMinutes = r.cook_time_min ?? r.cook_time;
            const timeStr = cookMinutes ? `${cookMinutes} min` : '30 min';

            const mapped: RecipeCard = {
              id: String(r.id),
              title: r.title,
              image: r.thumbnail_url || r.image,
              author: profileRes.status === 'fulfilled' ? profileRes.value.data.username : 'Me',
              difficulty,
              time: timeStr,
              cookTime: timeStr,
              likes: r.likes_count || 0,
              isLiked: Boolean(r.is_liked),
              isSaved: Boolean(r.is_saved),
            };

            if (r.status === 'draft') {
              draftsFetched.push(mapped);
            } else {
              published.push(mapped);
            }
          });

          safeSet(setRecipes, published);
          safeSet(setDrafts, draftsFetched);
        } else {
          console.warn('Failed to load recipes', recipesRes.reason);
        }

        // C. Handle Collections (New)
        if (collectionsRes.status === 'fulfilled') {
          console.log(collectionsRes);
          const rawCollections = collectionsRes.value.data.collections || [];
          const mapped: Collection[] = rawCollections.map((c: any) => ({
            id: c.id,
            title: c.title,
            ownerUsername: profileRes.status === 'fulfilled' ? profileRes.value.data.username : viewer?.username || 'Me',
            coverImages: Array.isArray(c.image) ? c.image : [],
            description: c.description || '',
            recipeIds: [],
            recipeCount: 0,
          }));
          safeSet(setCollections, mapped);
        } else {
          console.warn('Failed to load collections', collectionsRes.reason);
        }

        // const res = await getUserProfileApi(userId);
        // if (!active) return;
        // setProfile(res.data);
        
        // // Fetch user's recipes
        // try {
        //   const recipesRes = await getUserRecipesApi(userId);
        //   if (!active) return;
        //   // Transform API response to match Recipe type
        //   const transformedRecipes: Recipe[] = (recipesRes.data.recipes || []).map((r: any) => ({
        //     id: r.id,
        //     title: r.title,
        //     image: r.image,
        //     author: res.data?.username || viewer?.username || 'Me',
        //     difficulty: 'Medium' as const,
        //     time: '30 min',
        //     likes: 0,
        //     isLiked: false,
        //     isSaved: false,
        //   }));
        //   setRecipes(transformedRecipes);
        // } catch (recipesErr) {
        //   console.warn('Failed to load recipes:', recipesErr);
        //   setRecipes([]);
        // }
      } catch (err: any) {
        if (!active) return;
        const msg = err?.response?.data?.message || 'Failed to load profile';
        setError(msg);
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  if (!userId) {
    return <div className="p-8 text-pink-600">Cannot load profile (no user id)</div>;
  }

  if (error) {
    return <div className="p-8 text-pink-600">{error}</div>;
  }

  const profileUser = {
    id: userId,
    username: profile?.username || viewer?.username || 'Me',
    followers: profile?.followers_count || 0,
    following: profile?.following_count || 0,
    bio: profile?.bio || '',
    avatarUrl: profile?.avatar_url || viewer?.avatar_url || null,
    recipes: profile?.recipes_count ?? recipes.length,
  };

  return (
    <ProfilePage
      viewer={{ username: profileUser.username, avatar_url: profileUser.avatarUrl || null }}
      profileUser={profileUser}
      recipes={recipes}
      drafts={drafts}
      collections={collections}
      isLoggedIn={isLoggedIn}
    />
  );
}
