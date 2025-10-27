import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: string;
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Illustration ou icône */}
      <div className="mb-6 relative">
        <div className="absolute -inset-6 bg-gradient-to-r from-primary-100 to-secondary-100 rounded-full blur-2xl opacity-30 animate-pulse" />
        <div className="relative bg-white rounded-full p-6 shadow-soft-lg">
          <Icon className="w-12 h-12 text-primary-500" />
        </div>
      </div>

      {/* Titre */}
      <h3 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2 text-center">
        {title}
      </h3>

      {/* Description */}
      <p className="text-neutral-600 text-center max-w-sm mb-8">
        {description}
      </p>

      {/* Action button */}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
};
