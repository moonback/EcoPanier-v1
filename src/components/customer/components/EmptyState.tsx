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
    <div className="text-center py-16">
      <Icon size={64} className="text-gray-300 mx-auto mb-6" strokeWidth={1} />
      <p className="text-black font-semibold text-lg mb-2">{title}</p>
      {description && (
        <p className="text-gray-600 font-light max-w-md mx-auto">{description}</p>
      )}
    </div>
  );
}

