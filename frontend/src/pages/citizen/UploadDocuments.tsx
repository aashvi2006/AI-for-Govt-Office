import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DocumentUpload } from '../../components/DocumentUpload';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import { documentService } from '../../services/documentService';
import type { Application } from '../../types/application';
import type { DocumentRequirement } from '../../types/service';

export function UploadDocuments() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!applicationId) return;
    const app = await applicationService.getApplicationById(applicationId);
    const srvData = await applicationService.getServiceById(app.serviceId);
    setApplication(app);
    setRequirements(srvData.requirements);
  }, [applicationId]);

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    applicationService
      .getApplicationById(applicationId)
      .then(async (app) => {
        const srvData = await applicationService.getServiceById(app.serviceId);
        if (!active) return;
        setApplication(app);
        setRequirements(srvData.requirements);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load application.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  const handleUpload = async (req: DocumentRequirement, file: File) => {
    if (!application) return;
    await documentService.uploadDocument({
      applicationId: application.id,
      requirementId: req.id,
      documentType: req.documentType,
      title: req.title,
      file,
    });
    await refreshData();
  };

  const handleRemove = async (documentId: string) => {
    if (!application) return;
    await documentService.removeDocument(application.id, documentId);
    await refreshData();
  };

  const handleRunVerification = async () => {
    if (!application) return;
    setVerifying(true);
    setError(null);
    try {
      await applicationService.runAiVerification(application.id);
      navigate(`/citizen/applications/${application.id}/verification`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading document checklist..." />;
  if (!application) {
    return <div className="alert alert-danger">{error || 'Application not found.'}</div>;
  }

  const mandatoryReqs = requirements.filter((r) => r.mandatory);
  const uploadedReqIds = new Set(application.documents.map((d) => d.requirementId));
  const uploadedMandatoryCount = mandatoryReqs.filter((r) => uploadedReqIds.has(r.id)).length;
  const progressPct =
    mandatoryReqs.length === 0
      ? 100
      : Math.round((uploadedMandatoryCount / mandatoryReqs.length) * 100);

  return (
    <div style={{ maxWidth: 960 }} className="mx-auto">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <Link
          to={`/citizen/applications/${application.id}/track`}
          className="text-decoration-none small fw-medium"
        >
          <i className="bi bi-arrow-left me-1" />
          Back to Application Tracking
        </Link>
        <span className="font-mono-code small text-muted">
          Ref: {application.referenceNumber}
        </span>
      </div>

      <div className="js-card p-4 mb-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h1 className="h4 fw-bold mb-0">Document Upload & Pre-Verification</h1>
              <StatusBadge status={application.status} />
            </div>
            <div className="small text-muted">
              Service: <strong>{application.serviceName}</strong> · {application.department}
            </div>
          </div>
          <span className="badge bg-primary-subtle text-primary px-3 py-2">
            Step 2 · Upload & OCR Check
          </span>
        </div>

        {application.requestedDocuments && application.requestedDocuments.length > 0 && (
          <div className="alert alert-warning small mb-3">
            <strong>
              <i className="bi bi-exclamation-triangle-fill me-1" />
              Officer Requested Documents:
            </strong>{' '}
            {application.requestedDocuments.join(', ')}
            {application.officerRemarks ? ` — "${application.officerRemarks}"` : ''}
          </div>
        )}

        <div className="d-flex justify-content-between small mb-1">
          <span className="fw-medium">
            Mandatory Documents Uploaded: {uploadedMandatoryCount} of {mandatoryReqs.length}
          </span>
          <span className="fw-bold">{progressPct}%</span>
        </div>
        <div className="progress" style={{ height: 8 }}>
          <div
            className={`progress-bar ${progressPct === 100 ? 'bg-success' : 'bg-primary'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}

      {requirements.map((req) => {
        const existingDoc = application.documents.find((d) => d.requirementId === req.id);
        return (
          <DocumentUpload
            key={req.id}
            requirement={req}
            existingDocument={existingDoc}
            onUpload={handleUpload}
            onRemove={handleRemove}
          />
        );
      })}

      <div className="js-card p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mt-4">
        <div className="small text-secondary">
          <i className="bi bi-cpu text-primary me-1" />
          JanSahayak AI will check completeness, OCR consistency, and eligibility rules before officer review.
        </div>
        <div className="d-flex gap-2">
          {application.aiReport && (
            <Link
              to={`/citizen/applications/${application.id}/verification`}
              className="btn btn-outline-secondary"
            >
              View Last AI Report
            </Link>
          )}
          <button
            type="button"
            className="btn btn-gov-primary px-4"
            onClick={() => void handleRunVerification()}
            disabled={verifying}
          >
            {verifying ? (
              <LoadingSpinner compact message="Running AI Verification..." />
            ) : (
              <>
                <i className="bi bi-stars me-2" />
                Run AI Verification & Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
