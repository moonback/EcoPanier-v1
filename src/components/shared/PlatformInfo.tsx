import { useSettings } from '../../contexts/SettingsContext';
import { Mail, Phone, Info } from 'lucide-react';

/**
 * Composant réutilisable pour afficher les informations de contact de la plateforme
 */
export const PlatformInfo = () => {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Info size={20} className="text-primary-600" />
        </div>
        <div>
          <h3 className="font-bold text-neutral-900 mb-1">Besoin d'aide ?</h3>
          <p className="text-sm text-neutral-600 font-medium">
            Notre équipe est là pour vous aider
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <a 
          href={`mailto:${settings.platformEmail}`}
          className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-all group"
        >
          <div className="w-8 h-8 bg-neutral-100 group-hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
            <Mail size={16} className="text-neutral-600 group-hover:text-primary-600" />
          </div>
          <span className="text-sm font-medium">{settings.platformEmail}</span>
        </a>

        <a 
          href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
          className="flex items-center gap-3 text-neutral-700 hover:text-primary-600 transition-all group"
        >
          <div className="w-8 h-8 bg-neutral-100 group-hover:bg-primary-100 rounded-lg flex items-center justify-center transition-colors">
            <Phone size={16} className="text-neutral-600 group-hover:text-primary-600" />
          </div>
          <span className="text-sm font-medium">{settings.supportPhone}</span>
        </a>
      </div>
    </div>
  );
};

