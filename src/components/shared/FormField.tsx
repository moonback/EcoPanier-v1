interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

export const FormField = ({
  label,
  error,
  required,
  hint,
  children
}: FormFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-neutral-700">
        {label}
        {required && <span className="text-accent-500 ml-1">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-sm text-accent-600 flex items-center gap-1 animate-fade-in">
          ⚠️ {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-neutral-500">
          💡 {hint}
        </p>
      )}
    </div>
  );
};
