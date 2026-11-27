import type { ApplicationStatus } from '../types/application';
import type { DocumentVerificationStatus } from '../types/document';
import type { UserRole } from '../types/user';

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatCurrencyInr(amount: number): string {
  if (amount === 0) return 'Free (Zero Fee)';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRoleHomePath(role: UserRole): string {
  switch (role) {
    case 'officer':
      return '/officer/dashboard';
    case 'admin':
      return '/admin/dashboard';
    case 'citizen':
    default:
      return '/citizen/dashboard';
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'officer':
      return 'Government Officer';
    case 'admin':
      return 'System Administrator';
    case 'citizen':
    default:
      return 'Citizen';
  }
}

export function getApplicationStatusMeta(status: ApplicationStatus): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  switch (status) {
    case 'draft':
      return {
        label: 'Draft',
        badgeClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
        icon: 'bi-pencil-square',
      };
    case 'documents_pending':
      return {
        label: 'Documents Pending',
        badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
        icon: 'bi-file-earmark-arrow-up',
      };
    case 'ai_verifying':
      return {
        label: 'AI Verifying',
        badgeClass: 'bg-info-subtle text-info-emphasis border border-info-subtle',
        icon: 'bi-cpu',
      };
    case 'under_officer_review':
      return {
        label: 'Under Officer Review',
        badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
        icon: 'bi-shield-check',
      };
    case 'action_required':
      return {
        label: 'Action Required',
        badgeClass: 'bg-warning-subtle text-danger-emphasis border border-warning',
        icon: 'bi-exclamation-triangle',
      };
    case 'approved':
      return {
        label: 'Approved',
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        icon: 'bi-check-circle-fill',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
        icon: 'bi-x-circle-fill',
      };
  }
}

export function getDocumentStatusMeta(status: DocumentVerificationStatus): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending Scan',
        badgeClass: 'bg-secondary-subtle text-secondary border border-secondary-subtle',
        icon: 'bi-hourglass-split',
      };
    case 'ai_verified':
      return {
        label: 'AI Verified',
        badgeClass: 'bg-info-subtle text-info-emphasis border border-info-subtle',
        icon: 'bi-robot',
      };
    case 'mismatch_detected':
      return {
        label: 'Mismatch Detected',
        badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning',
        icon: 'bi-exclamation-diamond',
      };
    case 'blurry_or_unreadable':
      return {
        label: 'Unreadable Scan',
        badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
        icon: 'bi-eye-slash',
      };
    case 'approved':
      return {
        label: 'Officer Approved',
        badgeClass: 'bg-success-subtle text-success border border-success-subtle',
        icon: 'bi-patch-check-fill',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
        icon: 'bi-x-octagon-fill',
      };
  }
}

export function buildSampleDocumentPreview(
  title: string,
  holderName: string,
  identifier: string,
  extraLines: string[],
): string {
  const escaped = (v: string) =>
    v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const linesSvg = extraLines
    .slice(0, 4)
    .map(
      (line, idx) =>
        `<text x="36" y="${158 + idx * 24}" font-family="Inter, Arial, sans-serif" font-size="13" fill="#334155">${escaped(line)}</text>`,
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="320" viewBox="0 0 520 320">
    <rect width="520" height="320" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    <rect width="520" height="56" rx="12" fill="#0f2942"/>
    <rect y="44" width="520" height="12" fill="#0f2942"/>
    <rect y="56" width="520" height="4" fill="#d97706"/>
    <text x="24" y="34" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffffff">${escaped(title)}</text>
    <text x="496" y="34" text-anchor="end" font-family="monospace" font-size="12" fill="#cbd5e1">GOVT. OF INDIA</text>
    <rect x="36" y="80" width="84" height="60" rx="6" fill="#e2e8f0" stroke="#94a3b8"/>
    <circle cx="78" cy="102" r="14" fill="#94a3b8"/>
    <path d="M56 132 C56 118, 100 118, 100 132" fill="#94a3b8"/>
    <text x="136" y="98" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#0f172a">${escaped(holderName)}</text>
    <text x="136" y="122" font-family="monospace" font-size="14" font-weight="bold" fill="#1e4d7b">${escaped(identifier)}</text>
    ${linesSvg}
    <rect x="372" y="196" width="112" height="84" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-dasharray="4 3"/>
    <text x="428" y="236" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#047857">DIGITALLY</text>
    <text x="428" y="252" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#047857">SIGNED</text>
    <text x="36" y="294" font-family="monospace" font-size="11" fill="#64748b">JanSahayak AI OCR Preview · Verified Metadata</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
