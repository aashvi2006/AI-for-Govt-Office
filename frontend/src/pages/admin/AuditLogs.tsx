import { useEffect, useState } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import type { AuditLog } from '../../types/user';
import { formatDateTime } from '../../utils/helpers';

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | AuditLog['severity']>('all');

  useEffect(() => {
    adminService
      .getAuditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading system audit logs..." />;

  const filtered = logs.filter((log) => {
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const q = search.trim().toLowerCase();
    const matchesQuery =
      !q ||
      log.actorName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.targetId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q);
    return matchesSeverity && matchesQuery;
  });

  return (
    <div>
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1">System Audit Logs</h1>
        <p className="text-muted mb-0">
          Immutable compliance trail of logins, AI checks, officer decisions, and policy changes.
        </p>
      </div>

      <div className="js-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search actor, action, target ID, or details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as 'all' | AuditLog['severity'])
              }
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="col-md-3 text-md-end small text-muted">
            {filtered.length} events recorded
          </div>
        </div>
      </div>

      <div className="js-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
                <th>Severity</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td className="small text-muted text-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td>
                    <div className="fw-semibold small">{log.actorName}</div>
                    <div className="text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                      {log.actorRole}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono-code badge bg-light text-dark border">
                      {log.action}
                    </span>
                  </td>
                  <td className="font-mono-code small text-primary">{log.targetId}</td>
                  <td className="small text-secondary">{log.details}</td>
                  <td>
                    <span
                      className={`badge ${
                        log.severity === 'critical'
                          ? 'bg-danger-subtle text-danger'
                          : log.severity === 'warning'
                            ? 'bg-warning-subtle text-warning-emphasis'
                            : 'bg-info-subtle text-info-emphasis'
                      }`}
                    >
                      {log.severity}
                    </span>
                  </td>
                  <td className="font-mono-code small text-muted">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
