import { categories, getCategoryLabel } from '../../../../utils/helpers';
import type { LotFormState } from '../types';

interface BasicInfoStepProps {
  formState: LotFormState;
}

export const BasicInfoStep = ({ formState }: BasicInfoStepProps) => {
  const { formData, setFormData } = formState;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-gray-800 mb-2">Informations du produit</h4>
        <p className="text-gray-600">Décrivez votre produit en quelques mots</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <span className="text-red-500">*</span> Titre du produit
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          placeholder="Ex: Baguettes tradition fraîches"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <span className="text-red-500">*</span> Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-32"
          placeholder="Décrivez le produit, son état, sa composition..."
          required
        />
        <p className="text-xs text-gray-500 mt-1">{formData.description.length} caractères</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <span className="text-red-500">*</span> Catégorie
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

