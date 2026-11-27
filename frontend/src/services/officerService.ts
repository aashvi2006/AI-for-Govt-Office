import type { Application, OfficerDecisionPayload } from '../types/application';
import { apiClient, simulateDelay, withApiFallback } from './api';
import { authService } from './authService';
import { appendAuditLog, loadDemoDb, saveDemoDb } from './demoStore';

export const officerService = {
  async getAllApplications(): Promise<Application[]> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<Application[]>('/officer/applications');
        return data;
      },
      async () => {
        await simulateDelay(220);
        const db = loadDemoDb();
        return [...db.applications].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
      },
    );
  },

  async getPendingApplications(): Promise<Application[]> {
    const all = await this.getAllApplications();
    return all.filter((a) =>
      ['under_officer_review', 'ai_verifying', 'action_required', 'documents_pending'].includes(
        a.status,
      ),
    );
  },

  async submitDecision(
    applicationId: string,
    payload: OfficerDecisionPayload,
  ): Promise<Application> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.post<Application>(
          `/officer/applications/${applicationId}/decision`,
          payload,
        );
        return data;
      },
      async () => {
        await simulateDelay(350);
        const db = loadDemoDb();
        const app = db.applications.find((a) => a.id === applicationId);
        if (!app) throw new Error('Application not found.');

        const officer = authService.getCurrentUser();
        const now = new Date().toISOString();

        app.status = payload.decision;
        app.officerRemarks = payload.remarks;
        app.updatedAt = now;
        app.assignedOfficerId = officer?.id || 'usr-off-1';
        app.assignedOfficerName = officer?.fullName || 'Rajeshwar Verma';

        if (payload.decision === 'action_required') {
          app.requestedDocuments = payload.requestedDocuments || [];
        } else {
          app.requestedDocuments = [];
        }

        const stageLabel =
          payload.decision === 'approved'
            ? 'Application Approved'
            : payload.decision === 'rejected'
              ? 'Application Rejected'
              : 'Additional Documents Requested';

        const state =
          payload.decision === 'approved'
            ? 'completed'
            : payload.decision === 'rejected'
              ? 'danger'
              : 'warning';

        app.timeline.push({
          id: `tl-dec-${Date.now()}`,
          timestamp: now,
          stage: stageLabel,
          actor: `${app.assignedOfficerName} (Officer)`,
          description: payload.remarks,
          state,
        });

        appendAuditLog(db, {
          actorId: app.assignedOfficerId,
          actorName: app.assignedOfficerName,
          actorRole: 'officer',
          action:
            payload.decision === 'approved'
              ? 'APPLICATION_APPROVED'
              : payload.decision === 'rejected'
                ? 'APPLICATION_REJECTED'
                : 'DOCUMENT_REQUESTED',
          targetType: 'application',
          targetId: app.referenceNumber,
          details: `${stageLabel}: ${payload.remarks}`,
          severity: payload.decision === 'rejected' ? 'warning' : 'info',
        });

        saveDemoDb(db);
        return app;
      },
    );
  },
};
