import { useCallback, useEffect, useMemo, useState } from 'react';
import { differenceInDays, format, isToday, isTomorrow } from 'date-fns';
import { fr } from 'date-fns/locale';

import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { calculateDistance, geocodeAddress } from '../utils/geocodingService';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export type LotWithProfile = Database['public']['Tables']['lots']['Row'] & {
  profiles: {
    business_name: string;
    business_address: string;
    business_logo_url?: string | null;
    business_type?: string | null;
    business_description?: string | null;
    business_email?: string | null;
    business_hours?: Record<string, { open: string | null; close: string | null; closed: boolean }> | null;
    phone?: string | null;
    verified?: boolean;
  };
};

export type TabId = 'product' | 'merchant' | 'details';

export interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface PickupTimeInfo {
  label: string;
  isAvailable: boolean;
  timeUntilStart: string | null;
}

interface UseLotDetailsParams {
  lotId?: string;
  activeTab: TabId;
  userProfile: ProfileRow | null;
}

interface UseLotDetailsResult {
  lot: LotWithProfile | null;
  loading: boolean;
  error: string | null;
  timeRemaining: TimeRemaining | null;
  pickupTimeInfo: PickupTimeInfo | null;
  distance: number | null;
  userLocation: { lat: number; lon: number } | null;
  similarLots: LotWithProfile[];
  similarLotsLoading: boolean;
  availableQuantity: number;
  shouldShowCountdown: boolean;
  isTimeCritical: boolean;
  refresh: () => Promise<void>;
}

const COUNTDOWN_REFRESH_INTERVAL = 1000;
const PICKUP_REFRESH_INTERVAL = 60_000;

