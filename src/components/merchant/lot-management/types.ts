import type { Database } from '../../../lib/database.types';

export type Lot = Database['public']['Tables']['lots']['Row'];
export type LotInsert = Database['public']['Tables']['lots']['Insert'];
export type LotUpdate = Database['public']['Tables']['lots']['Update'];

export interface LotFormData {
  title: string;
  description: string;
  category: string;
  original_price: number;
  discounted_price: number;
  quantity_total: number;
  pickup_start: string;
  pickup_end: string;
  requires_cold_chain: boolean;
  is_urgent: boolean;
  is_free: boolean;
  image_urls: string[];
}

export type DateOption = 'today' | 'tomorrow' | 'custom';

export interface LotFormState {
  formData: LotFormData;
  setFormData: (data: LotFormData | ((prev: LotFormData) => LotFormData)) => void;
  selectedDateOption: DateOption;
  setSelectedDateOption: (option: DateOption) => void;
  customDate: string;
  setCustomDate: (date: string) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  analyzingImage: boolean;
  setAnalyzingImage: (analyzing: boolean) => void;
  analysisConfidence: number | null;
  setAnalysisConfidence: (confidence: number | null) => void;
}

export interface StepInfo {
  number: number;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

