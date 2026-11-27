import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApplicationCard } from '../../components/ApplicationCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { officerService } from '../../services/officerService';
import type { Application } from '../../types/application';
import { formatDate } from '../../utils/helpers';

export function OfficerDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    officerService
      .getAllApplications()
      .then((list) => {
        if (active) setApplications(list);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load cases.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner message="Loading officer review workbench..." />;

  const pendingReview = applications.filter((a) => a.status === 'under_officer_review');
  const actionRequired = applications.filter(
    (a) => a.status === 'action_required' || a.status === 'documents_pending',
  );
  const aiFlagged = applications.filter(
    (a) => a.aiReport && (!a.aiReport.eligibilityPassed || a.aiReport.overallScore < 85),
  );
  const approvedCases = applications.filter((a) => a.status === 'approved');

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Officer Overview</h1>
          <p className="text-muted mb-0">
            {user?.fullName} · {user?.designation || 'Verification Officer'}
          </p>
        </div>
        <Link to="/officer/pending" className="btn btn-gov-primary">
          <i className="bi bi-inboxes me-2" />
          Open Pending Queue ({pendingReview.length + actionRequired.length})
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-primary-subtle text-primary">
              <i className="bi bi-shield-exclamation" />
            </div>
            <div>
              <div className="small text-muted">Awaiting Decision</div>
              <div className="fs-4 fw-bold">{pendingReview.length}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-danger-subtle text-danger">
              <i className="bi bi-robot" />
            </div>
            <div>
              <div className="small text-muted">AI Flagged Cases</div>
              <div className="fs-4 fw-bold">{aiFlagged.length}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-warning-subtle text-warning-emphasis">
              <i className="bi bi-file-earmark-arrow-up" />
            </div>
            <div>
              <div className="small text-muted">Docs Requested</div>
              <div className="fs-4 fw-bold">{actionRequired.length}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-success-subtle text-success">
              <i className="bi bi-check-circle" />
            </div>
            <div>
              <div className="small text-muted">Approved</div>
              <div className="fs-4 fw-bold">{approvedCases.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h5 fw-bold mb-0">Priority Review Queue</h2>
          <Link to="/officer/pending" className="small fw-semibold text-decoration-none">
            View Full Queue <i className="bi bi-arrow-right" />
          </Link>
        </div>
        {pendingReview.length === 0 ? (
          <div className="js-card p-4 text-center text-muted small">
            All submitted cases have been processed.
          </div>
        ) : (
          <div className="row g-3">
            {pendingReview.map((app) => (
              <div key={app.id} className="col-md-6 col-xl-4">
                <ApplicationCard application={app} roleView="officer" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="js-card p-4">
        <h2 className="h5 fw-bold mb-3">Recent Case Activity</h2>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Applicant</th>
                <th>Service</th>
                <th>AI Score</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td className="font-mono-code small fw-semibold text-primary">
                    {app.referenceNumber}
                  </td>
                  <td>{app.citizenName}</td>
                  <td className="small">{app.serviceName}</td>
                  <td>
                    {app.aiReport ? (
                      <span
                        className={`fw-bold ${
                          app.aiReport.overallScore >= 85
                            ? 'text-success'
                            : app.aiReport.overallScore >= 65
                              ? 'text-warning-emphasis'
                              : 'text-danger'
                        }`}
                      >
                        {app.aiReport.overallScore}/100
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="small text-muted">{formatDate(app.updatedAt)}</td>
                  <td className="text-end">
                    <Link
                      to={`/officer/applications/${app.id}`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
