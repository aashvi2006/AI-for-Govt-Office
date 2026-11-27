import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { StatusBadge } from '../../components/StatusBadge';
import { applicationService } from '../../services/applicationService';
import { documentService } from '../../services/documentService';
import type { Application } from '../../types/application';
import type { DocumentVerificationStatus, UploadedDocument } from '../../types/document';
import { formatDateTime, formatFileSize } from '../../utils/helpers';

export function DocumentInspection() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [application, setApplication] = useState<Application | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [comment, setComment] = useState('');
  const [zoomed, setZoomed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) return;
    let active = true;
    applicationService
      .getApplicationById(applicationId)
      .then((app) => {
        if (!active) return;
        setApplication(app);
        if (app.documents.length > 0) {
          setSelectedDocId(app.documents[0].id);
          setComment(app.documents[0].officerComment || '');
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load documents.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [applicationId]);

  const selectedDoc: UploadedDocument | undefined = application?.documents.find(
    (d) => d.id === selectedDocId,
  );

  const handleSelectDoc = (doc: UploadedDocument) => {
    setSelectedDocId(doc.id);
    setComment(doc.officerComment || '');
    setZoomed(false);
  };

  const handleInspectDecision = async (status: DocumentVerificationStatus) => {
    if (!application || !selectedDoc) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await documentService.updateDocumentStatus(
        application.id,
        selectedDoc.id,
        status,
        comment.trim() || undefined,
      );
      setApplication((prev) =>
        prev
          ? {
              ...prev,
              documents: prev.documents.map((d) => (d.id === updated.id ? updated : d)),
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading document inspection workbench..." />;
  if (!application) {
    return <div className="alert alert-danger">{error || 'Application not found.'}</div>;
  }

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <Link
          to={`/officer/applications/${application.id}`}
          className="text-decoration-none small fw-medium"
        >
          <i className="bi bi-arrow-left me-1" />
          Back to Case Review ({application.referenceNumber})
        </Link>
        <span className="small text-muted">
          Applicant: <strong>{application.citizenName}</strong>
        </span>
      </div>

      <h1 className="h4 fw-bold mb-3">Side-by-Side Document Inspection</h1>

      {error && <div className="alert alert-danger small">{error}</div>}

      {application.documents.length === 0 ? (
        <div className="js-card p-5 text-center text-muted">
          No documents uploaded for this application yet.
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-lg-3">
            <div className="js-card p-3">
              <div className="small fw-bold text-uppercase text-muted mb-2">
                Uploaded Files ({application.documents.length})
              </div>
              <div className="d-flex flex-column gap-2">
                {application.documents.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectDoc(doc)}
                    className={`btn text-start p-2 px-3 border rounded-3 ${
                      doc.id === selectedDocId
                        ? 'bg-primary-subtle border-primary'
                        : 'bg-white'
                    }`}
                  >
                    <div className="fw-semibold small text-dark text-truncate">{doc.title}</div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <StatusBadge status={doc.status} kind="document" />
                      <span className="small text-muted">{doc.aiConfidence}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedDoc && (
            <>
              <div className="col-lg-5">
                <div className="js-card p-3 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <div className="fw-bold small">{selectedDoc.fileName}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {formatFileSize(selectedDoc.fileSizeBytes)} · Uploaded{' '}
                        {formatDateTime(selectedDoc.uploadedAt)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setZoomed((z) => !z)}
                    >
                      <i className={`bi ${zoomed ? 'bi-zoom-out' : 'bi-zoom-in'} me-1`} />
                      {zoomed ? 'Reset' : 'Zoom'}
                    </button>
                  </div>

                  <div
                    className="border rounded bg-light p-2 text-center overflow-auto"
                    style={{ maxHeight: 460 }}
                  >
                    <img
                      src={selectedDoc.previewUrl}
                      alt={selectedDoc.title}
                      className="img-fluid rounded shadow-sm"
                      style={{
                        transform: zoomed ? 'scale(1.35)' : 'scale(1)',
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="js-card p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h2 className="h6 fw-bold mb-0">OCR Extracted vs Form</h2>
                    <StatusBadge status={selectedDoc.status} kind="document" />
                  </div>
                  <p className="small text-secondary mb-3">{selectedDoc.aiNotes}</p>

                  <div className="table-responsive">
                    <table className="table table-sm small mb-0">
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Extracted</th>
                          <th>Match</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDoc.extractedFields.map((ef) => (
                          <tr key={ef.field}>
                            <td className="text-muted">{ef.field}</td>
                            <td className="fw-semibold">{ef.extractedValue}</td>
                            <td>
                              {ef.matches ? (
                                <span className="badge bg-success-subtle text-success">Yes</span>
                              ) : (
                                <span className="badge bg-danger-subtle text-danger">No</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="js-card p-3">
                  <h2 className="h6 fw-bold mb-2">Officer Inspection Verdict</h2>
                  <textarea
                    className="form-control form-control-sm mb-3"
                    rows={3}
                    placeholder="Optional comment for audit log & citizen..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-success flex-grow-1"
                      disabled={saving}
                      onClick={() => void handleInspectDecision('approved')}
                    >
                      <i className="bi bi-check-lg me-1" />
                      Approve Doc
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger flex-grow-1"
                      disabled={saving}
                      onClick={() => void handleInspectDecision('rejected')}
                    >
                      <i className="bi bi-x-lg me-1" />
                      Reject Doc
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
