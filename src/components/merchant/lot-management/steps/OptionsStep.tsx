import { Settings, Image as ImageIcon, Check } from 'lucide-react';
import { uploadImage } from '../../../../utils/helpers';
import type { LotFormState } from '../types';

interface OptionsStepProps {
  formState: LotFormState;
}

export const OptionsStep = ({ formState }: OptionsStepProps) => {
  const { formData, setFormData } = formState;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imagePromises = Array.from(files).map((file) => uploadImage(file));
    const imageUrls = await Promise.all(imagePromises);
    setFormData({ ...formData, image_urls: [...formData.image_urls, ...imageUrls] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-gray-800 mb-2">Options et Images</h4>
        <p className="text-gray-600">Derniers détails pour votre annonce</p>
      </div>

      <div className="space-y-4">
        <h5 className="font-semibold text-gray-800 flex items-center gap-2">
          <Settings size={20} />
          Options du produit
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label
            className={`
              flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition
              ${
                formData.requires_cold_chain
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-white border-gray-300 hover:border-blue-300'
              }
            `}
          >
            <input
              type="checkbox"
              checked={formData.requires_cold_chain}
              onChange={(e) =>
                setFormData({ ...formData, requires_cold_chain: e.target.checked })
              }
              className="w-5 h-5 text-blue-600"
            />
            <div>
              <p className="font-medium text-gray-800">🧊 Chaîne du froid requise</p>
              <p className="text-xs text-gray-600">Produit réfrigéré ou surgelé</p>
            </div>
          </label>

          <label
            className={`
              flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition
              ${
                formData.is_urgent
                  ? 'bg-red-50 border-red-400'
                  : 'bg-white border-gray-300 hover:border-red-300'
              }
            `}
          >
            <input
              type="checkbox"
              checked={formData.is_urgent}
              onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
              className="w-5 h-5 text-red-600"
            />
            <div>
              <p className="font-medium text-gray-800">⚡ Produit urgent</p>
              <p className="text-xs text-gray-600">DLC proche ou très périssable</p>
            </div>
          </label>
        </div>
      </div>

      <div>
        <h5 className="font-semibold text-gray-800 flex items-center gap-2">
          <ImageIcon size={20} />
          Photos du produit (optionnel)
        </h5>

        <label className="block cursor-pointer">
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-center">
            <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">Cliquez pour ajouter des photos</p>
            <p className="text-xs text-gray-500 mt-1">Plusieurs images acceptées</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </label>

        {formData.image_urls.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
            {formData.image_urls.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newUrls = formData.image_urls.filter((_, index) => index !== i);
                    setFormData({ ...formData, image_urls: newUrls });
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-semibold mb-1">Votre lot est prêt !</p>
            <p>Cliquez sur "Créer le lot" pour le publier sur la plateforme.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

