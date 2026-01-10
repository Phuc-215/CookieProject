import type { UserLite } from '@/types/User';
import { FollowListView } from './FollowListView';

interface FollowListProps {
  users: UserLite[];
  type: 'followers' | 'followings';
  isOwner: boolean;
  onDeleteFollower?: (id: string) => void;
  onUnfollow?: (id: string) => void;
}

export function FollowList({
  users,
  type,
  isOwner,
  onDeleteFollower,
  onUnfollow,
}: FollowListProps) {
  if (!isOwner) {
    return <FollowListView users={users} />;
  }

  if (type === 'followers') {
    return (
      <FollowListView
        users={users}
        actionLabel="DELETE"
        onAction={(id) => {
          if (confirm('Remove this follower?')) {
            onDeleteFollower?.(id);
          }
        }}
      />
    );
  }

  return (
    <FollowListView
      users={users}
      actionLabel="UNFOLLOW"
      onAction={(id) => {
        if (confirm('Unfollow this user?')) {
          onUnfollow?.(id);
        }
      }}
    />
  );
}