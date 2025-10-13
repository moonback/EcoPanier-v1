import { useSettings } from '../../contexts/SettingsContext';
import { Mail, Phone, Info } from 'lucide-react';

/**
 * Composant réutilisable pour afficher les informations de contact de la plateforme
 */
export const PlatformInfo = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info size={20} className="text-black" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-bold text-black mb-1">Besoin d'aide ?</h3>
          <p className="text-sm text-gray-600 font-light">
            Notre équipe est là pour vous aider
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <a 
          href={`mailto:${settings.platformEmail}`}
          className="flex items-center gap-3 text-gray-700 hover:text-black transition group"
        >
          <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition">
            <Mail size={16} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-light">{settings.platformEmail}</span>
        </a>

        <a 
          href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
          className="flex items-center gap-3 text-gray-700 hover:text-black transition group"
        >
          <div className="w-8 h-8 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition">
            <Phone size={16} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-light">{settings.supportPhone}</span>
        </a>
      </div>
    </div>
  );
};

