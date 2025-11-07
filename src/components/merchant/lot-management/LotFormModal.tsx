import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { LotFormSteps } from './LotFormSteps';
import { AIAnalysisStep } from './steps/AIAnalysisStep';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { PricingStep } from './steps/PricingStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { OptionsStep } from './steps/OptionsStep';
import { useLotForm } from './useLotForm';
import type { Lot, LotInsert, LotUpdate } from './types';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';

interface LotFormModalProps {
  editingLot: Lot | null;
  merchantId: string;
  hasActiveSubscription: boolean;
  dailyLotLimit: number;
  onQuotaExceeded: () => void;
  onClose: () => void;
  onSuccess: () => void;
}

export const LotFormModal = ({
  editingLot,
  merchantId,
  hasActiveSubscription,
  dailyLotLimit,
  onQuotaExceeded,
  onClose,
  onSuccess,
}: LotFormModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const formState = useLotForm(editingLot);

  const totalSteps = editingLot ? 4 : 5;

  // Initialiser le formulaire si en mode édition
  useState(() => {
    if (editingLot) {
      formState.setFormData({
        title: editingLot.title,
        description: editingLot.description,
        category: editingLot.category,
        original_price: editingLot.original_price,
        discounted_price: editingLot.discounted_price,
        quantity_total: editingLot.quantity_total,
        pickup_start: editingLot.pickup_start.slice(0, 16),
        pickup_end: editingLot.pickup_end.slice(0, 16),
        requires_cold_chain: editingLot.requires_cold_chain,
        is_urgent: editingLot.is_urgent,
        is_free: editingLot.is_free,
        image_urls: editingLot.image_urls,
      });

      // Extraire la date et les heures pour pré-remplir les champs
      const pickupDate = new Date(editingLot.pickup_start);
      const today = startOfDay(new Date());
      const tomorrow = startOfDay(addDays(new Date(), 1));
      const lotDate = startOfDay(pickupDate);

      if (lotDate.getTime() === today.getTime()) {
        formState.setSelectedDateOption('today');
      } else if (lotDate.getTime() === tomorrow.getTime()) {
        formState.setSelectedDateOption('tomorrow');
      } else {
        formState.setSelectedDateOption('custom');
        formState.setCustomDate(format(pickupDate, 'yyyy-MM-dd'));
      }

      formState.setStartTime(format(new Date(editingLot.pickup_start), 'HH:mm'));
      formState.setEndTime(format(new Date(editingLot.pickup_end), 'HH:mm'));
    }
  });

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuotaError(null);

    try {
      if (!editingLot && !hasActiveSubscription) {
        const startOfToday = startOfDay(new Date()).toISOString();
        const endOfToday = endOfDay(new Date()).toISOString();

        const { count, error: countError } = await supabase
          .from('lots')
          .select('id', { count: 'exact', head: true })
          .eq('merchant_id', merchantId)
          .gte('created_at', startOfToday)
          .lte('created_at', endOfToday);

        if (countError) {
          throw countError;
        }

        const used = count ?? 0;
        if (used >= dailyLotLimit) {
          setQuotaError(`Vous avez atteint la limite quotidienne de ${dailyLotLimit} lots.`);
          onQuotaExceeded();
          return;
        }
      }

      if (editingLot) {
        const updateData: LotUpdate = {
          title: formState.formData.title,
          description: formState.formData.description,
          category: formState.formData.category,
          original_price: formState.formData.original_price,
          discounted_price: formState.formData.discounted_price,
          quantity_total: formState.formData.quantity_total,
          pickup_start: formState.formData.pickup_start,
          pickup_end: formState.formData.pickup_end,
          requires_cold_chain: formState.formData.requires_cold_chain,
          is_urgent: formState.formData.is_urgent,
          is_free: formState.formData.is_free,
          image_urls: formState.formData.image_urls,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('lots')
          // @ts-expect-error - Type mismatch due to Supabase type generation issue
          .update(updateData)
          .eq('id', editingLot.id);

        if (error) throw error;
      } else {
        const insertData: LotInsert = {
          merchant_id: merchantId,
          title: formState.formData.title,
          description: formState.formData.description,
          category: formState.formData.category,
          original_price: formState.formData.original_price,
          discounted_price: formState.formData.discounted_price,
          quantity_total: formState.formData.quantity_total,
          pickup_start: formState.formData.pickup_start,
          pickup_end: formState.formData.pickup_end,
          requires_cold_chain: formState.formData.requires_cold_chain,
          is_urgent: formState.formData.is_urgent,
          is_free: formState.formData.is_free,
          image_urls: formState.formData.image_urls,
        };

        // @ts-expect-error - Type mismatch due to Supabase type generation issue
        const { error } = await supabase.from('lots').insert(insertData);

        if (error) throw error;
      }

      onSuccess();
      setQuotaError(null);
      onClose();
      formState.resetForm();
    } catch (error) {
      console.error('Error saving lot:', error);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const handleClose = () => {
    onClose();
    formState.resetForm();
    setQuotaError(null);
  };

  const canProceed = formState.canProceedToNextStep(currentStep, !!editingLot);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] my-4 sm:my-8 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
              {editingLot ? 'Modifier le lot' : 'Créer un nouveau lot'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              Étape {currentStep} sur {totalSteps}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barre de progression */}
        <LotFormSteps currentStep={currentStep} isEditMode={!!editingLot} />

        {/* Contenu du formulaire */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit}>
            {quotaError && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {quotaError}
              </div>
            )}
            {/* Étape 1 : Analyse IA (uniquement en création) */}
            {!editingLot && currentStep === 1 && (
              <AIAnalysisStep formState={formState} onNextStep={nextStep} />
            )}

            {/* Étape 2 (création) ou Étape 1 (édition) : Informations de base */}
            {((editingLot && currentStep === 1) || (!editingLot && currentStep === 2)) && (
              <BasicInfoStep formState={formState} />
            )}

            {/* Étape 3 (création) ou Étape 2 (édition) : Prix et Quantité */}
            {((editingLot && currentStep === 2) || (!editingLot && currentStep === 3)) && (
              <PricingStep formState={formState} />
            )}

            {/* Étape 4 (création) ou Étape 3 (édition) : Horaires */}
            {((editingLot && currentStep === 3) || (!editingLot && currentStep === 4)) && (
              <ScheduleStep formState={formState} />
            )}

            {/* Étape 5 (création) ou Étape 4 (édition) : Options et Images */}
            {((editingLot && currentStep === 4) || (!editingLot && currentStep === 5)) && (
              <OptionsStep formState={formState} />
            )}
          </form>
        </div>

        {/* Footer avec navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 flex-shrink-0">
          <div className="order-2 sm:order-1">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <ChevronLeft size={18} strokeWidth={1.5} />
                <span>Précédent</span>
              </button>
            )}
          </div>

          <div className="order-1 sm:order-2 flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-none px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Annuler
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed}
                className={`
                  flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition
                  ${
                    canProceed
                      ? 'bg-black text-white hover:bg-gray-900'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <span>Suivant</span>
                <ChevronRight size={18} strokeWidth={1.5} />
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={!canProceed}
                className={`
                  flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition
                  ${
                    canProceed
                      ? 'bg-black text-white hover:bg-gray-900'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                <Check size={18} strokeWidth={1.5} />
                <span className="truncate">{editingLot ? 'Mettre à jour' : 'Créer le lot'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

