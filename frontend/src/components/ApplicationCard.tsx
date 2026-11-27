import { Link } from 'react-router-dom';
import type { Application } from '../types/application';
import { formatDate } from '../utils/helpers';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: Application;
  roleView?: 'citizen' | 'officer';
}

export function ApplicationCard({
  application,
  roleView = 'citizen',
}: ApplicationCardProps) {
  const score = application.aiReport?.overallScore;

  return (
    <div className="js-card js-card-hover p-3 h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <span className="font-mono-code small fw-semibold text-primary">
            {application.referenceNumber}
          </span>
          <StatusBadge status={application.status} />
        </div>

        <h6 className="fw-bold mb-1 text-dark">{application.serviceName}</h6>
        <div className="small text-muted mb-3">{application.department}</div>

        <div className="row g-2 small mb-3">
          <div className="col-6">
            <div className="text-muted">Submitted</div>
            <div className="fw-medium">{formatDate(application.submittedAt)}</div>
          </div>
          <div className="col-6">
            <div className="text-muted">Documents</div>
            <div className="fw-medium">{application.documents.length} uploaded</div>
          </div>
          {roleView === 'officer' && (
            <div className="col-12">
              <div className="text-muted">Applicant</div>
              <div className="fw-medium">{application.citizenName}</div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 border-top d-flex align-items-center justify-content-between gap-2">
        <div>
          {score !== undefined ? (
            <span
              className={`small fw-semibold ${
                score >= 85 ? 'text-success' : score >= 65 ? 'text-warning-emphasis' : 'text-danger'
              }`}
            >
              <i className="bi bi-cpu me-1" />
              AI Score: {score}/100
            </span>
          ) : (
            <span className="small text-muted">AI check pending</span>
          )}
        </div>

        {roleView === 'citizen' ? (
          <div className="d-flex gap-2">
            {(application.status === 'documents_pending' ||
              application.status === 'action_required') && (
              <Link
                to={`/citizen/applications/${application.id}/documents`}
                className="btn btn-sm btn-outline-warning text-dark fw-semibold"
              >
                Upload
              </Link>
            )}
            <Link
              to={`/citizen/applications/${application.id}/track`}
              className="btn btn-sm btn-gov-primary"
            >
              Track
            </Link>
          </div>
        ) : (
          <Link
            to={`/officer/applications/${application.id}`}
            className="btn btn-sm btn-gov-primary"
          >
            Review Case
          </Link>
        )}
      </div>
    </div>
  );
}
