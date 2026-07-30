import { forwardRef, type InputHTMLAttributes } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="mb-4">
        <label htmlFor={inputId} className="mb-1 block text-xs uppercase tracking-wide text-brand-ink/60">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className="w-full rounded-md border border-white/10 bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-gold"
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
FormField.displayName = "FormField";
