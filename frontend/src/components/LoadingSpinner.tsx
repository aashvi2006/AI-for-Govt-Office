interface LoadingSpinnerProps {
  message?: string;
  compact?: boolean;
}

export function LoadingSpinner({
  message = 'Loading data...',
  compact = false,
}: LoadingSpinnerProps) {
  if (compact) {
    return (
      <span className="d-inline-flex align-items-center gap-2">
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
        <span>{message}</span>
      </span>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <div
        className="spinner-border text-primary mb-3"
        style={{ width: '2.5rem', height: '2.5rem' }}
        role="status"
      >
        <span className="visually-hidden">{message}</span>
      </div>
      <div className="fw-medium text-secondary">{message}</div>
    </div>
  );
}
