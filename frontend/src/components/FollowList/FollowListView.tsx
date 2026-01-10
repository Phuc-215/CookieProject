import { Avatar } from '@/components/Avatar';
import { useNav } from '@/hooks/useNav';
import type { UserLite } from '@/types/User';

interface FollowListViewProps {
  users: UserLite[];
  onUserClick?: (id: string) => void;
  onFollow?: (id: string) => void;
  onUnfollow?: (id: string) => void;
  currentUserId?: string | number;
}

export function FollowListView({
  users,
  onUserClick,
  onFollow,
  onUnfollow,
  currentUserId,
}: FollowListViewProps) {
  const nav = useNav();

  const handleUserClick = (id: string) => {
    if (onUserClick) {
      onUserClick(id);
    } else {
      nav.profile(id);
    }
  };

  return (
    <div className="space-y-3">
      {users.map((u) => {
        console.log(`Rendering user ${u.name} (${u.id}):`, {
          isFollowing: u.isFollowing,
          currentUserId,
          isSelf: String(currentUserId ?? '') === u.id,
          hasOnFollow: !!onFollow,
          hasOnUnfollow: !!onUnfollow,
          shouldShowFollow: onFollow && !u.isFollowing && String(currentUserId ?? '') !== u.id,
          shouldShowUnfollow: onUnfollow && u.isFollowing && String(currentUserId ?? '') !== u.id,
        });
        
        return (
          <div
            key={u.id}
            className="flex items-center justify-between pixel-border px-4 py-3"
          >
            <button
              className="flex items-center gap-3 text-left hover:opacity-80"
              onClick={() => handleUserClick(u.id)}
            >
              <Avatar src={u.avatar} />
              <span className="text-sm">{u.name}</span>
            </button>

            <div className="flex gap-2">
              {onFollow && !u.isFollowing && String(currentUserId ?? '') !== u.id && (
                <button
                  type="button"
                  className="px-3 py-1 text-xs pixel-border bg-[var(--primary)] hover:opacity-80 cursor-pointer"
                  onClick={() => onFollow(u.id)}
                >
                  Follow
                </button>
              )}
              {onUnfollow && u.isFollowing && String(currentUserId ?? '') !== u.id && (
                <button
                  type="button"
                  className="px-3 py-1 text-xs pixel-border bg-red-200 hover:opacity-80 cursor-pointer"
                  onClick={() => onUnfollow(u.id)}
                >
                  Unfollow
                </button>
              )}
            </div>
          </div>
        );
      })}

      {users.length === 0 && (
        <p className="text-center text-xs text-gray-400">
          No users found
        </p>
      )}
    </div>
  );
}