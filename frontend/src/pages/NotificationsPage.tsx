import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { PixelButton } from '../components/PixelButton';
import { NavBar } from '../components/NavBar';
import {getNotificationsApi, markAllAsReadApi, markAsReadApi} from '@/api/noti.api';
type NotificationType = 'like' | 'comment' | 'follow' | 'system';

interface NotificationsPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}
interface Notification {
  id: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  payload: any;
  actor_id: number | null;
  actor_name: string | null;
  actor_avatar: string | null;
  recipe_id: number | null;
  recipe_slug: string | null;
  recipe_title: string | null;
  recipe_thumbnail: string | null;
}

const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const getNotificationMessage = (notification: Notification): string => {
  const { type, actor_name, recipe_title } = notification;
  const actorName = actor_name || 'Someone';
  const recipeTitle = recipe_title || 'a recipe';

  switch (type) {
    case 'like':
      return `${actorName} liked ${recipeTitle}`;
    case 'comment':
      return `${actorName} commented on ${recipeTitle}`;
    case 'follow':
      return `${actorName} started following you`;
    case 'system':
      return `${recipeTitle} is trending!`;
    default:
      return 'New notification';
  }
};


export function Notifications({ isLoggedIn, onLogout }: NotificationsPageProps) {
  // const [notifications] = useState(MOCK_NOTIFICATIONS);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await getNotificationsApi(page, limit);

        setNotifications(response.data?.data || []);
        setTotalPages(response.data?.meta?.total_pages || 1);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page, limit]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadApi();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadApi(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error(`Failed to mark notification ${notificationId} as read:`, error);
    }
  };
  
  // Fetch notifications on component mount

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 fill-[#FF8FAB] text-[#FF8FAB]" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-[#4DB6AC]" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-[#4DB6AC]" />;
      case 'system':
        return <Bell className="w-5 h-5 text-[#5D4037]" />;
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const maxVisible = 3;
  const half = Math.floor(maxVisible / 2);

  let startPage = Math.max(2, page - half);
  let endPage = Math.min(totalPages - 1, page + half);

  if (page <= half + 1) {
    startPage = 2;
    endPage = Math.min(totalPages - 1, maxVisible);
  }

  if (page >= totalPages - half) {
    endPage = totalPages - 1;
    startPage = Math.max(2, totalPages - maxVisible + 1);
  }

  const showLeftEllipsis = startPage > 2;
  const showRightEllipsis = endPage < totalPages - 1;

  return (
    <div className="min-h-screen bg-[var(--background-image)]">
      {/* Header */}
      <NavBar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        showBackButton={true}
        notificationCount={unreadCount}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="mb-6 flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-3">
            <button
              className={`px-6 py-3 pixel-border text-sm uppercase transition-colors ${
                filter === 'all'
                  ? 'bg-[#5D4037] text-white'
                  : 'bg-white hover:bg-[#FFF8E1]'
              }`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>

            <button
              className={`px-6 py-3 pixel-border text-sm uppercase transition-colors ${
                filter === 'unread'
                  ? 'bg-[#5D4037] text-white'
                  : 'bg-white hover:bg-[#FFF8E1]'
              }`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Mark all read */}
          <button
            disabled={unreadCount === 0}
            onClick={handleMarkAllAsRead}
            className={`
              px-6 py-3 pixel-border text-sm uppercase transition-colors
              ${unreadCount === 0
                ? 'bg-white text-[#5D4037]/40 cursor-not-allowed'
                : 'bg-white hover:bg-[#FFF8E1] text-[#5D4037]'
              }
            `}
          >
            Mark all read
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="pixel-card bg-white p-12 text-center">
              <Bell className="w-16 h-16 mx-auto mb-4 text-[#5D4037]/30" />
              <h3 
                className="text-sm mb-2" 
                style={{ fontFamily: "'Press Start 2P', cursive" }}
              >
                No Notifications
              </h3>
              <p className="text-sm text-[#5D4037]/70">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`pixel-card bg-white p-4 cursor-pointer transition-all hover:shadow-lg ${
                  !notification.is_read ? 'border-l-8 border-l-[#FF8FAB]' : ''
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 pixel-border flex items-center justify-center shrink-0 ${
                    notification.type === 'like' ? 'bg-[#FF8FAB]/20' :
                    notification.type === 'comment' ? 'bg-[#4DB6AC]/20' :
                    notification.type === 'follow' ? 'bg-[#4DB6AC]/20' :
                    'bg-[#FFF8E1]'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm mb-1">
                      {getNotificationMessage(notification)}
                    </p>
                    <p className="text-xs text-[#5D4037]/50 uppercase">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="w-3 h-3 bg-[#FF8FAB] rounded-full shrink-0"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/*Pagination?*/}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-1 text-sm">

            {/* Prev */}
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-2 py-2 pixel-border bg-white hover:bg-[#FFF8E1] disabled:opacity-40"
            >
              ‹
            </button>

            {/* Page 1 */}
            <button
              onClick={() => setPage(1)}
              className={`px-3 py-2 pixel-border
                ${page === 1 ? 'bg-[#5D4037] text-white' : 'bg-white hover:bg-[#FFF8E1]'}
              `}
            >
              1
            </button>

            {/* Left ellipsis */}
            {showLeftEllipsis && <span className="px-1 text-[#5D4037]/50">…</span>}

            {/* Middle pages */}
            {Array.from(
              { length: endPage - startPage + 1 },
              (_, i) => startPage + i
            ).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-2 pixel-border
                  ${p === page
                    ? 'bg-[#5D4037] text-white'
                    : 'bg-white hover:bg-[#FFF8E1]'
                  }
                `}
              >
                {p}
              </button>
            ))}

            {/* Right ellipsis */}
            {showRightEllipsis && <span className="px-1 text-[#5D4037]/50">…</span>}

            {/* Last page */}
            {totalPages > 1 && (
              <button
                onClick={() => setPage(totalPages)}
                className={`px-3 py-2 pixel-border
                  ${page === totalPages
                    ? 'bg-[#5D4037] text-white'
                    : 'bg-white hover:bg-[#FFF8E1]'
                  }
                `}
              >
                {totalPages}
              </button>
            )}

            {/* Next */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-2 py-2 pixel-border bg-white hover:bg-[#FFF8E1] disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}

        {/* Empty State for Unread Filter */}
        {filter === 'unread' && filteredNotifications.length === 0 && unreadCount === 0 && (
          <div className="text-center mt-8">
            <PixelButton 
              variant="outline" 
              onClick={() => setFilter('all')}
            >
              View All Notifications
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}
