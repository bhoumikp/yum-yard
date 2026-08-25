import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

function Card({ className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-lg bg-surface p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;