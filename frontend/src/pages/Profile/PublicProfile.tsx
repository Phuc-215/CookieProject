import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getUserProfileApi(id);
        if (!active) return;
        setProfile(res.data);
      } catch (err: any) {
        if (!active) return;
        const msg = err?.response?.data?.message || 'Failed to load profile';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const profileUser = useMemo(() => {
    if (!profile) {
      return {
        username: 'Loading...',
        followers: 0,
        following: 0,
        bio: '',
        avatarUrl: null,
      };
    }

    return {
      username: profile.username,
      followers: 0,
      following: 0,
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
      profileUser={profileUser}
      recipes={MOCK_RECIPES}
      collections={MOCK_COLLECTIONS}
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
    />
  );
}