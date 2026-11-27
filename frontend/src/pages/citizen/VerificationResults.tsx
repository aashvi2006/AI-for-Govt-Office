import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import type { Application } from '../../types/application';
import { formatDateTime } from '../../utils/helpers';

export function VerificationResults() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    applicationService
      .getApplicationById(applicationId)
      .then((app) => {
        if (active) setApplication(app);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load results.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  const handleRerun = async () => {
    if (!application) return;
    setRunning(true);
    try {
      const res = await applicationService.runAiVerification(application.id);
      setApplication(res.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run verification.');
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading AI verification results..." />;
  if (error || !application) {
    return <div className="alert alert-danger">{error || 'Application not found.'}</div>;
  }

  const report = application.aiReport;
  const scoreColor =
    !report
      ? 'border-secondary text-secondary'
      : report.overallScore >= 85
        ? 'border-success text-success'
        : report.overallScore >= 65
          ? 'border-warning text-warning-emphasis'
          : 'border-danger text-danger';

  return (
    <div style={{ maxWidth: 980 }} className="mx-auto">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <Link
          to={`/citizen/applications/${application.id}/track`}
          className="text-decoration-none small fw-medium"
        >
          <i className="bi bi-arrow-left me-1" />
          Go to Application Tracker
        </Link>
        <span className="font-mono-code small text-muted">
          Ref: {application.referenceNumber}
        </span>
      </div>

      <div className="js-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h1 className="h4 fw-bold mb-0">AI Pre-Verification Results</h1>
              <StatusBadge status={application.status} />
            </div>
            <div className="small text-muted">
              {application.serviceName} · {application.department}
            </div>
          </div>
          <div className="d-flex gap-2">
            <Link
              to={`/citizen/applications/${application.id}/documents`}
              className="btn btn-outline-secondary btn-sm"
            >
              <i className="bi bi-upload me-1" />
              Update Documents
            </Link>
            <button
              type="button"
              onClick={() => void handleRerun()}
              disabled={running}
              className="btn btn-gov-primary btn-sm"
            >
              {running ? (
                <LoadingSpinner compact message="Re-verifying..." />
              ) : (
                <>
                  <i className="bi bi-arrow-clockwise me-1" />
                  Re-run AI Check
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {!report ? (
        <div className="js-card p-5 text-center">
          <i className="bi bi-cpu fs-1 text-primary d-block mb-2" />
          <h5 className="fw-bold">AI Verification Not Yet Run</h5>
          <p className="text-muted small mb-3">
            Upload your mandatory documents and run the AI pre-check to see missing items or discrepancies.
          </p>
          <button
            type="button"
            className="btn btn-gov-primary"
            onClick={() => void handleRerun()}
            disabled={running}
          >
            Run AI Verification Now
          </button>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div className="js-card p-3 h-100 d-flex align-items-center gap-3">
                <div className={`js-score-badge ${scoreColor}`}>
                  <span className="fs-5 lh-1">{report.overallScore}</span>
                  <span style={{ fontSize: '0.65rem' }}>/100</span>
                </div>
                <div>
                  <div className="small text-muted">Overall Readiness</div>
                  <div className="fw-bold text-dark">
                    {report.overallScore >= 85
                      ? 'Strong Submission'
                      : report.overallScore >= 65
                        ? 'Needs Attention'
                        : 'High Risk / Incomplete'}
                  </div>
                  <div className="small text-muted">
                    Checked {formatDateTime(report.generatedAt)}
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="js-card p-3 h-100">
                <div className="small text-muted mb-1">Document Completeness</div>
                <div className="fs-4 fw-bold mb-1">{report.completenessScore}%</div>
                <div className="progress" style={{ height: 6 }}>
                  <div
                    className={`progress-bar ${report.completenessScore === 100 ? 'bg-success' : 'bg-warning'}`}
                    style={{ width: `${report.completenessScore}%` }}
                  />
                </div>
                <div className="small text-muted mt-2">
                  {report.missingDocuments.length === 0
                    ? 'All mandatory documents attached'
                    : `${report.missingDocuments.length} mandatory document(s) missing`}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="js-card p-3 h-100">
                <div className="small text-muted mb-1">Data & Rule Consistency</div>
                <div className="fs-4 fw-bold mb-1">{report.consistencyScore}%</div>
                <div className="small">
                  Eligibility:{' '}
                  {report.eligibilityPassed ? (
                    <span className="badge bg-success-subtle text-success">
                      <i className="bi bi-check-circle me-1" />
                      Passed Rules
                    </span>
                  ) : (
                    <span className="badge bg-danger-subtle text-danger">
                      <i className="bi bi-x-circle me-1" />
                      Rule Flagged
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="js-card p-4 mb-4">
            <h2 className="h6 fw-bold mb-2">AI Assessment Summary</h2>
            <p className="text-secondary mb-0">{report.summary}</p>
          </div>

          {report.missingDocuments.length > 0 && (
            <div className="alert alert-danger mb-4">
              <div className="fw-bold mb-1">
                <i className="bi bi-file-earmark-x me-2" />
                Missing Mandatory Documents
              </div>
              <ul className="mb-2">
                {report.missingDocuments.map((docTitle) => (
                  <li key={docTitle}>{docTitle}</li>
                ))}
              </ul>
              <Link
                to={`/citizen/applications/${application.id}/documents`}
                className="btn btn-sm btn-danger"
              >
                Upload Missing Documents
              </Link>
            </div>
          )}

          <div className="js-card p-4 mb-4">
            <h2 className="h5 fw-bold mb-3">Detected Findings & Discrepancies</h2>
            <div className="d-flex flex-column gap-3">
              {report.findings.map((finding) => {
                const style =
                  finding.severity === 'high'
                    ? 'border-danger bg-danger-subtle text-danger-emphasis'
                    : finding.severity === 'medium'
                      ? 'border-warning bg-warning-subtle text-warning-emphasis'
                      : 'border-success bg-success-subtle text-success-emphasis';

                return (
                  <div key={finding.id} className={`p-3 rounded-3 border ${style}`}>
                    <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                      <span className="fw-bold">{finding.title}</span>
                      <span className="badge bg-white text-dark text-uppercase">
                        {finding.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="small">{finding.description}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="js-card p-4">
            <h2 className="h5 fw-bold mb-3">Document OCR Verification Matrix</h2>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Extracted Key Fields</th>
                  </tr>
                </thead>
                <tbody>
                  {application.documents.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div className="fw-semibold">{doc.title}</div>
                        <div className="small text-muted">{doc.fileName}</div>
                      </td>
                      <td>
                        <StatusBadge status={doc.status} kind="document" />
                      </td>
                      <td>
                        <strong>{doc.aiConfidence}%</strong>
                      </td>
                      <td>
                        {doc.extractedFields.map((ef) => (
                          <div key={ef.field} className="small">
                            <span className="text-muted">{ef.field}:</span>{' '}
                            <strong className={ef.matches ? 'text-success' : 'text-danger'}>
                              {ef.extractedValue}
                            </strong>
                            {!ef.matches && ef.formValue && (
                              <span className="text-muted"> (Form: {ef.formValue})</span>
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
