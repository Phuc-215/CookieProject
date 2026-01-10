import { useEffect, useMemo, useState } from 'react';
import { ProfilePage } from './ProfilePage';
import { MOCK_COLLECTIONS } from "@/mocks/mock_collection";
import { MOCK_RECIPES } from "@/mocks/mock_recipe";
import { getUserProfileApi, getUserRecipesApi } from '@/api/user.api';
import type { UserProfile } from '@/types/User';
import type { Recipe } from '@/types/Recipe';

const DRAFT_RECIPES = [
  {
    id: 'draft-1',
    title: 'Matcha Cookies (Draft)',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
    author: 'You',
    difficulty: 'Medium' as const,
    time: '45 min',
    likes: 0,
  },
];

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

export function MyProfile({ isLoggedIn, viewer, onLogout }: MyProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
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
    if (!userId) {
      setError('Missing user ID');
      return;
    }

    let active = true;

    (async () => {
      try {
        setError(null);
        const res = await getUserProfileApi(userId);
        if (!active) return;
        setProfile(res.data);
        
        // Fetch user's recipes
        try {
          const recipesRes = await getUserRecipesApi(userId);
          if (!active) return;
          // Transform API response to match Recipe type
          const transformedRecipes: Recipe[] = (recipesRes.data.recipes || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            image: r.image,
            author: res.data?.username || viewer?.username || 'Me',
            difficulty: 'Medium' as const,
            time: '30 min',
            likes: 0,
            isLiked: false,
            isSaved: false,
          }));
          setRecipes(transformedRecipes);
        } catch (recipesErr) {
          console.warn('Failed to load recipes:', recipesErr);
          setRecipes([]);
        }
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
    username: profile?.username || viewer?.username || 'Me',
    followers: 0,
    following: 0,
    bio: profile?.bio || '',
    avatarUrl: profile?.avatar_url || viewer?.avatar_url || null,
  };

  return (
    <ProfilePage
      viewer={{ username: profileUser.username, avatar_url: profileUser.avatarUrl || null }}
      profileUser={profileUser}
      recipes={recipes}
      drafts={DRAFT_RECIPES}
      collections={MOCK_COLLECTIONS}
      isLoggedIn={isLoggedIn}
    />
  );
}
