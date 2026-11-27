import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import type { Application } from '../../types/application';
import { formatDate, formatDateTime } from '../../utils/helpers';

export function TrackApplication() {
  const { applicationId } = useParams<{ applicationId?: string }>();
  const navigate = useNavigate();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchRef, setSearchRef] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const myApps = await applicationService.getMyApplications();
        if (!active) return;
        setApplications(myApps);

        if (applicationId) {
          const found =
            myApps.find((a) => a.id === applicationId || a.referenceNumber === applicationId) ||
            (await applicationService.getApplicationById(applicationId));
          if (active) setSelectedApp(found);
        } else {
          setSelectedApp(myApps[0] || null);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to track application.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [applicationId]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) return;
    setError(null);
    try {
      const found = await applicationService.getApplicationById(searchRef.trim());
      setSelectedApp(found);
      navigate(`/citizen/applications/${found.id}/track`);
    } catch {
      setError(`No application found with Reference ID "${searchRef.trim()}".`);
    }
  };

  if (loading) return <LoadingSpinner message="Loading application tracking timeline..." />;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Track Application Status</h1>
          <p className="text-muted mb-0">
            Monitor live verification milestones, officer remarks, and action requests.
          </p>
        </div>

        <form onSubmit={handleLookup} className="d-flex gap-2">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ minWidth: 230 }}
            placeholder="Search Ref e.g. JS-2026-001042"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-gov-primary text-nowrap">
            Track Ref
          </button>
        </form>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="js-card p-3">
            <h2 className="h6 fw-bold mb-3">My Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="text-center py-4 small text-muted">
                No applications submitted yet.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {applications.map((app) => {
                  const isActive = selectedApp?.id === app.id;
                  return (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => {
                        setSelectedApp(app);
                        navigate(`/citizen/applications/${app.id}/track`);
                      }}
                      className={`btn text-start p-3 border rounded-3 ${
                        isActive ? 'bg-primary-subtle border-primary' : 'bg-white'
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="font-mono-code small fw-semibold text-primary">
                          {app.referenceNumber}
                        </span>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="fw-semibold text-dark small">{app.serviceName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Updated {formatDate(app.updatedAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          {selectedApp ? (
            <div className="js-card p-4">
              <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3 pb-3 mb-4 border-bottom">
                <div>
                  <span className="font-mono-code small text-primary fw-semibold">
                    {selectedApp.referenceNumber}
                  </span>
                  <h2 className="h4 fw-bold mb-1">{selectedApp.serviceName}</h2>
                  <div className="small text-muted">
                    {selectedApp.department} · Submitted {formatDateTime(selectedApp.submittedAt)}
                  </div>
                </div>
                <div className="d-flex flex-column align-items-md-end gap-2">
                  <StatusBadge status={selectedApp.status} />
                  <div className="d-flex gap-2">
                    <Link
                      to={`/citizen/applications/${selectedApp.id}/documents`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Documents ({selectedApp.documents.length})
                    </Link>
                    <Link
                      to={`/citizen/applications/${selectedApp.id}/verification`}
                      className="btn btn-sm btn-outline-primary"
                    >
                      AI Report
                    </Link>
                  </div>
                </div>
              </div>

              {selectedApp.officerRemarks && (
                <div
                  className={`alert small mb-4 ${
                    selectedApp.status === 'approved'
                      ? 'alert-success'
                      : selectedApp.status === 'rejected'
                        ? 'alert-danger'
                        : 'alert-warning'
                  }`}
                >
                  <div className="fw-bold mb-1">
                    <i className="bi bi-chat-square-text me-1" />
                    Officer Remarks ({selectedApp.assignedOfficerName || 'Verification Officer'})
                  </div>
                  <div>{selectedApp.officerRemarks}</div>
                </div>
              )}

              <h3 className="h6 fw-bold mb-3">Application Lifecycle Timeline</h3>
              <div className="js-timeline">
                {selectedApp.timeline.map((event) => (
                  <div key={event.id} className="js-timeline-item">
                    <span className={`js-timeline-dot ${event.state}`}>
                      <i
                        className={`bi ${
                          event.state === 'completed'
                            ? 'bi-check'
                            : event.state === 'warning'
                              ? 'bi-exclamation'
                              : event.state === 'danger'
                                ? 'bi-x'
                                : 'bi-dot'
                        }`}
                      />
                    </span>
                    <div className="d-flex flex-column flex-sm-row justify-content-between gap-1">
                      <span className="fw-bold text-dark small">{event.stage}</span>
                      <span className="text-muted" style={{ fontSize: '0.76rem' }}>
                        {formatDateTime(event.timestamp)}
                      </span>
                    </div>
                    <div className="small text-secondary mt-1">{event.description}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Actor: {event.actor}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="js-card p-5 text-center">
              <i className="bi bi-signpost-split fs-1 text-muted d-block mb-2" />
              <h5 className="fw-bold">No Application Selected</h5>
              <p className="text-muted small mb-0">
                Select an application on the left or search by reference number.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
