type LoadingProps = {
  label?: string;
};

function Loading({ label = 'Loading...' }: LoadingProps) {
  return (
    <div
      className="flex items-center gap-2 text-text-secondary"
      role="status"
      aria-live="polite"
    >
      <span
        className="size-4 animate-spin rounded-full border-2 border-surface-elevated border-t-primary"
        aria-hidden="true"
      />

      <span>{label}</span>
    </div>
  );
}

export default Loading;