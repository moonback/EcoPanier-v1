import { useState } from 'react';
import {
  ImagePlus,
  Sparkles,
  Check,
  ChevronRight,
  Crown,
  Gauge,
  Clock,
  Lock,
} from 'lucide-react';
import { analyzeFoodImage, isGeminiConfigured } from '../../../../utils/geminiService';
import { uploadImage } from '../../../../utils/helpers';
import type { LotFormState } from '../types';

interface AIAnalysisStepProps {
  formState: LotFormState;
  onNextStep: () => void;
  hasActiveSubscription: boolean;
}

interface AdvancedInsights {
  expiryDate?: string;
  freshnessScore?: number;
  suggestedPickupTime?: 'matin' | 'midi' | 'soir';
  alternativeTitles?: string[];
}

const PICKUP_TIME_PRESETS: Record<'matin' | 'midi' | 'soir', { start: string; end: string }> = {
  matin: { start: '08:00', end: '10:30' },
  midi: { start: '12:00', end: '14:00' },
  soir: { start: '18:00', end: '20:30' },
};

export const AIAnalysisStep = ({
  formState,
  onNextStep,
  hasActiveSubscription,
}: AIAnalysisStepProps) => {
  const {
    formData,
    setFormData,
    analyzingImage,
    setAnalyzingImage,
    analysisConfidence,
    setAnalysisConfidence,
    setStartTime,
    setEndTime,
  } = formState;
  const [advancedInsights, setAdvancedInsights] = useState<AdvancedInsights | null>(null);

  const handleAIImageAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isGeminiConfigured()) {
      alert(
        "⚠️ L'analyse IA n'est pas configurée. Ajoutez votre clé API Gemini dans le fichier .env (VITE_GEMINI_API_KEY)"
      );
      return;
    }

    setAnalyzingImage(true);
    setAnalysisConfidence(null);

    try {
      // Analyser l'image avec Gemini
      const analysis = await analyzeFoodImage(file);

      // Uploader l'image pour l'afficher
      const imageUrl = await uploadImage(file);

      // Remplir le formulaire avec les données analysées
      setFormData({
        ...formData,
        title: analysis.title,
        description: analysis.description,
        category: analysis.category,
        original_price: analysis.original_price,
        discounted_price: analysis.discounted_price,
        quantity_total: analysis.quantity_total,
        requires_cold_chain: analysis.requires_cold_chain,
        is_urgent: analysis.is_urgent,
        is_free: false,
        image_urls: [imageUrl, ...formData.image_urls],
      });

      setAnalysisConfidence(analysis.confidence);
      if (hasActiveSubscription) {
        setAdvancedInsights({
          expiryDate: analysis.expiry_date,
          freshnessScore: analysis.freshness_score,
          suggestedPickupTime: analysis.suggested_pickup_time,
          alternativeTitles: analysis.alternative_titles,
        });
      } else {
        setAdvancedInsights(null);
      }

      // Passer automatiquement à l'étape suivante
      setTimeout(() => {
        onNextStep();
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'analyse:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de l'analyse de l'image");
    } finally {
      setAnalyzingImage(false);
    }

    // Réinitialiser l'input
    e.target.value = '';
  };

  const handleApplyTitle = (title: string) => {
    setFormData({
      ...formData,
      title,
    });
  };

  const handleApplyPickupSlot = (slot: 'matin' | 'midi' | 'soir') => {
    const preset = PICKUP_TIME_PRESETS[slot];
    setStartTime(preset.start);
    setEndTime(preset.end);
  };

  const renderFreshnessBadge = (score: number) => {
    const percentage = Math.round(score * 100);
    let label = 'Frais';
    let badgeColor = 'bg-emerald-100 text-emerald-700';
    if (percentage < 40) {
      label = 'À surveiller';
      badgeColor = 'bg-amber-100 text-amber-700';
    } else if (percentage < 70) {
      label = 'Bon état';
      badgeColor = 'bg-blue-100 text-blue-700';
    }
    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
        <Gauge className="h-3.5 w-3.5" />
        {label} ({percentage}%)
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="max-w-xl mx-auto">
        <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200 rounded-2xl">
          <label className="block cursor-pointer">
            <div
              className={`
                relative p-8 border-3 border-dashed rounded-xl text-center transition-all duration-300
                ${
                  analyzingImage
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400'
                }
              `}
            >
              {analyzingImage ? (
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                  <p className="text-purple-600 font-semibold">Analyse en cours...</p>
                  <p className="text-sm text-gray-600">L'IA analyse votre image</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ImagePlus size={48} className="mx-auto text-purple-500" />
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      Cliquez pour sélectionner une image
                    </p>
                    <p className="text-sm text-gray-500 mt-1">ou glissez-déposez ici</p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium">
                    <Sparkles size={20} />
                    <span>Analyser avec l'IA</span>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAIImageAnalysis}
                disabled={analyzingImage}
                className="hidden"
              />
            </div>
          </label>

          {!isGeminiConfigured() && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                Configuration requise : ajoutez VITE_GEMINI_API_KEY dans votre fichier .env
              </p>
            </div>
          )}

          {analysisConfidence !== null && (
            <div className="mt-4 p-4 bg-white border-2 border-green-200 rounded-lg animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check size={24} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-green-800">Analyse terminée !</p>
                  <p className="text-sm text-gray-600">
                    Confiance :{' '}
                    <span className="font-bold text-green-600">
                      {Math.round(analysisConfidence * 100)}%
                    </span>
                    {analysisConfidence < 0.7 &&
                      ' - Vérifiez les informations aux étapes suivantes'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onNextStep}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mx-auto"
          >
            <span>Passer cette étape</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto w-full">
        {hasActiveSubscription ? (
          <div className="card border border-emerald-200 bg-emerald-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Crown className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-base font-semibold text-emerald-900">
                    Insights premium pour vos abonnés
                  </h3>
                  <p className="text-sm text-emerald-800">
                    L’IA fournit des recommandations avancées pour optimiser vos paniers anti-gaspi.
                  </p>
                </div>

                {advancedInsights ? (
                  <div className="space-y-4">
                    {(advancedInsights.expiryDate || advancedInsights.freshnessScore !== undefined) && (
                      <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-emerald-900">
                              Qualité & DLC détectées
                            </p>
                            {advancedInsights.expiryDate ? (
                              <p className="text-sm text-emerald-700">
                                Date limite recommandée :{' '}
                                <span className="font-semibold">{advancedInsights.expiryDate}</span>
                              </p>
                            ) : (
                              <p className="text-sm text-emerald-700">
                                DLC non détectée sur l’image – pensez à la renseigner manuellement.
                              </p>
                            )}
                          </div>
                          {advancedInsights.freshnessScore !== undefined &&
                            renderFreshnessBadge(advancedInsights.freshnessScore)}
                        </div>
                      </div>
                    )}

                    {advancedInsights.suggestedPickupTime && (
                      <div className="rounded-xl border border-emerald-200 bg-white/80 p-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">
                              Créneau de retrait conseillé :{' '}
                              <span className="capitalize">
                                {advancedInsights.suggestedPickupTime}
                              </span>
                            </p>
                            <p className="text-xs text-emerald-700">
                              Click pour appliquer automatiquement les horaires suggérés.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyPickupSlot(advancedInsights.suggestedPickupTime!)}
                          className="btn-primary rounded-lg px-4 py-2 text-sm"
                        >
                          Appliquer
                        </button>
                      </div>
                    )}

                    {advancedInsights.alternativeTitles &&
                      advancedInsights.alternativeTitles.length > 0 && (
                        <div className="rounded-xl border border-emerald-200 bg-white/80 p-4">
                          <p className="mb-2 text-sm font-semibold text-emerald-900">
                            Titres alternatifs suggérés
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {advancedInsights.alternativeTitles.map((title) => (
                              <button
                                key={title}
                                type="button"
                                onClick={() => handleApplyTitle(title)}
                                className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition"
                              >
                                {title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-emerald-200 bg-white/60 px-4 py-3 text-sm text-emerald-800">
                    Téléversez une image pour recevoir des recommandations personnalisées (DLC, fraîcheur, créneaux,
                    titres optimisés).
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
                <Lock className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-amber-900">
                  Boostez vos analyses IA avec l’abonnement
                </h3>
                <p className="text-sm text-amber-800">
                  Accédez aux suggestions premium : DLC détectée, score de fraîcheur, créneau optimal, titres optimisés.
                </p>
                <p className="text-xs text-amber-700">
                  Activez l’abonnement dans votre Portefeuille pour débloquer ces insights exclusifs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

