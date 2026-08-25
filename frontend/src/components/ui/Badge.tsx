import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'danger';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-elevated text-text-secondary',
  primary: 'bg-primary text-background',
  success: 'bg-success text-white',
  danger: 'bg-danger text-white',
};

function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-pill px-3 py-1 text-sm font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;