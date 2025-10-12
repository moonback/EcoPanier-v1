import type { Database } from '../../../lib/database.types';

export type LotBase = Database['public']['Tables']['lots']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface LotWithMerchant extends LotBase {
  profiles: {
    business_name: string;
    business_address: string;
  };
}

export interface MerchantWithLots extends Profile {
  lots: LotBase[];
  distance?: number;
}

export interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export interface MapFilters {
  selectedCategory: string;
  maxDistance: number;
  onlyUrgent: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

