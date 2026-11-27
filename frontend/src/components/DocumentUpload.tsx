import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import type { UploadedDocument } from '../types/document';
import type { DocumentRequirement } from '../types/service';
import { formatFileSize } from '../utils/helpers';
import { LoadingSpinner } from './LoadingSpinner';
import { StatusBadge } from './StatusBadge';

interface DocumentUploadProps {
  requirement: DocumentRequirement;
  existingDocument?: UploadedDocument;
  onUpload: (requirement: DocumentRequirement, file: File) => Promise<void>;
  onRemove?: (documentId: string) => Promise<void>;
}

export function DocumentUpload({
  requirement,
  existingDocument,
  onUpload,
  onRemove,
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    const maxBytes = requirement.maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File exceeds maximum size of ${requirement.maxSizeMb} MB.`);
      return;
    }

    setUploading(true);
    try {
      await onUpload(requirement, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFile(file);
    }
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  };

  return (
    <div className="js-card p-3 mb-3">
      <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-2 mb-2">
        <div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h6 className="fw-bold mb-0">{requirement.title}</h6>
            {requirement.mandatory ? (
              <span className="badge bg-danger-subtle text-danger">Mandatory</span>
            ) : (
              <span className="badge bg-secondary-subtle text-secondary">Optional</span>
            )}
            {existingDocument && <StatusBadge status={existingDocument.status} kind="document" />}
          </div>
          <p className="small text-muted mb-1 mt-1">{requirement.description}</p>
          <div className="small text-secondary">
            Accepted: <strong>{requirement.acceptedFormats.join(', ')}</strong> · Max{' '}
            <strong>{requirement.maxSizeMb} MB</strong>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2 px-3 small mb-2">
          <i className="bi bi-exclamation-circle me-1" />
          {error}
        </div>
      )}

      {existingDocument ? (
        <div className="border rounded-3 p-3 bg-light">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-3">
              <div className="fs-3 text-primary">
                <i className="bi bi-file-earmark-check-fill" />
              </div>
              <div>
                <div className="fw-semibold text-dark">{existingDocument.fileName}</div>
                <div className="small text-muted">
                  {formatFileSize(existingDocument.fileSizeBytes)} · AI Confidence:{' '}
                  <strong>{existingDocument.aiConfidence}%</strong>
                </div>
                <div className="small text-secondary mt-1">{existingDocument.aiNotes}</div>
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowPreview((prev) => !prev)}
              >
                <i className={`bi ${showPreview ? 'bi-eye-slash' : 'bi-eye'} me-1`} />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                <i className="bi bi-arrow-repeat me-1" />
                Replace
              </button>
              {onRemove && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => void onRemove(existingDocument.id)}
                  disabled={uploading}
                >
                  <i className="bi bi-trash" />
                </button>
              )}
            </div>
          </div>

          {showPreview && existingDocument.previewUrl && (
            <div className="mt-3 pt-3 border-top text-center">
              <img
                src={existingDocument.previewUrl}
                alt={existingDocument.title}
                className="img-fluid rounded border shadow-sm"
                style={{ maxHeight: 320, objectFit: 'contain' }}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          className={`js-dropzone ${isDragging ? 'dragging' : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
          }}
        >
          {uploading ? (
            <LoadingSpinner compact message="Uploading & running AI OCR scan..." />
          ) : (
            <>
              <i className="bi bi-cloud-arrow-up fs-2 text-primary d-block mb-2" />
              <div className="fw-semibold text-dark">
                Drag and drop file here, or <span className="text-primary text-decoration-underline">browse</span>
              </div>
              <div className="small text-muted mt-1">
                Tip: Include <code>blur</code> or <code>mismatch</code> in filename to test AI alert detection.
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="d-none"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={onInputChange}
      />
    </div>
  );
}
