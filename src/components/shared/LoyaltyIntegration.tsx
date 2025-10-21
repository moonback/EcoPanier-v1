import { useEffect } from 'react';
import { useLoyalty } from '../../hooks/useLoyalty';
import { LoyaltyUtils } from '../merchant/loyalty/types';

interface LoyaltyIntegrationProps {
  merchantId: string;
  reservationId?: string;
  totalPrice?: number;
  isDonation?: boolean;
  donationAmount?: number;
}

/**
 * Composant pour intégrer automatiquement les points de fidélité
 * Utilisé lors des achats, dons, et autres actions éligibles
 */
export const LoyaltyIntegration = ({ 
  merchantId, 
  reservationId, 
  totalPrice = 0, 
  isDonation = false, 
  donationAmount = 0 
}: LoyaltyIntegrationProps) => {
  const { addPoints } = useLoyalty(merchantId);

  useEffect(() => {
    if (!merchantId || (!totalPrice && !donationAmount)) return;

    const processLoyaltyPoints = async () => {
      try {
        // Points pour achat
        if (totalPrice > 0 && !isDonation) {
          const purchasePoints = LoyaltyUtils.calculatePoints('purchase', totalPrice);
          await addPoints(
            purchasePoints,
            'earn',
            `Points gagnés pour achat de ${totalPrice}€`,
            reservationId,
            'reservation'
          );
        }

        // Points pour don
        if (donationAmount > 0) {
          const donationPoints = LoyaltyUtils.calculatePoints('donation', donationAmount);
          await addPoints(
            donationPoints,
            'earn',
            `Points gagnés pour don de ${donationAmount}€`,
            reservationId,
            'donation'
          );
        }

        // Bonus pour premier achat (géré côté serveur)
        if (totalPrice > 0) {
          await addPoints(
            10, // Bonus de bienvenue
            'bonus',
            'Bonus de bienvenue',
            reservationId,
            'welcome_bonus'
          );
        }

      } catch (error) {
        console.error('Erreur lors de l\'attribution des points de fidélité:', error);
      }
    };

    processLoyaltyPoints();
  }, [merchantId, reservationId, totalPrice, isDonation, donationAmount, addPoints]);

  // Ce composant ne rend rien, il gère juste la logique
  return null;
};

/**
 * Hook pour gérer les points de fidélité dans les composants
 */
export const useLoyaltyPoints = (merchantId: string) => {
  const { addPoints, customerLoyalty } = useLoyalty(merchantId);

  const awardPurchasePoints = async (amount: number, reservationId?: string) => {
    const points = LoyaltyUtils.calculatePoints('purchase', amount);
    return await addPoints(
      points,
      'earn',
      `Points gagnés pour achat de ${amount}€`,
      reservationId,
      'reservation'
    );
  };

  const awardDonationPoints = async (amount: number, reservationId?: string) => {
    const points = LoyaltyUtils.calculatePoints('donation', amount);
    return await addPoints(
      points,
      'earn',
      `Points gagnés pour don de ${amount}€`,
      reservationId,
      'donation'
    );
  };

  const awardReviewPoints = async (reservationId?: string) => {
    const points = LoyaltyUtils.calculatePoints('review', 1);
    return await addPoints(
      points,
      'earn',
      'Points gagnés pour avis laissé',
      reservationId,
      'review'
    );
  };

  const awardReferralPoints = async (referredUserId: string) => {
    const points = LoyaltyUtils.calculatePoints('referral', 1);
    return await addPoints(
      points,
      'earn',
      'Points gagnés pour parrainage',
      referredUserId,
      'referral'
    );
  };

  return {
    customerLoyalty,
    awardPurchasePoints,
    awardDonationPoints,
    awardReviewPoints,
    awardReferralPoints
  };
};

