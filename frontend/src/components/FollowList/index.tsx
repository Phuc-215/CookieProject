import type { UserLite } from '@/types/User';
import { FollowListView } from './FollowListView';

interface FollowListProps {
  users: UserLite[];
  type: 'followers' | 'followings';
  isOwner: boolean;
  onUnfollow?: (id: string) => void;
  onUserClick?: (id: string) => void;
  onFollow?: (id: string) => void;
  currentUserId?: string | number;
}

export function FollowList({
  users,
  type,
  isOwner,
  onUnfollow,
  onUserClick,
  onFollow,
  currentUserId,
}: FollowListProps) {
  // Render both follow/unfollow buttons if handlers exist; FollowListView will show based on isFollowing state
  return (
    <FollowListView
      users={users}
      onUserClick={onUserClick}
      onFollow={onFollow}
      onUnfollow={onUnfollow}
      currentUserId={currentUserId}
    />
  );
}