export function useLotDetails({
  lotId,
  activeTab,
  userProfile,
}: UseLotDetailsParams): UseLotDetailsResult {
  const [lot, setLot] = useState<LotWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);
  const [pickupTimeInfo, setPickupTimeInfo] = useState<PickupTimeInfo | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [similarLots, setSimilarLots] = useState<LotWithProfile[]>([]);
  const [similarLotsLoading, setSimilarLotsLoading] = useState(false);

  const fetchLot = useCallback(async () => {
    if (!lotId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('lots')
        .select(`
          *,
          profiles!merchant_id (
            business_name,
            business_address,
            business_logo_url,
            business_type,
            business_description,
            business_email,
            business_hours,
            phone,
            verified
          )
        `)
        .eq('id', lotId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setLot((data as LotWithProfile) ?? null);
    } catch (fetchErr) {
      console.error('Erreur lors du chargement du lot:', fetchErr);
      setError('Impossible de charger ce lot. Veuillez réessayer plus tard.');
      setLot(null);
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    void fetchLot();
  }, [fetchLot]);

  const availableQuantity = useMemo(() => {
    if (!lot) {
      return 0;
    }

    return lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
  }, [lot]);

  const shouldShowCountdown = useMemo(() => {
    if (!lot) {
      return false;
    }

    return (lot.is_urgent || availableQuantity < 3) && availableQuantity > 0;
  }, [lot, availableQuantity]);

  useEffect(() => {
    if (!lot || !shouldShowCountdown) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const now = new Date();
      const pickupEnd = new Date(lot.pickup_end);

      if (pickupEnd <= now) {
        setTimeRemaining(null);
        return;
      }

      const diff = pickupEnd.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds });
    };

    updateTimeRemaining();
    const intervalId = window.setInterval(
      updateTimeRemaining,
      COUNTDOWN_REFRESH_INTERVAL,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lot, shouldShowCountdown]);

  useEffect(() => {
    if (!lot) {
      setPickupTimeInfo(null);
      return;
    }

    const computePickupInformation = () => {
      const now = new Date();
      const pickupStart = new Date(lot.pickup_start);
      const pickupEnd = new Date(lot.pickup_end);

      let label = '';
      let isAvailable = false;
      let timeUntilStart: string | null = null;

      if (isToday(pickupStart)) {
        label = "Aujourd'hui";
        isAvailable = now >= pickupStart && now <= pickupEnd;
        if (now < pickupStart) {
          const diff = pickupStart.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          timeUntilStart = hours > 0
            ? `Dans ${hours}h${minutes.toString().padStart(2, '0')}`
            : `Dans ${minutes}min`;
        }
      } else if (isTomorrow(pickupStart)) {
        label = 'Demain';
      } else {
        const daysDiff = differenceInDays(pickupStart, now);
        if (daysDiff === 2) {
          label = 'Après-demain';
        } else {
          label = format(pickupStart, 'EEEE dd MMM', { locale: fr });
        }
      }

      setPickupTimeInfo({ label, isAvailable, timeUntilStart });
    };

    computePickupInformation();
    const intervalId = window.setInterval(
      computePickupInformation,
      PICKUP_REFRESH_INTERVAL,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [lot]);

  useEffect(() => {
    if (!lot || !lot.profiles?.business_address) {
      return;
    }

    if (activeTab !== 'merchant' && activeTab !== 'product') {
      return;
    }

    let isCancelled = false;

    const calculateUserDistance = async () => {
      try {
        let userLat: number | null = null;
        let userLon: number | null = null;

        if (userProfile?.latitude && userProfile.longitude) {
          userLat = userProfile.latitude;
          userLon = userProfile.longitude;
        } else if (navigator.geolocation) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5_000,
              enableHighAccuracy: false,
            });
          });
          userLat = position.coords.latitude;
          userLon = position.coords.longitude;
        } else if (userProfile?.address) {
          const userGeocode = await geocodeAddress(userProfile.address);
          if (userGeocode.success) {
            userLat = userGeocode.latitude;
            userLon = userGeocode.longitude;
          }
        }

        if (!userLat || !userLon) {
          return;
        }

        const merchantGeocode = await geocodeAddress(lot.profiles.business_address);
        if (!merchantGeocode.success) {
          return;
        }

        if (isCancelled) {
          return;
        }

        const calculatedDistance = calculateDistance(
          userLat,
          userLon,
          merchantGeocode.latitude,
          merchantGeocode.longitude,
        );

        setDistance(calculatedDistance);
        setUserLocation({ lat: userLat, lon: userLon });
      } catch (distanceError) {
        console.error('Erreur lors du calcul de distance:', distanceError);
      }
    };

    void calculateUserDistance();

    return () => {
      isCancelled = true;
    };
  }, [lot, userProfile, activeTab]);

  useEffect(() => {
    if (!lot || activeTab !== 'merchant') {
      return;
    }

    let isCancelled = false;

    const fetchSimilarLots = async () => {
      setSimilarLotsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('lots')
          .select(`
            *,
            profiles!merchant_id (
              business_name,
              business_address,
              business_logo_url,
              business_type,
              business_description,
              business_email,
              business_hours,
              phone,
              verified
            )
          `)
          .eq('merchant_id', lot.merchant_id)
          .neq('id', lot.id)
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(4);

        if (fetchError) {
          throw fetchError;
        }

        const typedData = (data as LotWithProfile[]) ?? [];
        const available = typedData.filter((candidate) => {
          const qty =
            candidate.quantity_total -
            candidate.quantity_reserved -
            candidate.quantity_sold;
          return qty > 0;
        });

        const sorted = available.sort((a, b) => {
          const aSameCategory = a.category === lot.category ? 1 : 0;
          const bSameCategory = b.category === lot.category ? 1 : 0;
          if (aSameCategory !== bSameCategory) {
            return bSameCategory - aSameCategory;
          }

          const aPriceDiff = Math.abs(a.discounted_price - lot.discounted_price);
          const bPriceDiff = Math.abs(b.discounted_price - lot.discounted_price);
          return aPriceDiff - bPriceDiff;
        });

        if (!isCancelled) {
          setSimilarLots(sorted.slice(0, 3));
        }
      } catch (similarError) {
        console.error('Erreur lors du chargement des lots similaires:', similarError);
      } finally {
        if (!isCancelled) {
          setSimilarLotsLoading(false);
        }
      }
    };

    void fetchSimilarLots();

    return () => {
      isCancelled = true;
    };
  }, [lot, activeTab]);

  const isTimeCritical = useMemo(() => {
    return timeRemaining !== null && timeRemaining.hours === 0 && timeRemaining.minutes < 60;
  }, [timeRemaining]);

  return {
    lot,
    loading,
    error,
    timeRemaining,
    pickupTimeInfo,
    distance,
    userLocation,
    similarLots,
    similarLotsLoading,
    availableQuantity,
    shouldShowCountdown,
    isTimeCritical,
    refresh: fetchLot,
  };
}


