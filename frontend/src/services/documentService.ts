import type {
  DocumentVerificationStatus,
  UploadDocumentPayload,
  UploadedDocument,
} from '../types/document';
import { buildSampleDocumentPreview } from '../utils/helpers';
import { apiClient, simulateDelay, withApiFallback } from './api';
import { authService } from './authService';
import {
  appendAuditLog,
  buildSimulatedDocumentOcr,
  loadDemoDb,
  saveDemoDb,
} from './demoStore';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        resolve('');
      }
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export const documentService = {
  async uploadDocument(payload: UploadDocumentPayload): Promise<UploadedDocument> {
    return withApiFallback(
      async () => {
        const form = new FormData();
        form.append('applicationId', payload.applicationId);
        form.append('requirementId', payload.requirementId);
        form.append('documentType', payload.documentType);
        form.append('title', payload.title);
        form.append('file', payload.file);
        const { data } = await apiClient.post<UploadedDocument>('/documents/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      },
      async () => {
        await simulateDelay(450);
        const db = loadDemoDb();
        const app = db.applications.find((a) => a.id === payload.applicationId);
        if (!app) throw new Error('Application not found.');

        let previewUrl = '';
        if (payload.file.type.startsWith('image/')) {
          previewUrl = await readFileAsDataUrl(payload.file);
        } else {
          previewUrl = buildSampleDocumentPreview(
            payload.title.toUpperCase(),
            String(app.formData.applicantName || app.citizenName),
            `FILE: ${payload.file.name}`,
            [
              `Application Ref: ${app.referenceNumber}`,
              `Document Type: ${payload.documentType}`,
              `Size: ${(payload.file.size / 1024).toFixed(1)} KB`,
            ],
          );
        }

        const baseDoc = {
          id: `doc-${Date.now()}`,
          applicationId: payload.applicationId,
          requirementId: payload.requirementId,
          documentType: payload.documentType,
          title: payload.title,
          fileName: payload.file.name,
          fileSizeBytes: payload.file.size,
          mimeType: payload.file.type || 'application/pdf',
          previewUrl,
          uploadedAt: new Date().toISOString(),
        };

        const ocrResult = buildSimulatedDocumentOcr(baseDoc, app);
        const uploadedDoc: UploadedDocument = {
          ...baseDoc,
          ...ocrResult,
        };

        // Replace existing document for the same requirement if re-uploaded
        const existingIdx = app.documents.findIndex(
          (d) => d.requirementId === payload.requirementId,
        );
        if (existingIdx >= 0) {
          app.documents[existingIdx] = uploadedDoc;
        } else {
          app.documents.push(uploadedDoc);
        }

        app.updatedAt = new Date().toISOString();
        if (app.requestedDocuments?.includes(payload.title)) {
          app.requestedDocuments = app.requestedDocuments.filter((t) => t !== payload.title);
        }

        const user = authService.getCurrentUser();
        appendAuditLog(db, {
          actorId: user?.id || app.citizenId,
          actorName: user?.fullName || app.citizenName,
          actorRole: user?.role || 'citizen',
          action: 'DOCUMENT_UPLOADED',
          targetType: 'document',
          targetId: uploadedDoc.id,
          details: `Uploaded ${payload.title} (${payload.file.name}) for ${app.referenceNumber}.`,
          severity: 'info',
        });

        saveDemoDb(db);
        return uploadedDoc;
      },
    );
  },

  async removeDocument(applicationId: string, documentId: string): Promise<void> {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/documents/${documentId}`);
      },
      async () => {
        await simulateDelay(180);
        const db = loadDemoDb();
        const app = db.applications.find((a) => a.id === applicationId);
        if (!app) throw new Error('Application not found.');
        app.documents = app.documents.filter((d) => d.id !== documentId);
        app.updatedAt = new Date().toISOString();
        saveDemoDb(db);
      },
    );
  },

  async updateDocumentStatus(
    applicationId: string,
    documentId: string,
    status: DocumentVerificationStatus,
    officerComment?: string,
  ): Promise<UploadedDocument> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.patch<UploadedDocument>(`/documents/${documentId}/inspect`, {
          status,
          officerComment,
        });
        return data;
      },
      async () => {
        await simulateDelay(220);
        const db = loadDemoDb();
        const app = db.applications.find((a) => a.id === applicationId);
        if (!app) throw new Error('Application not found.');
        const doc = app.documents.find((d) => d.id === documentId);
        if (!doc) throw new Error('Document not found.');

        doc.status = status;
        if (officerComment !== undefined) {
          doc.officerComment = officerComment;
        }
        app.updatedAt = new Date().toISOString();

        const user = authService.getCurrentUser();
        appendAuditLog(db, {
          actorId: user?.id || 'usr-off-1',
          actorName: user?.fullName || 'Verification Officer',
          actorRole: user?.role || 'officer',
          action: 'DOCUMENT_INSPECTED',
          targetType: 'document',
          targetId: doc.id,
          details: `Marked ${doc.title} as ${status} on ${app.referenceNumber}.`,
          severity: status === 'rejected' ? 'warning' : 'info',
        });

        saveDemoDb(db);
        return doc;
      },
    );
  },
};
