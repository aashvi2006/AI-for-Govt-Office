import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { officerService } from '../../services/officerService';
import type { Application, ApplicationStatus } from '../../types/application';
import { formatDate } from '../../utils/helpers';

export function PendingApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all_pending' | 'all' | ApplicationStatus>(
    'all_pending',
  );

  useEffect(() => {
    let active = true;
    officerService
      .getAllApplications()
      .then((list) => {
        if (active) setApplications(list);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load queue.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner message="Loading officer application queue..." />;

  const filtered = applications.filter((app) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'all_pending'
          ? ['under_officer_review', 'action_required', 'documents_pending', 'ai_verifying'].includes(
              app.status,
            )
          : app.status === statusFilter;

    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      app.referenceNumber.toLowerCase().includes(q) ||
      app.citizenName.toLowerCase().includes(q) ||
      app.serviceName.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">Application Review Queue</h1>
        <p className="text-muted mb-0">
          Filter and inspect citizen applications prioritized by AI verification readiness.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="js-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search reference ID, citizen name, or service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all_pending' | 'all' | ApplicationStatus)
              }
            >
              <option value="all_pending">All Pending / Action Needed</option>
              <option value="under_officer_review">Under Officer Review</option>
              <option value="action_required">Action Required</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All Applications</option>
            </select>
          </div>
          <div className="col-md-3 text-md-end small text-muted">
            Showing <strong>{filtered.length}</strong> of {applications.length} cases
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="js-card p-5 text-center">
          <i className="bi bi-inbox fs-1 text-muted d-block mb-2" />
          <h6 className="fw-bold">No Applications Match Filter</h6>
          <p className="text-muted small mb-0">Adjust your search or status filter above.</p>
        </div>
      ) : (
        <div className="js-card overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Reference ID</th>
                  <th>Citizen</th>
                  <th>Service & Dept</th>
                  <th>AI Assessment</th>
                  <th>Docs</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td className="font-mono-code small fw-semibold text-primary">
                      {app.referenceNumber}
                    </td>
                    <td>
                      <div className="fw-semibold">{app.citizenName}</div>
                      <div className="small text-muted">{app.citizenEmail}</div>
                    </td>
                    <td>
                      <div className="fw-medium small">{app.serviceName}</div>
                      <div className="small text-muted">{app.department}</div>
                    </td>
                    <td>
                      {app.aiReport ? (
                        <div>
                          <span
                            className={`fw-bold small ${
                              app.aiReport.overallScore >= 85
                                ? 'text-success'
                                : app.aiReport.overallScore >= 65
                                  ? 'text-warning-emphasis'
                                  : 'text-danger'
                            }`}
                          >
                            {app.aiReport.overallScore}/100
                          </span>
                          <div className="text-muted" style={{ fontSize: '0.73rem' }}>
                            {app.aiReport.recommendedAction.replace('_', ' ')}
                          </div>
                        </div>
                      ) : (
                        <span className="small text-muted">Not run</span>
                      )}
                    </td>
                    <td className="small">{app.documents.length} files</td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="small text-muted">{formatDate(app.submittedAt)}</td>
                    <td className="text-end text-nowrap">
                      <Link
                        to={`/officer/applications/${app.id}/documents`}
                        className="btn btn-sm btn-outline-secondary me-2"
                      >
                        Docs
                      </Link>
                      <Link
                        to={`/officer/applications/${app.id}`}
                        className="btn btn-sm btn-gov-primary"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
