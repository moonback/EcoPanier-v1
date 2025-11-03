import { useState } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/stores/authStore';
import type { Notification } from '@/utils/notificationService';

export const NotificationCenter = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id);

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      confirmation: '✅',
      reminder: '⏰',
      opportunity: '🔥',
      social: '🌍',
      feedback: '📝',
      system: 'ℹ️',
    };
    return icons[type] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      confirmation: 'text-success-600',
      reminder: 'text-warning-600',
      opportunity: 'text-accent-600',
      social: 'text-primary-600',
      feedback: 'text-secondary-600',
      system: 'text-neutral-600',
    };
    return colors[type] || 'text-neutral-600';
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative p-2 rounded-lg transition-all duration-200
          ${isOpen
            ? 'bg-primary-100 text-primary-600'
            : 'hover:bg-neutral-100 text-neutral-600'
          }
        `}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Badge pour les non lues */}
        {unreadCount > 0 && (
          <span className="
            absolute top-1 right-1 w-5 h-5 rounded-full
            bg-accent-500 text-white text-xs font-bold
            flex items-center justify-center animate-pulse
          ">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="
          absolute right-0 top-12 w-96 max-h-96 overflow-y-auto
          bg-white rounded-large shadow-soft-lg border border-neutral-100
          z-50 animate-fade-scale-in
        ">
          {/* Header */}
          <div className="sticky top-0 p-4 border-b border-neutral-100 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-neutral-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mark All As Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="
                  text-xs font-semibold text-primary-600 hover:text-primary-700
                  flex items-center gap-1
                "
              >
                <CheckCheck className="w-4 h-4" />
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="p-8 text-center text-neutral-500">
              Chargement...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-neutral-100">
              {notifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  icon={getNotificationIcon(notification.type)}
                  iconColor={getNotificationColor(notification.type)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Composant pour une notification
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  icon: string;
  iconColor: string;
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
  icon,
  iconColor,
}: NotificationItemProps) => {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead();
    }
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        p-4 cursor-pointer transition-all duration-200 hover:bg-neutral-50
        ${!notification.read ? 'bg-primary-50 border-l-4 border-primary-500' : ''}
      `}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`text-xl flex-shrink-0 ${iconColor}`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-neutral-900 truncate">
            {notification.title}
          </h4>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            {formatTime(notification.created_at)}
          </p>
        </div>

        {/* Mark as Read Button */}
        {!notification.read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
            className="flex-shrink-0 p-2 hover:bg-white rounded-lg"
            aria-label="Marquer comme lu"
          >
            <Check className="w-4 h-4 text-primary-600" />
          </button>
        )}
      </div>
    </div>
  );
};

// Fonction helper pour formater le temps
function formatTime(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}j`;

  return date.toLocaleDateString('fr-FR');
} 