import { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { PixelButton } from '../components/PixelButton';
import { NavBar } from '../components/NavBar';
import { getNotificationsApi, markAsReadApi, markAllAsReadApi } from '../api/noti.api';
type NotificationType = 'like' | 'comment' | 'follow' | 'system';

interface NotificationsPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

interface payload{
  action: string;
  content?: string;
}
interface Notification {
  id: string;
  type: NotificationType;
  is_read: boolean;
  payload: payload;
  actor_id?: string;
  actor_name: string;
  actor_avatar?: string;
  created_at: string;
  recipe_id: string,
  recipe_slug: string,
  recipe_title: string,
  recipe_thumbnail: string
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};


  

export function Notifications({ isLoggedIn, onLogout }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(2);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUnreadPages, setTotalUnreadPages] = useState(1);
  const [loading, setLoading] = useState(false);  
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);


  const maxVisible = 3;
  const half = Math.floor(maxVisible / 2);
  let showLeftEllipsis;
  let showRightEllipsis;
  let startPage;
  let endPage;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId') || '';
        const unreadOnly = filter === 'unread';
        const response = await getNotificationsApi(userId, page, limit, unreadOnly);
        setNotifications(response.data.notifications);
        console.log('Fetched notifications:', response.data);
        setTotalUnreadPages(response.data.meta?.totalUnreadPages || 1);
        setTotalPages(response.data.meta?.totalPages || 1);
        setUnreadCount(response.data.meta?.totalUnread || 0);
        setTotalCount(response.data.meta?.totalCount || 0);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [page, limit, isLoggedIn, filter]);

  useEffect(() => {
    if (filter === 'unread') {
      setTotalPages(totalUnreadPages);
    } else {
      setTotalPages(totalPages);
    }
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

    showLeftEllipsis = startPage > 2;
    showRightEllipsis = endPage < totalPages - 1;
  }, [filter, page, totalPages, totalUnreadPages]);

  const handleMarkAsRead = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.is_read) {
      try {
        const userId = localStorage.getItem('userId') || '';
        await markAsReadApi(notificationId, userId);
        setNotifications((prevNotifications) =>
          prevNotifications.map((n) =>
            n.id === notificationId
              ? { ...n, is_read: true }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('userId') || '';
      await markAllAsReadApi(userId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

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

  const handleFilterChange = (newFilter: 'all' | 'unread') => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when changing filter
  };



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
        <div className="mb-6 flex gap-3 items-center justify-between">
          <div className="flex gap-3">
            <button
              className={`px-6 py-3 pixel-border text-sm uppercase transition-colors ${
                filter === 'all'
                  ? 'bg-[#5D4037] text-white'
                  : 'bg-white hover:bg-[#FFF8E1]'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              All ({totalCount})
            </button>
            <button
              className={`px-6 py-3 pixel-border text-sm uppercase transition-colors ${
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
            <PixelButton 
              variant="outline" 
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </PixelButton>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="pixel-card bg-white p-12 text-center">
              <p className="text-sm text-[#5D4037]/70">Loading...</p>
            </div>
          ) : notifications.length === 0 ? (
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
            notifications.map((notification) => (
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
                      {notification.actor_name && (
                        <span className="uppercase mr-1">{notification.actor_name}</span>
                      )}
                      <span className={notification.actor_name ? '' : 'uppercase'}>
                        {notification.payload.action}
                      </span>
                      {notification.payload.content && (
                        <span>: "{notification.payload.content}"</span>
                      )}
                    </p>
                    <p className="text-xs text-[#5D4037]/50 uppercase">
                      {formatDate(notification.created_at)}
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
              disabled={page === 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="px-2 py-2 pixel-border bg-white hover:bg-[#FFF8E1] disabled:opacity-40"
            >
              ‹
            </button>

            {/* Page 1 */}
            <button
              onClick={() => setPage(1)}
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
              disabled={page === totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="px-2 py-2 pixel-border bg-white hover:bg-[#FFF8E1] disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}

        {/* Empty State for Unread Filter */}
        {filter === 'unread' && notifications.length === 0 && unreadCount === 0 && !loading && (
          <div className="text-center mt-8">
            <PixelButton 
              variant="outline" 
              onClick={() => handleFilterChange('all')}
            >
              View All Notifications
            </PixelButton>
          </div>
        )}
      </div>
    </div>
  );
}
