import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { MOCK_COLLECTIONS } from "@/mocks/mock_collection";
import { MOCK_RECIPES } from "@/mocks/mock_recipe";
import { getUserProfileApi } from '@/api/user.api';
import type { UserProfile } from '@/types/User';

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

export function PublicProfile({ isLoggedIn, viewer, onLogout }: PublicProfileProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    (async () => {
      try {
        setError(null);
        const res = await getUserProfileApi(id);
        if (!active) return;
        setProfile(res.data);
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
    };
  }, [profile]);

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
      recipes={MOCK_RECIPES}
      collections={MOCK_COLLECTIONS}
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
    />
  );
}