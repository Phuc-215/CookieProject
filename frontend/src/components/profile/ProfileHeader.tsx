import { User as UserIcon, Settings, Plus } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';
import { useState, useEffect } from 'react';
import { followUserApi, unfollowUserApi, getFollowStatusApi } from '@/api/user.api';
import {
  FollowersModal,
  FollowingsModal,
} from '@/components/modals/FollowModal';

interface ProfileHeaderProps {
  user: {
    id?: string | number;
    username: string;
    recipes: number;
    followers: number;
    following: number;
    bio: string;
    avatarUrl?: string | null;
  };
  isOwner: boolean;
  isLoggedIn: boolean;
  onEditProfile: () => void;
  onCreateRecipe: () => void;
}

export function ProfileHeader({
  user,
  isOwner,
  isLoggedIn,
  onEditProfile,
  onCreateRecipe,
}: ProfileHeaderProps) {
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowings, setOpenFollowings] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(user.followers);
  const [followingCount, setFollowingCount] = useState(user.following);

  // Sync counts when user prop changes
  useEffect(() => {
    setFollowersCount(user.followers);
    setFollowingCount(user.following);
  }, [user.followers, user.following]);

  // Fetch initial follow status for non-owner profiles only when logged in
  useEffect(() => {
    if (isLoggedIn && !isOwner && user.id) {
      getFollowStatusApi(user.id)
        .then((res) => setIsFollowing(res.data.isFollowing))
        .catch(() => {}); // silently fail if not authenticated
    }
  }, [user.id, isOwner, isLoggedIn]);

  const handleFollow = async () => {
    if (!user.id) return;
    try {
      setFollowLoading(true);
      await followUserApi(user.id);
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);

      // bump viewer's following_count in localStorage if present
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.following_count = (parsed.following_count || 0) + 1;
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch (err: any) {
      const code = err?.response?.data?.message;
      if (code === 'ALREADY_FOLLOWING') {
        setIsFollowing(true);
      }
      // silently close; could add toasts if desired
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user.id) return;
    try {
      setFollowLoading(true);
      await unfollowUserApi(user.id);
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));

      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.following_count = Math.max(0, (parsed.following_count || 0) - 1);
        localStorage.setItem('user', JSON.stringify(parsed));
      }
    } catch (err: any) {
      const code = err?.response?.data?.message;
      if (code === 'NOT_FOLLOWING') {
        setIsFollowing(false);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <div className="pixel-card bg-white p-8 mb-8">
      <div className="flex gap-8">
        {/* Avatar */}
        <div className="w-32 h-32 pixel-border bg-[var(--primary)] flex items-center justify-center overflow-hidden">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="w-16 h-16 text-black" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-3xl mb-4">{user.username}</h2>

          {/* Stats */}
          <div className="flex gap-8 mb-4 text-sm uppercase">
            <div>
              <div className="font-bold text-center">{user.recipes}</div>
              <div className="opacity-60">Recipes</div>
            </div>

            <button 
              onClick={() => setOpenFollowers(true)}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="font-bold text-center">{followersCount}</div>
              <div className="opacity-60">Followers</div>
            </button>

            <button 
              onClick={() => setOpenFollowings(true)}
              className="hover:opacity-70 transition-opacity cursor-pointer"
            >
              <div className="font-bold text-center">{followingCount}</div>
              <div className="opacity-60">Following</div>
            </button>
          </div>

          {/* Bio */}
          <p className="mb-6 max-w-xl">{user.bio}</p>

          {/* Actions */}
          {isOwner ? (
            <div className="flex gap-4">
                <PixelButton onClick={onEditProfile} variant="outline">
                <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Edit Profile
                </span>
                </PixelButton>

                <PixelButton onClick={onCreateRecipe} variant="primary">
                <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Recipe
                </span>
                </PixelButton>
            </div>
          ) : (
            isLoggedIn ? (
              isFollowing ? (
                <PixelButton variant="outline" onClick={handleUnfollow} disabled={followLoading}>
                  Unfollow
                </PixelButton>
              ) : (
                <PixelButton onClick={handleFollow} disabled={followLoading}>
                  + Follow
                </PixelButton>
              )
            ) : null
          )}
        </div>
      </div>

      {openFollowers && user.id && (
        <FollowersModal
          userId={user.id}
          isOwner={isOwner}
          onClose={() => setOpenFollowers(false)}
        />
      )}

      {openFollowings && user.id && (
        <FollowingsModal
          userId={user.id}
          isOwner={isOwner}
          onClose={() => setOpenFollowings(false)}
        />
      )}
    </div>
  );
}