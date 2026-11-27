import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import { officerService } from '../../services/officerService';
import type { Application, OfficerDecisionPayload } from '../../types/application';
import { formatDateTime } from '../../utils/helpers';

export function ApplicationReview() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [decision, setDecision] = useState<OfficerDecisionPayload['decision']>('approved');
  const [remarks, setRemarks] = useState('');
  const [requestedDocInput, setRequestedDocInput] = useState('');

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    applicationService
      .getApplicationById(applicationId)
      .then((app) => {
        if (!active) return;
        setApplication(app);
        if (app.aiReport?.missingDocuments.length) {
          setRequestedDocInput(app.aiReport.missingDocuments.join(', '));
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load case.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  const handleDecisionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!application) return;
    if (!remarks.trim()) {
      setError('Please provide official officer remarks before recording a decision.');
      return;
    }

    setError(null);
    setFeedback(null);
    setSubmitting(true);
    try {
      const updated = await officerService.submitDecision(application.id, {
        decision,
        remarks: remarks.trim(),
        requestedDocuments:
          decision === 'action_required'
            ? requestedDocInput
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
      });
      setApplication(updated);
      setFeedback(`Case ${updated.referenceNumber} updated to "${updated.status.replace('_', ' ')}".`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decision submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading application review dossier..." />;
  if (!application) {
    return <div className="alert alert-danger">{error || 'Application not found.'}</div>;
  }

  const report = application.aiReport;

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <Link to="/officer/pending" className="text-decoration-none small fw-medium">
          <i className="bi bi-arrow-left me-1" />
          Back to Pending Queue
        </Link>
        <div className="d-flex align-items-center gap-2">
          <span className="font-mono-code small text-muted">{application.referenceNumber}</span>
          <StatusBadge status={application.status} />
        </div>
      </div>

      <div className="js-card p-4 mb-4">
        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
          <div>
            <h1 className="h4 fw-bold mb-1">{application.serviceName}</h1>
            <div className="small text-muted">
              Applicant: <strong>{application.citizenName}</strong> ({application.citizenEmail}) ·
              Submitted {formatDateTime(application.submittedAt)}
            </div>
          </div>
          <Link
            to={`/officer/applications/${application.id}/documents`}
            className="btn btn-gov-outline"
          >
            <i className="bi bi-file-earmark-richtext me-2" />
            Inspect Documents ({application.documents.length})
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}
      {feedback && (
        <div className="alert alert-success small">
          <i className="bi bi-check-circle-fill me-2" />
          {feedback}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          {/* AI Verification Visualization */}
          <div className="js-card p-4 mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h2 className="h5 fw-bold mb-0">
                <i className="bi bi-cpu text-primary me-2" />
                AI Verification Report
              </h2>
              {report && (
                <span className="badge bg-primary-subtle text-primary px-3 py-2">
                  Recommendation: {report.recommendedAction.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>

            {!report ? (
              <div className="text-muted small">AI verification report has not been generated yet.</div>
            ) : (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-sm-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="small text-muted">Overall AI Score</div>
                      <div className="fs-3 fw-bold">{report.overallScore}/100</div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="small text-muted">Completeness</div>
                      <div className="fs-3 fw-bold">{report.completenessScore}%</div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="p-3 rounded-3 bg-light border">
                      <div className="small text-muted">Rule Eligibility</div>
                      <div className="fs-5 fw-bold mt-1">
                        {report.eligibilityPassed ? (
                          <span className="text-success">Passed</span>
                        ) : (
                          <span className="text-danger">Failed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="small text-secondary mb-3">{report.summary}</p>

                <div className="d-flex flex-column gap-2">
                  {report.findings.map((f) => (
                    <div
                      key={f.id}
                      className={`p-3 rounded border small ${
                        f.severity === 'high'
                          ? 'border-danger bg-danger-subtle'
                          : f.severity === 'medium'
                            ? 'border-warning bg-warning-subtle'
                            : 'border-success bg-success-subtle'
                      }`}
                    >
                      <div className="fw-bold">{f.title}</div>
                      <div>{f.description}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Submitted Form Data */}
          <div className="js-card p-4 mb-4">
            <h2 className="h5 fw-bold mb-3">Submitted Application Fields</h2>
            <div className="row g-3">
              {Object.entries(application.formData).map(([key, val]) => (
                <div key={key} className="col-sm-6">
                  <div className="p-2 px-3 rounded bg-light border">
                    <div className="text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </div>
                    <div className="fw-semibold text-dark">{String(val)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Document List */}
          <div className="js-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 fw-bold mb-0">Uploaded Documents ({application.documents.length})</h2>
              <Link
                to={`/officer/applications/${application.id}/documents`}
                className="small fw-semibold text-decoration-none"
              >
                Open Full Document Inspector <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <thead>
                  <tr>
                    <th>Document</th>
                    <th>Status</th>
                    <th>AI Confidence</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {application.documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="fw-medium small">{doc.title}</td>
                      <td>
                        <StatusBadge status={doc.status} kind="document" />
                      </td>
                      <td className="small fw-bold">{doc.aiConfidence}%</td>
                      <td className="small text-muted">{doc.aiNotes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Officer Action Panel */}
        <div className="col-lg-4">
          <div className="js-card p-4 sticky-top" style={{ top: 88 }}>
            <h2 className="h5 fw-bold mb-3">Officer Determination</h2>
            <form onSubmit={handleDecisionSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Select Action</label>
                <div className="d-flex flex-column gap-2">
                  <label className="border rounded p-2 d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'approved'}
                      onChange={() => setDecision('approved')}
                    />
                    <span className="fw-semibold text-success small">
                      <i className="bi bi-check-circle-fill me-1" />
                      Approve Application
                    </span>
                  </label>
                  <label className="border rounded p-2 d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'action_required'}
                      onChange={() => setDecision('action_required')}
                    />
                    <span className="fw-semibold text-warning-emphasis small">
                      <i className="bi bi-file-earmark-arrow-up me-1" />
                      Request Additional Documents
                    </span>
                  </label>
                  <label className="border rounded p-2 d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'rejected'}
                      onChange={() => setDecision('rejected')}
                    />
                    <span className="fw-semibold text-danger small">
                      <i className="bi bi-x-circle-fill me-1" />
                      Reject Application
                    </span>
                  </label>
                </div>
              </div>

              {decision === 'action_required' && (
                <div className="mb-3">
                  <label htmlFor="reqDocsInput" className="form-label small fw-semibold">
                    Requested Document Titles (comma-separated)
                  </label>
                  <input
                    id="reqDocsInput"
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Updated Income Proof, Ration Card"
                    value={requestedDocInput}
                    onChange={(e) => setRequestedDocInput(e.target.value)}
                  />
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="officerRemarks" className="form-label small fw-semibold">
                  Official Remarks <span className="text-danger">*</span>
                </label>
                <textarea
                  id="officerRemarks"
                  className="form-control"
                  rows={4}
                  placeholder="Enter verification rationale, statutory notes, or citizen instructions..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn w-100 fw-semibold ${
                  decision === 'approved'
                    ? 'btn-success'
                    : decision === 'rejected'
                      ? 'btn-danger'
                      : 'btn-warning'
                }`}
                disabled={submitting}
              >
                {submitting ? (
                  <LoadingSpinner compact message="Recording Decision..." />
                ) : (
                  'Submit Official Decision'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
