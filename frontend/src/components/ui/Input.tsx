import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-surface-elevated bg-surface px-4 py-2 text-text outline-none placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
    />
  );
}

export default Input;