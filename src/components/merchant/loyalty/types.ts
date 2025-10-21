import type { Database } from '../../lib/database.types';

// Types pour le système de fidélité
export type LoyaltyProgram = Database['public']['Tables']['loyalty_programs']['Row'];
export type LoyaltyProgramInsert = Database['public']['Tables']['loyalty_programs']['Insert'];
export type LoyaltyProgramUpdate = Database['public']['Tables']['loyalty_programs']['Update'];

export type CustomerLoyalty = Database['public']['Tables']['customer_loyalty']['Row'];
export type CustomerLoyaltyInsert = Database['public']['Tables']['customer_loyalty']['Insert'];
export type CustomerLoyaltyUpdate = Database['public']['Tables']['customer_loyalty']['Update'];

export type LoyaltyReward = Database['public']['Tables']['loyalty_rewards']['Row'];
export type LoyaltyRewardInsert = Database['public']['Tables']['loyalty_rewards']['Insert'];
export type LoyaltyRewardUpdate = Database['public']['Tables']['loyalty_rewards']['Update'];

export type LoyaltyTransaction = Database['public']['Tables']['loyalty_transactions']['Row'];
export type LoyaltyTransactionInsert = Database['public']['Tables']['loyalty_transactions']['Insert'];

// Types pour les badges et niveaux
export interface LoyaltyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  pointsRequired: number;
  category: 'purchase' | 'donation' | 'streak' | 'special';
}

export interface LoyaltyLevel {
  id: string;
  name: string;
  description: string;
  color: string;
  pointsRequired: number;
  benefits: string[];
  icon: string;
}

// Configuration des niveaux de fidélité
export const LOYALTY_LEVELS: LoyaltyLevel[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    description: 'Débutant Anti-Gaspi',
    color: 'from-amber-500 to-amber-600',
    pointsRequired: 0,
    benefits: ['Accès aux lots réduits', 'Notifications des nouveaux lots'],
    icon: '🥉'
  },
  {
    id: 'silver',
    name: 'Argent',
    description: 'Engagé Anti-Gaspi',
    color: 'from-gray-400 to-gray-500',
    pointsRequired: 100,
    benefits: ['Réduction 5% sur tous les lots', 'Accès prioritaire aux créneaux'],
    icon: '🥈'
  },
  {
    id: 'gold',
    name: 'Or',
    description: 'Expert Anti-Gaspi',
    color: 'from-yellow-400 to-yellow-500',
    pointsRequired: 300,
    benefits: ['Réduction 10% sur tous les lots', 'Lots exclusifs', 'Invitations événements'],
    icon: '🥇'
  },
  {
    id: 'platinum',
    name: 'Platine',
    description: 'Ambassadeur Anti-Gaspi',
    color: 'from-purple-400 to-purple-500',
    pointsRequired: 600,
    benefits: ['Réduction 15% sur tous les lots', 'Accès VIP', 'Programme parrainage'],
    icon: '💎'
  }
];

// Configuration des badges
export const LOYALTY_BADGES: LoyaltyBadge[] = [
  // Badges d'achat
  {
    id: 'first_purchase',
    name: 'Premier Pas',
    description: 'Premier achat anti-gaspi',
    icon: '👶',
    color: 'from-blue-400 to-blue-500',
    pointsRequired: 1,
    category: 'purchase'
  },
  {
    id: 'frequent_buyer',
    name: 'Acheteur Régulier',
    description: '10 achats effectués',
    icon: '🛒',
    color: 'from-green-400 to-green-500',
    pointsRequired: 10,
    category: 'purchase'
  },
  {
    id: 'big_spender',
    name: 'Gros Acheteur',
    description: '50€ dépensés',
    icon: '💰',
    color: 'from-yellow-400 to-yellow-500',
    pointsRequired: 50,
    category: 'purchase'
  },
  
  // Badges de don
  {
    id: 'first_donation',
    name: 'Premier Don',
    description: 'Premier panier suspendu offert',
    icon: '🎁',
    color: 'from-pink-400 to-pink-500',
    pointsRequired: 1,
    category: 'donation'
  },
  {
    id: 'generous_donor',
    name: 'Donateur Généreux',
    description: '5 paniers suspendus offerts',
    icon: '💝',
    color: 'from-red-400 to-red-500',
    pointsRequired: 5,
    category: 'donation'
  },
  
  // Badges de série
  {
    id: 'weekly_streak',
    name: 'Série Hebdomadaire',
    description: 'Achat chaque semaine pendant 4 semaines',
    icon: '📅',
    color: 'from-indigo-400 to-indigo-500',
    pointsRequired: 4,
    category: 'streak'
  },
  {
    id: 'monthly_streak',
    name: 'Série Mensuelle',
    description: 'Achat chaque mois pendant 3 mois',
    icon: '🗓️',
    color: 'from-purple-400 to-purple-500',
    pointsRequired: 3,
    category: 'streak'
  },
  
  // Badges spéciaux
  {
    id: 'eco_warrior',
    name: 'Guerrier Écologique',
    description: '100 repas sauvés du gaspillage',
    icon: '🌍',
    color: 'from-emerald-400 to-emerald-500',
    pointsRequired: 100,
    category: 'special'
  },
  {
    id: 'community_hero',
    name: 'Héros Communautaire',
    description: 'Parrainage de 5 nouveaux utilisateurs',
    icon: '🦸',
    color: 'from-orange-400 to-orange-500',
    pointsRequired: 5,
    category: 'special'
  }
];

