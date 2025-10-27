interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  children: React.ReactNode;
}

export const DashboardSection = ({
  title,
  subtitle,
  icon,
  action,
  children
}: DashboardSectionProps) => {
  return (
    <div className="card p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-6 border-b border-neutral-100">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-neutral-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-neutral-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && (
          <button onClick={action.onClick} className="btn-primary text-sm">
            {action.label}
          </button>
        )}
      </div>

      {/* Content */}
      <div>
        {children}
      </div>
    </div>
  );
};
