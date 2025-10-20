import { useState, useEffect } from 'react';
import { categories } from '../../../utils/helpers';
import { startOfDay, addDays, setHours, setMinutes } from 'date-fns';
import type { LotFormData, Lot, DateOption } from './types';

const initialFormData: LotFormData = {
  title: '',
  description: '',
  category: categories[0],
  original_price: 0,
  discounted_price: 0,
  quantity_total: 1,
  pickup_start: '',
  pickup_end: '',
  requires_cold_chain: false,
  is_urgent: false,
  is_free: false,
  image_urls: [],
};

export const useLotForm = (editingLot: Lot | null) => {
  const [formData, setFormData] = useState<LotFormData>(initialFormData);
  const [selectedDateOption, setSelectedDateOption] = useState<DateOption>('today');
  const [customDate, setCustomDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [analysisConfidence, setAnalysisConfidence] = useState<number | null>(null);

  // Synchroniser les dates de retrait selon la sélection
  useEffect(() => {
    let selectedDate: Date;

    if (selectedDateOption === 'today') {
      selectedDate = startOfDay(new Date());
    } else if (selectedDateOption === 'tomorrow') {
      selectedDate = startOfDay(addDays(new Date(), 1));
    } else if (selectedDateOption === 'custom' && customDate) {
      selectedDate = startOfDay(new Date(customDate));
    } else {
      return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const pickupStartDate = setMinutes(setHours(selectedDate, startHour), startMinute);
    const pickupEndDate = setMinutes(setHours(selectedDate, endHour), endMinute);

    setFormData((prev) => ({
      ...prev,
      pickup_start: pickupStartDate.toISOString().slice(0, 16),
      pickup_end: pickupEndDate.toISOString().slice(0, 16),
    }));
  }, [selectedDateOption, customDate, startTime, endTime]);

  const resetForm = () => {
    setFormData(initialFormData);
    setAnalysisConfidence(null);
    setSelectedDateOption('today');
    setCustomDate('');
    setStartTime('18:00');
    setEndTime('20:00');
  };

  const canProceedToNextStep = (currentStep: number, isEditMode: boolean) => {
    if (isEditMode) {
      switch (currentStep) {
        case 1:
          return formData.title && formData.description && formData.category;
        case 2:
          return (formData.is_free || formData.original_price > 0) && formData.discounted_price >= 0 && formData.quantity_total > 0;
        case 3:
          return formData.pickup_start && formData.pickup_end;
        case 4:
          return true;
        default:
          return false;
      }
    } else {
      switch (currentStep) {
        case 1:
          return true; // Analyse IA optionnelle
        case 2:
          return formData.title && formData.description && formData.category;
        case 3:
          return (formData.is_free || formData.original_price > 0) && formData.discounted_price >= 0 && formData.quantity_total > 0;
        case 4:
          return formData.pickup_start && formData.pickup_end;
        case 5:
          return true;
        default:
          return false;
      }
    }
  };

  return {
    formData,
    setFormData,
    selectedDateOption,
    setSelectedDateOption,
    customDate,
    setCustomDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    analyzingImage,
    setAnalyzingImage,
    analysisConfidence,
    setAnalysisConfidence,
    resetForm,
    canProceedToNextStep,
  };
};

