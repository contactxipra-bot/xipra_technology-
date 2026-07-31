import { cn } from "@/lib/utils";

type BaseProps = {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
};

function FieldWrapper({
  label,
  error,
  required,
  hint,
  children,
}: BaseProps & { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20";

type TextInputProps = BaseProps & React.InputHTMLAttributes<HTMLInputElement>;
export function TextInput({ label, error, required, hint, className, ...rest }: TextInputProps) {
  return (
    <FieldWrapper label={label} error={error} required={required} hint={hint}>
      <input className={cn(inputClass, className)} {...rest} />
    </FieldWrapper>
  );
}

type TextAreaProps = BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export function TextArea({ label, error, required, hint, className, ...rest }: TextAreaProps) {
  return (
    <FieldWrapper label={label} error={error} required={required} hint={hint}>
      <textarea className={cn(inputClass, "min-h-[100px] resize-y", className)} {...rest} />
    </FieldWrapper>
  );
}

type SelectProps = BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>;
export function Select({
  label,
  error,
  required,
  hint,
  className,
  children,
  ...rest
}: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} required={required} hint={hint}>
      <select className={cn(inputClass, className)} {...rest}>
        {children}
      </select>
    </FieldWrapper>
  );
}

type CheckboxProps = Omit<BaseProps, "hint"> & { hint?: string } & React.InputHTMLAttributes<HTMLInputElement>;
export function Checkbox({ label, hint, className, ...rest }: CheckboxProps) {
  return (
    <label className="mb-4 flex items-start gap-2.5 cursor-pointer">
      <input type="checkbox" className={cn("mt-0.5 size-4 accent-primary", className)} {...rest} />
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
    </label>
  );
}
