export type UserRole = 'customer' | 'merchant' | 'beneficiary' | 'collector' | 'admin' | 'association';
export type LotStatus = 'available' | 'reserved' | 'sold_out' | 'expired';
export type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type MissionStatus = 'available' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
export type MetricType = 'meals_saved' | 'co2_saved' | 'money_saved' | 'donations_made';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type VehicleType = 'bike' | 'ebike' | 'scooter' | 'car' | 'van';
export type EquipmentType = 'cooler_bag' | 'large_cooler' | 'thermal_box' | 'delivery_bag';
export type DeliveryZone = 'center' | 'suburbs' | 'outskirts' | 'all';
export type AvailabilitySlot = 'morning' | 'afternoon' | 'evening' | 'flexible';
export type WalletTransactionType = 'recharge' | 'payment' | 'refund';
export type WalletTransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type WalletReferenceType = 'reservation' | 'suspended_basket' | 'mission';

export interface CollectorPreferences {
  vehicle_type: VehicleType;
  equipment: EquipmentType[];
  delivery_zones: DeliveryZone[];
  availability: AvailabilitySlot[];
  max_distance: number;
  accepts_cold_chain: boolean;
  bio: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          address: string | null;
          business_name: string | null;
          business_address: string | null;
          business_logo_url: string | null;
          business_hours: Record<string, { open: string | null; close: string | null; closed: boolean }> | null;
          siret: string | null;
          business_type: string | null;
          business_email: string | null;
          business_description: string | null;
          vat_number: string | null;
          latitude: number | null;
          longitude: number | null;
          beneficiary_id: string | null;
          verified: boolean;
          collector_preferences: CollectorPreferences | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role: UserRole;
          full_name: string;
          phone?: string | null;
          address?: string | null;
          business_name?: string | null;
          business_address?: string | null;
          business_logo_url?: string | null;
          business_hours?: Record<string, { open: string | null; close: string | null; closed: boolean }> | null;
          siret?: string | null;
          business_type?: string | null;
          business_email?: string | null;
          business_description?: string | null;
          vat_number?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          beneficiary_id?: string | null;
          verified?: boolean;
          collector_preferences?: CollectorPreferences | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          address?: string | null;
          business_name?: string | null;
          business_address?: string | null;
          business_logo_url?: string | null;
          business_hours?: Record<string, { open: string | null; close: string | null; closed: boolean }> | null;
          siret?: string | null;
          business_type?: string | null;
          business_email?: string | null;
          business_description?: string | null;
          vat_number?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          beneficiary_id?: string | null;
          verified?: boolean;
          collector_preferences?: CollectorPreferences | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lots: {
        Row: {
          id: string;
          merchant_id: string;
          title: string;
          description: string;
          category: string;
          original_price: number;
          discounted_price: number;
          quantity_total: number;
          quantity_reserved: number;
          quantity_sold: number;
          pickup_start: string;
          pickup_end: string;
          requires_cold_chain: boolean;
          is_urgent: boolean;
          is_free: boolean;
          status: LotStatus;
          image_urls: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          title: string;
          description: string;
          category: string;
          original_price: number;
          discounted_price: number;
          quantity_total: number;
          quantity_reserved?: number;
          quantity_sold?: number;
          pickup_start: string;
          pickup_end: string;
          requires_cold_chain?: boolean;
          is_urgent?: boolean;
          is_free?: boolean;
          status?: LotStatus;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          title?: string;
          description?: string;
          category?: string;
          original_price?: number;
          discounted_price?: number;
          quantity_total?: number;
          quantity_reserved?: number;
          quantity_sold?: number;
          pickup_start?: string;
          pickup_end?: string;
          requires_cold_chain?: boolean;
          is_urgent?: boolean;
          is_free?: boolean;
          status?: LotStatus;
          image_urls?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          lot_id: string;
          user_id: string;
          quantity: number;
          total_price: number;
          pickup_pin: string;
          status: ReservationStatus;
          is_donation: boolean;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          lot_id: string;
          user_id: string;
          quantity: number;
          total_price: number;
          pickup_pin: string;
          status?: ReservationStatus;
          is_donation?: boolean;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          lot_id?: string;
          user_id?: string;
          quantity?: number;
          total_price?: number;
          pickup_pin?: string;
          status?: ReservationStatus;
          is_donation?: boolean;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
      missions: {
        Row: {
          id: string;
          merchant_id: string;
          collector_id: string | null;
          title: string;
          description: string;
          pickup_address: string;
          delivery_address: string;
          pickup_latitude: number | null;
          pickup_longitude: number | null;
          delivery_latitude: number | null;
          delivery_longitude: number | null;
          requires_cold_chain: boolean;
          is_urgent: boolean;
          payment_amount: number;
          status: MissionStatus;
          proof_urls: string[];
          created_at: string;
          accepted_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          collector_id?: string | null;
          title: string;
          description: string;
          pickup_address: string;
          delivery_address: string;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          delivery_latitude?: number | null;
          delivery_longitude?: number | null;
          requires_cold_chain?: boolean;
          is_urgent?: boolean;
          payment_amount: number;
          status?: MissionStatus;
          proof_urls?: string[];
          created_at?: string;
          accepted_at?: string | null;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          collector_id?: string | null;
          title?: string;
          description?: string;
          pickup_address?: string;
          delivery_address?: string;
          pickup_latitude?: number | null;
          pickup_longitude?: number | null;
          delivery_latitude?: number | null;
          delivery_longitude?: number | null;
          requires_cold_chain?: boolean;
          is_urgent?: boolean;
          payment_amount?: number;
          status?: MissionStatus;
          proof_urls?: string[];
          created_at?: string;
          accepted_at?: string | null;
          completed_at?: string | null;
        };
      };
      beneficiary_daily_limits: {
        Row: {
          id: string;
          beneficiary_id: string;
          date: string;
          reservation_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          beneficiary_id: string;
          date?: string;
          reservation_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          beneficiary_id?: string;
          date?: string;
          reservation_count?: number;
          created_at?: string;
        };
      };
      impact_metrics: {
        Row: {
          id: string;
          user_id: string;
          metric_type: MetricType;
          value: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          metric_type: MetricType;
          value: number;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          metric_type?: MetricType;
          value?: number;
          date?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: NotificationType;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: NotificationType;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: NotificationType;
          read?: boolean;
          created_at?: string;
        };
      };
      association_beneficiary_registrations: {
        Row: {
          id: string;
          association_id: string;
          beneficiary_id: string;
          registration_date: string;
          notes: string | null;
          verification_document_url: string | null;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          association_id: string;
          beneficiary_id: string;
          registration_date?: string;
          notes?: string | null;
          verification_document_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          association_id?: string;
          beneficiary_id?: string;
          registration_date?: string;
          notes?: string | null;
          verification_document_url?: string | null;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallet_transactions: {
        Row: {
          id: string;
          wallet_id: string;
          user_id: string;
          type: WalletTransactionType;
          amount: number;
          balance_before: number;
          balance_after: number;
          description: string;
          reference_id: string | null;
          reference_type: WalletReferenceType | null;
          status: WalletTransactionStatus;
          metadata: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          user_id: string;
          type: WalletTransactionType;
          amount: number;
          balance_before: number;
          balance_after: number;
          description: string;
          reference_id?: string | null;
          reference_type?: WalletReferenceType | null;
          status?: WalletTransactionStatus;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          user_id?: string;
          type?: WalletTransactionType;
          amount?: number;
          balance_before?: number;
          balance_after?: number;
          description?: string;
          reference_id?: string | null;
          reference_type?: WalletReferenceType | null;
          status?: WalletTransactionStatus;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
