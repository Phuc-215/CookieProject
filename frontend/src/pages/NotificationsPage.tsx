import { useState, useEffect, useMemo } from 'react';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { PixelButton } from '../components/PixelButton';
import { getNotificationsApi, markAsReadApi, markAllAsReadApi } from '../api/noti.api';
type NotificationType = 'like' | 'comment' | 'follow' | 'system';

interface NotificationsPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

interface Payload {
  action?: string;
  content?: string;
}

interface Notification {
  id: string;
  type: NotificationType;
  is_read: boolean;
  payload: Payload | null;
  actor_id?: string;
  actor_name?: string | null;
  actor_avatar?: string | null;
  created_at: string;
  recipe_id?: string | null;
  recipe_slug?: string | null;
  recipe_title?: string | null;
  recipe_thumbnail?: string | null;
}

/* ===================== HELPERS ===================== */
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/* ===================== COMPONENT ===================== */
export function Notifications({ isLoggedIn, onLogout }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [totalPages, setTotalPages] = useState(1);
  const [totalUnreadPages, setTotalUnreadPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);

  /* ===================== FETCH ===================== */
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);

        const userId = localStorage.getItem('userId');
        if (!userId) {
          setNotifications([]);
          return;
        }

        const unreadOnly = filter === 'unread';
        const res = await getNotificationsApi(userId, page, limit, unreadOnly);

        const data = res?.data ?? {};
        const meta = data.meta ?? {};

        setNotifications(
          Array.isArray(data.notifications) ? data.notifications : []
        );
        setTotalPages(meta.totalPages ?? 1);
        setTotalUnreadPages(meta.totalUnreadPages ?? 1);
        setUnreadCount(Number(meta.totalUnread ?? 0));
        setTotalCount(Number(meta.totalCount ?? 0));

      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isLoggedIn, page, limit, filter]);

  /* ===================== PAGE COUNT ===================== */
  const effectiveTotalPages =
    filter === 'unread' ? totalUnreadPages : totalPages;

  /* Clamp page */
  useEffect(() => {
    if (page > effectiveTotalPages) {
      setPage(1);
    }
  }, [page, effectiveTotalPages]);

  /* ===================== PAGINATION ===================== */
  const pagination = useMemo(() => {
    const maxVisible = 3;
    const half = Math.floor(maxVisible / 2);

    let startPage = Math.max(2, page - half);
    let endPage = Math.min(effectiveTotalPages - 1, page + half);

    if (page <= half + 1) {
      startPage = 2;
      endPage = Math.min(effectiveTotalPages - 1, maxVisible);
    }

    if (page >= effectiveTotalPages - half) {
      endPage = effectiveTotalPages - 1;
      startPage = Math.max(2, effectiveTotalPages - maxVisible + 1);
    }

    return {
      startPage,
      endPage,
      showLeftEllipsis: startPage > 2,
      showRightEllipsis: endPage < effectiveTotalPages - 1,
    };
  }, [page, effectiveTotalPages]);

  /* ===================== ACTIONS ===================== */
  const handleMarkAsRead = async (id: string) => {
    const noti = notifications.find(n => n.id === id);
    if (!noti || noti.is_read) return;

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      await markAsReadApi(id, userId);

      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(c => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      await markAllAsReadApi(userId);

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleFilterChange = (f: 'all' | 'unread') => {
    if (f === filter) return;
    setFilter(f);
    setPage(1);
  };

  /* ===================== ICON ===================== */
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 fill-[#FF8FAB] text-[#FF8FAB]" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-[#4DB6AC]" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-[#4DB6AC]" />;
      default:
        return <Bell className="w-5 h-5 text-[#5D4037]" />;
    }
  };

  const getTypeBgClass = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return 'bg-[#FF8FAB]/20';
      case 'comment':
        return 'bg-[#4DB6AC]/20';
      case 'follow':
        return 'bg-[#4DB6AC]/20';
      case 'system':
      default:
        return 'bg-[#FFF8E1]';
    }
  };
  const getNotificationMessage = (n: Notification) => {
    const user = n.actor_name ?? 'Someone';
    const recipe = n.recipe_title
      ? `"${n.recipe_title}"`
      : 'your recipe';

    switch (n.type) {
      case 'follow':
        return `${user} followed you`;

      case 'like':
        return `${user} liked ${recipe}`;

      case 'comment':
        return `${user} commented on ${recipe}`;

      case 'system':
      default:
        return n.payload?.action ?? 'System notification';
    }
  };
  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-[var(--background-image)]">

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex gap-3 items-center justify-between">
          <div className="flex gap-3">
            <button
              className={`px-6 py-3 pixel-border text-sm uppercase ${
                filter === 'all'
                  ? 'bg-[#5D4037] text-white'
                  : 'bg-white hover:bg-[#FFF8E1]'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All ({totalCount})
            </button>
            <button
              className={`px-6 py-3 pixel-border text-sm uppercase ${
                filter === 'unread'
                  ? 'bg-[#5D4037] text-white'
                  : 'bg-white hover:bg-[#FFF8E1]'
              }`}
              onClick={() => handleFilterChange('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <PixelButton variant="outline" onClick={handleMarkAllAsRead}>
              Mark All Read
            </PixelButton>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="pixel-card bg-white p-12 text-center">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="pixel-card bg-white p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-[#5D4037]/30" />
              <p className="text-sm">
                {filter === 'unread'
                  ? "You're all caught up!"
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            notifications.map(n => {
              const payload = n.payload ?? {};
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`pixel-card bg-white p-4 cursor-pointer ${
                    !n.is_read ? 'border-l-8 border-l-[#FF8FAB]' : ''
                  }`}
                >
                  <div className="flex gap-4">
                <div className={`w-12 h-12 pixel-border flex items-center justify-center shrink-0 ${getTypeBgClass(n.type)}`}>
                  {getNotificationIcon(n.type)}
                </div>

                    <div className="flex-1">
                      <p className="text-sm">
                        {getNotificationMessage(n)}
                      </p>
                      <p className="text-xs text-[#5D4037]/50">
                        {formatDate(n.created_at)}
                      </p>
                    </div>

                    {!n.is_read && (
                      <div className="w-3 h-3 bg-[#FF8FAB] rounded-full" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {effectiveTotalPages > 1 && (
          <div className="mt-8 flex justify-center gap-1">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
            >
              ‹
            </button>

            <button onClick={() => setPage(1)}>1</button>

            {pagination.showLeftEllipsis && <span>…</span>}

            {Array.from(
              { length: pagination.endPage - pagination.startPage + 1 },
              (_, i) => pagination.startPage + i
            ).map(p => (
              <button key={p} onClick={() => setPage(p)}>
                {p}
              </button>
            ))}

            {pagination.showRightEllipsis && <span>…</span>}

            <button onClick={() => setPage(effectiveTotalPages)}>
              {effectiveTotalPages}
            </button>

            <button
              disabled={page === effectiveTotalPages || loading}
              onClick={() => setPage(p => p + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}