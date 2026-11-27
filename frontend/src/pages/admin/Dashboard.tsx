import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import { applicationService } from '../../services/applicationService';
import type { DocumentRequirement, EligibilityRule, GovernmentService } from '../../types/service';
import type { AuditLog, User } from '../../types/user';
import { formatDateTime } from '../../utils/helpers';

export function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<GovernmentService[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetNotice, setResetNotice] = useState(false);

  const reloadAll = async () => {
    setLoading(true);
    try {
      const [u, s, d, r, l] = await Promise.all([
        adminService.getUsers(),
        applicationService.getServices(false),
        adminService.getDocumentRequirements(),
        adminService.getRules(),
        adminService.getAuditLogs(),
      ]);
      setUsers(u);
      setServices(s);
      setRequirements(d);
      setRules(r);
      setLogs(l);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      adminService.getUsers(),
      applicationService.getServices(false),
      adminService.getDocumentRequirements(),
      adminService.getRules(),
      adminService.getAuditLogs(),
    ])
      .then(([u, s, d, r, l]) => {
        if (!active) return;
        setUsers(u);
        setServices(s);
        setRequirements(d);
        setRules(r);
        setLogs(l);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleResetDemo = () => {
    adminService.resetDemoDatabase();
    setResetNotice(true);
    void reloadAll();
  };

  if (loading) return <LoadingSpinner message="Loading administration console..." />;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">System Administration Console</h1>
          <p className="text-muted mb-0">
            Configure government services, AI eligibility policies, user permissions, and audit compliance.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={handleResetDemo}
        >
          <i className="bi bi-arrow-counterclockwise me-1" />
          Reset Demo Data
        </button>
      </div>

      {resetNotice && (
        <div className="alert alert-info py-2 px-3 small">
          Demo database restored to initial seed state.
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <Link to="/admin/users" className="text-decoration-none">
            <div className="js-card js-card-hover p-3 h-100 d-flex align-items-center gap-3">
              <div className="js-kpi-icon bg-primary-subtle text-primary">
                <i className="bi bi-people" />
              </div>
              <div>
                <div className="small text-muted">Registered Users</div>
                <div className="fs-4 fw-bold text-dark">{users.length}</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-3">
          <Link to="/admin/services" className="text-decoration-none">
            <div className="js-card js-card-hover p-3 h-100 d-flex align-items-center gap-3">
              <div className="js-kpi-icon bg-success-subtle text-success">
                <i className="bi bi-building-gear" />
              </div>
              <div>
                <div className="small text-muted">Gov Services</div>
                <div className="fs-4 fw-bold text-dark">{services.length}</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-3">
          <Link to="/admin/document-requirements" className="text-decoration-none">
            <div className="js-card js-card-hover p-3 h-100 d-flex align-items-center gap-3">
              <div className="js-kpi-icon bg-info-subtle text-info-emphasis">
                <i className="bi bi-file-earmark-ruled" />
              </div>
              <div>
                <div className="small text-muted">Document Rules</div>
                <div className="fs-4 fw-bold text-dark">{requirements.length}</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-6 col-lg-3">
          <Link to="/admin/rules" className="text-decoration-none">
            <div className="js-card js-card-hover p-3 h-100 d-flex align-items-center gap-3">
              <div className="js-kpi-icon bg-warning-subtle text-warning-emphasis">
                <i className="bi bi-diagram-3" />
              </div>
              <div>
                <div className="small text-muted">Eligibility Rules</div>
                <div className="fs-4 fw-bold text-dark">{rules.length}</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="js-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="h5 fw-bold mb-0">Recent System Audit Events</h2>
          <Link to="/admin/audit-logs" className="small fw-semibold text-decoration-none">
            Full Audit Trail <i className="bi bi-arrow-right" />
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 6).map((log) => (
                <tr key={log.id}>
                  <td className="small text-muted text-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="small fw-medium">{log.actorName}</td>
                  <td>
                    <span className="font-mono-code badge bg-light text-dark border">
                      {log.action}
                    </span>
                  </td>
                  <td className="font-mono-code small text-primary">{log.targetId}</td>
                  <td className="small text-secondary">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
