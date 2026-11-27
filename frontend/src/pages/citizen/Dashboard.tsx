import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApplicationCard } from '../../components/ApplicationCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import type { Application } from '../../types/application';
import type { GovernmentService } from '../../types/service';
import { formatCurrencyInr } from '../../utils/helpers';

export function CitizenDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [apps, srvs] = await Promise.all([
          applicationService.getMyApplications(),
          applicationService.getServices(true),
        ]);
        if (!active) return;
        setApplications(apps);
        setServices(srvs);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner message="Loading your citizen dashboard..." />;

  const actionRequiredApps = applications.filter(
    (a) => a.status === 'action_required' || a.status === 'documents_pending',
  );
  const inReviewCount = applications.filter(
    (a) => a.status === 'under_officer_review' || a.status === 'ai_verifying',
  ).length;
  const approvedCount = applications.filter((a) => a.status === 'approved').length;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">Welcome, {user?.fullName}</h1>
          <p className="text-muted mb-0">
            Track your applications, resolve AI verification alerts, or apply for new government services.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/citizen/services" className="btn btn-gov-outline">
            <i className="bi bi-grid-1x2 me-2" />
            Browse Services
          </Link>
          <Link to="/citizen/apply" className="btn btn-gov-primary">
            <i className="bi bi-plus-lg me-2" />
            New Application
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-primary-subtle text-primary">
              <i className="bi bi-folder2-open" />
            </div>
            <div>
              <div className="small text-muted">Total Applications</div>
              <div className="fs-4 fw-bold">{applications.length}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-info-subtle text-info-emphasis">
              <i className="bi bi-hourglass-split" />
            </div>
            <div>
              <div className="small text-muted">Under Review</div>
              <div className="fs-4 fw-bold">{inReviewCount}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-warning-subtle text-warning-emphasis">
              <i className="bi bi-exclamation-triangle" />
            </div>
            <div>
              <div className="small text-muted">Action Needed</div>
              <div className="fs-4 fw-bold">{actionRequiredApps.length}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
            <div className="js-kpi-icon bg-success-subtle text-success">
              <i className="bi bi-patch-check" />
            </div>
            <div>
              <div className="small text-muted">Approved</div>
              <div className="fs-4 fw-bold">{approvedCount}</div>
            </div>
          </div>
        </div>
      </div>

      {actionRequiredApps.length > 0 && (
        <div className="alert alert-warning border-warning d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
          <div>
            <div className="fw-bold">
              <i className="bi bi-bell-fill me-2" />
              {actionRequiredApps.length} application(s) need document upload or clarification
            </div>
            <div className="small">
              Complete your document upload so JanSahayak AI can verify and forward your request to an officer.
            </div>
          </div>
          <Link
            to={`/citizen/applications/${actionRequiredApps[0].id}/documents`}
            className="btn btn-sm btn-dark fw-semibold text-nowrap"
          >
            Resolve Now
          </Link>
        </div>
      )}

      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h5 fw-bold mb-0">My Recent Applications</h2>
          <Link to="/citizen/track" className="small fw-semibold text-decoration-none">
            View All & Track <i className="bi bi-arrow-right" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="js-card p-5 text-center">
            <i className="bi bi-inbox fs-1 text-muted d-block mb-2" />
            <h6 className="fw-bold">No Applications Yet</h6>
            <p className="text-muted small mb-3">
              Start by browsing available government certificates and welfare schemes.
            </p>
            <Link to="/citizen/services" className="btn btn-gov-primary btn-sm">
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="row g-3">
            {applications.slice(0, 3).map((app) => (
              <div key={app.id} className="col-md-6 col-xl-4">
                <ApplicationCard application={app} roleView="citizen" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h2 className="h5 fw-bold mb-0">Popular Government Services</h2>
          <Link to="/citizen/services" className="small fw-semibold text-decoration-none">
            All {services.length} Services <i className="bi bi-arrow-right" />
          </Link>
        </div>

        <div className="row g-3">
          {services.slice(0, 3).map((srv) => (
            <div key={srv.id} className="col-md-4">
              <div className="js-card js-card-hover p-3 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary-subtle text-primary">{srv.category}</span>
                    <span className="font-mono-code small text-muted">{srv.code}</span>
                  </div>
                  <h6 className="fw-bold mb-1">{srv.name}</h6>
                  <p className="small text-muted mb-3">{srv.shortDescription}</p>
                </div>
                <div className="pt-2 border-top d-flex align-items-center justify-content-between small">
                  <span className="text-secondary">
                    <i className="bi bi-clock me-1" />
                    {srv.processingDays} days · {formatCurrencyInr(srv.feeInr)}
                  </span>
                  <Link
                    to={`/citizen/services/${srv.id}`}
                    className="fw-semibold text-decoration-none"
                  >
                    Details <i className="bi bi-chevron-right" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
