import { Avatar } from '@/components/Avatar';
import { useNav } from '@/hooks/useNav';
import type { UserLite } from '@/types/User';

interface FollowListViewProps {
  users: UserLite[];
  actionLabel?: string;
  onAction?: (id: string) => void;
}

export function FollowListView({
  users,
  actionLabel,
  onAction,
}: FollowListViewProps) {
  const nav = useNav();

  return (
    <div className="space-y-3">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between pixel-border px-4 py-3"
        >
          <button
            className="flex items-center gap-3 text-left hover:opacity-80"
            onClick={() => nav.profile(u.id)}
          >
            <Avatar src={u.avatar} />
            <span className="text-sm">{u.name}</span>
          </button>

          {actionLabel && onAction && (
            <button
              className="px-3 py-1 text-xs pixel-border bg-[var(--primary)]"
              onClick={() => onAction(u.id)}
            >
              {actionLabel}
            </button>
          )}
        </div>
      ))}

      {users.length === 0 && (
        <p className="text-center text-xs text-gray-400">
          No users found
        </p>
      )}
    </div>
  );
}