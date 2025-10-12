import { X, Filter, Check } from 'lucide-react';
import { categories } from '../../../utils/helpers';

interface FilterModalProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onClose: () => void;
}

/**
 * Modal pour filtrer les lots par catégorie
 * Affiche toutes les catégories disponibles avec sélection unique
 */
export function FilterModal({
  selectedCategory,
  onSelectCategory,
  onClose,
}: FilterModalProps) {
  const handleSelectCategory = (category: string) => {
    onSelectCategory(category);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-5 sm:p-6 max-h-[80vh] overflow-y-auto animate-fade-in-up">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-primary-600" />
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">
              Filtrer par catégorie
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Liste des catégories */}
        <div className="space-y-2">
          {/* Option "Toutes les catégories" */}
          <button
            onClick={() => handleSelectCategory('')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
              selectedCategory === ''
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>Toutes les catégories</span>
            {selectedCategory === '' && <Check size={20} />}
          </button>

          {/* Catégories spécifiques */}
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleSelectCategory(category)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span>{category}</span>
              {selectedCategory === category && <Check size={20} />}
            </button>
          ))}
        </div>

        {/* Bouton de fermeture */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

