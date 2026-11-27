import type { ApplicationStatus } from '../types/application';
import type { DocumentVerificationStatus } from '../types/document';
import { getApplicationStatusMeta, getDocumentStatusMeta } from '../utils/helpers';

interface StatusBadgeProps {
  status: ApplicationStatus | DocumentVerificationStatus;
  kind?: 'application' | 'document';
}

export function StatusBadge({ status, kind = 'application' }: StatusBadgeProps) {
  const meta =
    kind === 'document'
      ? getDocumentStatusMeta(status as DocumentVerificationStatus)
      : getApplicationStatusMeta(status as ApplicationStatus);

  return (
    <span
      className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2 py-1 fw-semibold ${meta.badgeClass}`}
      style={{ fontSize: '0.76rem' }}
    >
      <i className={`bi ${meta.icon}`} aria-hidden="true" />
      <span>{meta.label}</span>
    </span>
  );
}