// Types pour les récompenses
export interface LoyaltyRewardType {
  id: string;
  name: string;
  description: string;
  type: 'discount' | 'free_item' | 'priority_access' | 'exclusive_content';
  value: number;
  pointsCost: number;
  icon: string;
  color: string;
}

export const LOYALTY_REWARDS: LoyaltyRewardType[] = [
  {
    id: 'discount_5',
    name: 'Réduction 5%',
    description: '5% de réduction sur votre prochain achat',
    type: 'discount',
    value: 5,
    pointsCost: 50,
    icon: '🎫',
    color: 'from-green-400 to-green-500'
  },
  {
    id: 'discount_10',
    name: 'Réduction 10%',
    description: '10% de réduction sur votre prochain achat',
    type: 'discount',
    value: 10,
    pointsCost: 100,
    icon: '🎟️',
    color: 'from-blue-400 to-blue-500'
  },
  {
    id: 'free_coffee',
    name: 'Café Gratuit',
    description: 'Un café offert dans nos partenaires',
    type: 'free_item',
    value: 0,
    pointsCost: 75,
    icon: '☕',
    color: 'from-amber-400 to-amber-500'
  },
  {
    id: 'priority_access',
    name: 'Accès Prioritaire',
    description: 'Accès 1h avant les autres aux nouveaux lots',
    type: 'priority_access',
    value: 0,
    pointsCost: 150,
    icon: '⚡',
    color: 'from-purple-400 to-purple-500'
  },
  {
    id: 'exclusive_lot',
    name: 'Lot Exclusif',
    description: 'Accès à un lot exclusif réservé aux membres fidèles',
    type: 'exclusive_content',
    value: 0,
    pointsCost: 200,
    icon: '👑',
    color: 'from-yellow-400 to-yellow-500'
  }
];

// Utilitaires pour le système de fidélité
export const LoyaltyUtils = {
  // Calculer le niveau actuel basé sur les points
  getCurrentLevel: (points: number): LoyaltyLevel => {
    const levels = [...LOYALTY_LEVELS].reverse(); // Du plus haut au plus bas
    return levels.find(level => points >= level.pointsRequired) || LOYALTY_LEVELS[0];
  },

  // Calculer les points jusqu'au prochain niveau
  getPointsToNextLevel: (points: number): number => {
    const currentLevel = LoyaltyUtils.getCurrentLevel(points);
    const nextLevel = LOYALTY_LEVELS.find(level => level.pointsRequired > points);
    return nextLevel ? nextLevel.pointsRequired - points : 0;
  },

  // Calculer le pourcentage de progression vers le prochain niveau
  getProgressPercentage: (points: number): number => {
    const currentLevel = LoyaltyUtils.getCurrentLevel(points);
    const nextLevel = LOYALTY_LEVELS.find(level => level.pointsRequired > points);
    
    if (!nextLevel) return 100;
    
    const currentLevelPoints = currentLevel.pointsRequired;
    const nextLevelPoints = nextLevel.pointsRequired;
    const progress = ((points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  },

  // Calculer les points gagnés pour une action
  calculatePoints: (action: 'purchase' | 'donation' | 'review' | 'referral', value: number): number => {
    const multipliers = {
      purchase: 1,      // 1 point par euro dépensé
      donation: 5,      // 5 points par euro donné
      review: 10,       // 10 points par avis
      referral: 25      // 25 points par parrainage
    };
    
    return Math.floor(value * multipliers[action]);
  },

  // Vérifier si un badge est débloqué
  isBadgeUnlocked: (badgeId: string, userStats: any): boolean => {
    const badge = LOYALTY_BADGES.find(b => b.id === badgeId);
    if (!badge) return false;

    switch (badge.category) {
      case 'purchase':
        return userStats.totalPurchases >= badge.pointsRequired;
      case 'donation':
        return userStats.totalDonations >= badge.pointsRequired;
      case 'streak':
        return userStats.currentStreak >= badge.pointsRequired;
      case 'special':
        return userStats.specialActions >= badge.pointsRequired;
      default:
        return false;
    }
  }
};

