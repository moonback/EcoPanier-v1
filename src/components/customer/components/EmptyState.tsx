import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

/**
 * Composant pour afficher un état vide
 * Utilisé quand aucune donnée n'est disponible
 */
export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon size={64} className="text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 font-semibold">{title}</p>
      {description && (
        <p className="text-gray-500 text-sm mt-2">{description}</p>
      )}
    </div>
  );
}

