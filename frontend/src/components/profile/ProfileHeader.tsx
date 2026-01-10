import { User as UserIcon, Settings, Plus } from 'lucide-react';
import { PixelButton } from '@/components/PixelButton';
import { useState } from 'react';
import {
  FollowersModal,
  FollowingsModal,
} from '@/components/modals/FollowModal';

interface ProfileHeaderProps {
  user: {
    username: string;
    recipes: number;
    followers: number;
    following: number;
    bio: string;
    avatarUrl?: string | null;
  };
  isOwner: boolean;
  onEditProfile: () => void;
  onCreateRecipe: () => void;
}

export function ProfileHeader({
  user,
  isOwner,
  onEditProfile,
  onCreateRecipe,
}: ProfileHeaderProps) {
  const [openFollowers, setOpenFollowers] = useState(false);
  const [openFollowings, setOpenFollowings] = useState(false);

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

            <button onClick={() => setOpenFollowers(true)}>
              <div className="font-bold text-center">{user.followers}</div>
              <div className="opacity-60">Followers</div>
            </button>

            <button onClick={() => setOpenFollowings(true)}>
              <div className="font-bold text-center">{user.following}</div>
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
            <PixelButton>+ Follow</PixelButton>
          )}
        </div>
      </div>

      {openFollowers && (
        <FollowersModal
          isOwner={isOwner}
          onClose={() => setOpenFollowers(false)}
        />
      )}

      {openFollowings && (
        <FollowingsModal
          isOwner={isOwner}
          onClose={() => setOpenFollowings(false)}
        />
      )}
    </div>
  );
}