import { ImagePlus, Sparkles, Check, ChevronRight } from 'lucide-react';
import { analyzeFoodImage, isGeminiConfigured } from '../../../../utils/geminiService';
import { uploadImage } from '../../../../utils/helpers';
import type { LotFormState } from '../types';

interface AIAnalysisStepProps {
  formState: LotFormState;
  onNextStep: () => void;
}

export const AIAnalysisStep = ({ formState, onNextStep }: AIAnalysisStepProps) => {
  const {
    formData,
    setFormData,
    analyzingImage,
    setAnalyzingImage,
    analysisConfidence,
    setAnalysisConfidence,
  } = formState;

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
    </div>
  );
};

