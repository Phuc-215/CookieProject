import { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Bell } from 'lucide-react';
import { PixelButton } from '../components/PixelButton';
import { NavBar } from '../components/NavBar';

type NotificationType = 'like' | 'comment' | 'follow' | 'system';

interface NotificationsPageProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}
interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  user?: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'like',
    message: 'liked your recipe "Classic Chocolate Chip Cookies"',
    user: 'SweetChef',
    timestamp: '5 min ago',
    isRead: false,
    link: 'recipe-detail',
  },
  {
    id: '2',
    type: 'comment',
    message: 'commented on your recipe "Rainbow Macarons"',
    user: 'BakerBob',
    timestamp: '1 hour ago',
    isRead: false,
    link: 'recipe-detail',
  },
  {
    id: '3',
    type: 'follow',
    message: 'started following you',
    user: 'CookieFan',
    timestamp: '2 hours ago',
    isRead: false,
    link: 'public-profile',
  },
  {
    id: '4',
    type: 'like',
    message: 'and 12 others liked your recipe "Fudgy Brownies"',
    user: 'DonutDave',
    timestamp: '3 hours ago',
    isRead: true,
    link: 'recipe-detail',
  },
  {
    id: '5',
    type: 'system',
    message: 'Your recipe "Vanilla Cupcakes" is trending! 🔥',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: '6',
    type: 'comment',
    message: 'replied to your comment',
    user: 'ChocMaster',
    timestamp: '2 days ago',
    isRead: true,
    link: 'recipe-detail',
  },
  {
    id: '7',
    type: 'follow',
    message: 'started following you',
    user: 'PixelBaker',
    timestamp: '3 days ago',
    isRead: true,
    link: 'public-profile',
  },
];

export function Notifications({ isLoggedIn, onLogout }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
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
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
        <div className="mb-6 flex gap-3">
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
                  !notification.isRead ? 'border-l-8 border-l-[#FF8FAB]' : ''
                }`}
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
                      {notification.user && (
                        <span className="uppercase mr-1">{notification.user}</span>
                      )}
                      <span className={notification.user ? '' : 'uppercase'}>
                        {notification.message}
                      </span>
                    </p>
                    <p className="text-xs text-[#5D4037]/50 uppercase">
                      {notification.timestamp}
                    </p>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="w-3 h-3 bg-[#FF8FAB] rounded-full shrink-0"></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

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
