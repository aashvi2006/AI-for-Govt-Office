import type { UploadedDocument } from './document';

export type ApplicationStatus =
  | 'draft'
  | 'documents_pending'
  | 'ai_verifying'
  | 'under_officer_review'
  | 'action_required'
  | 'approved'
  | 'rejected';

export interface VerificationFinding {
  id: string;
  type: 'missing_document' | 'inconsistency' | 'eligibility_flag' | 'passed';
  severity: 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  fieldAffected?: string;
}

export interface AIVerificationReport {
  generatedAt: string;
  overallScore: number;
  eligibilityPassed: boolean;
  completenessScore: number;
  consistencyScore: number;
  summary: string;
  missingDocuments: string[];
  findings: VerificationFinding[];
  recommendedAction: 'recommend_approve' | 'manual_review' | 'request_documents' | 'recommend_reject';
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  actor: string;
  description: string;
  state: 'completed' | 'active' | 'warning' | 'danger';
}

export interface Application {
  id: string;
  referenceNumber: string;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  serviceId: string;
  serviceName: string;
  department: string;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  formData: Record<string, string | number>;
  documents: UploadedDocument[];
  aiReport?: AIVerificationReport;
  officerRemarks?: string;
  requestedDocuments?: string[];
  timeline: TimelineEvent[];
}

export interface CreateApplicationPayload {
  serviceId: string;
  formData: Record<string, string | number>;
}

export interface OfficerDecisionPayload {
  decision: 'approved' | 'rejected' | 'action_required';
  remarks: string;
  requestedDocuments?: string[];
}
