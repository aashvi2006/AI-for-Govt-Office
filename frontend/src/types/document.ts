export type DocumentVerificationStatus =
  | 'pending'
  | 'ai_verified'
  | 'mismatch_detected'
  | 'blurry_or_unreadable'
  | 'approved'
  | 'rejected';

export interface DocumentExtractionField {
  field: string;
  extractedValue: string;
  formValue?: string;
  matches: boolean;
  confidence: number;
}

export interface UploadedDocument {
  id: string;
  applicationId: string;
  requirementId: string;
  documentType: string;
  title: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  previewUrl: string;
  uploadedAt: string;
  status: DocumentVerificationStatus;
  aiConfidence: number;
  aiNotes: string;
  extractedFields: DocumentExtractionField[];
  officerComment?: string;
}

export interface UploadDocumentPayload {
  applicationId: string;
  requirementId: string;
  documentType: string;
  title: string;
  file: File;
}
