import { useState, useEffect } from 'react';
import { Star, X, CheckCircle } from 'lucide-react';

interface LoyaltyNotificationProps {
  points: number;
  reason: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const LoyaltyNotification = ({ 
  points, 
  reason, 
  isVisible, 
  onClose, 
  duration = 5000 
}: LoyaltyNotificationProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Attendre la fin de l'animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white shadow-2xl max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Star size={20} className="text-yellow-300" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-300" />
              <span className="font-bold text-lg">+{points} points</span>
            </div>
            <p className="text-purple-100 text-sm">{reason}</p>
          </div>
          
          <button
            onClick={onClose}
            className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
        
        {/* Barre de progression */}
        <div className="mt-3 w-full bg-white/20 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1 rounded-full transition-all duration-1000"
            style={{ 
              width: '100%',
              animation: 'shrink 5s linear forwards'
            }}
          ></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Composant pour afficher les notifications de fidélité dans l'app
interface LoyaltyNotificationManagerProps {
  merchantId: string;
}

export const LoyaltyNotificationManager = ({ merchantId }: LoyaltyNotificationManagerProps) => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    points: number;
    reason: string;
    isVisible: boolean;
  }>>([]);

  // Écouter les événements de fidélité
  useEffect(() => {
    const handleLoyaltyEvent = (event: CustomEvent) => {
      const { points, reason } = event.detail;
      
      const notification = {
        id: Date.now().toString(),
        points,
        reason,
        isVisible: true
      };
      
      setNotifications(prev => [...prev, notification]);
    };

    window.addEventListener('loyalty-points-earned', handleLoyaltyEvent as EventListener);
    
    return () => {
      window.removeEventListener('loyalty-points-earned', handleLoyaltyEvent as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {notifications.map(notification => (
        <LoyaltyNotification
          key={notification.id}
          points={notification.points}
          reason={notification.reason}
          isVisible={notification.isVisible}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </>
  );
};

// Fonction utilitaire pour déclencher une notification
export const triggerLoyaltyNotification = (points: number, reason: string) => {
  const event = new CustomEvent('loyalty-points-earned', {
    detail: { points, reason }
  });
  window.dispatchEvent(event);
};

