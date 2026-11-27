import type {
  AIVerificationReport,
  Application,
  CreateApplicationPayload,
} from '../types/application';
import type {
  DocumentRequirement,
  EligibilityRule,
  GovernmentService,
} from '../types/service';
import { apiClient, simulateDelay, withApiFallback } from './api';
import { authService } from './authService';
import {
  appendAuditLog,
  generateAiVerificationReport,
  loadDemoDb,
  saveDemoDb,
} from './demoStore';

export const applicationService = {
  async getServices(onlyActive = true): Promise<GovernmentService[]> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<GovernmentService[]>('/services');
        return onlyActive ? data.filter((s) => s.isActive) : data;
      },
      async () => {
        await simulateDelay(180);
        const db = loadDemoDb();
        return onlyActive ? db.services.filter((s) => s.isActive) : db.services;
      },
    );
  },

  async getServiceById(serviceId: string): Promise<{
    service: GovernmentService;
    requirements: DocumentRequirement[];
    rules: EligibilityRule[];
  }> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<{
          service: GovernmentService;
          requirements: DocumentRequirement[];
          rules: EligibilityRule[];
        }>(`/services/${serviceId}`);
        return data;
      },
      async () => {
        await simulateDelay(180);
        const db = loadDemoDb();
        const service = db.services.find((s) => s.id === serviceId);
        if (!service) {
          throw new Error('Requested government service was not found.');
        }
        return {
          service,
          requirements: db.documentRequirements.filter((r) => r.serviceId === serviceId),
          rules: db.eligibilityRules.filter((r) => r.serviceId === serviceId && r.isActive),
        };
      },
    );
  },

  async getMyApplications(): Promise<Application[]> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<Application[]>('/applications/my');
        return data;
      },
      async () => {
        await simulateDelay(220);
        const user = authService.getCurrentUser();
        const db = loadDemoDb();
        if (!user) return [];
        return db.applications
          .filter((a) => a.citizenId === user.id)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },
    );
  },

  async getApplicationById(applicationId: string): Promise<Application> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<Application>(`/applications/${applicationId}`);
        return data;
      },
      async () => {
        await simulateDelay(180);
        const db = loadDemoDb();
        const app = db.applications.find(
          (a) => a.id === applicationId || a.referenceNumber === applicationId,
        );
        if (!app) {
          throw new Error('Application not found.');
        }
        return app;
      },
    );
  },

  async createApplication(payload: CreateApplicationPayload): Promise<Application> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.post<Application>('/applications', payload);
        return data;
      },
      async () => {
        await simulateDelay(320);
        const user = authService.getCurrentUser();
        if (!user) throw new Error('You must be signed in to submit an application.');

        const db = loadDemoDb();
        const service = db.services.find((s) => s.id === payload.serviceId);
        if (!service) throw new Error('Selected service does not exist.');

        const now = new Date().toISOString();
        const seq = 1065 + db.applications.length;
        const newApp: Application = {
          id: `app-${Date.now()}`,
          referenceNumber: `JS-2026-00${seq}`,
          citizenId: user.id,
          citizenName: user.fullName,
          citizenEmail: user.email,
          serviceId: service.id,
          serviceName: service.name,
          department: service.department,
          status: 'documents_pending',
          submittedAt: now,
          updatedAt: now,
          formData: payload.formData,
          documents: [],
          timeline: [
            {
              id: `tl-${Date.now()}`,
              timestamp: now,
              stage: 'Application Created',
              actor: `${user.fullName} (Citizen)`,
              description: `Submitted ${service.name} application form. Awaiting mandatory document uploads.`,
              state: 'completed',
            },
          ],
        };

        db.applications.unshift(newApp);
        appendAuditLog(db, {
          actorId: user.id,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'APPLICATION_CREATED',
          targetType: 'application',
          targetId: newApp.referenceNumber,
          details: `Created application for ${service.name}.`,
          severity: 'info',
        });
        saveDemoDb(db);
        return newApp;
      },
    );
  },

  async runAiVerification(applicationId: string): Promise<{
    application: Application;
    report: AIVerificationReport;
  }> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.post<{
          application: Application;
          report: AIVerificationReport;
        }>(`/applications/${applicationId}/verify`);
        return data;
      },
      async () => {
        await simulateDelay(650);
        const db = loadDemoDb();
        const app = db.applications.find((a) => a.id === applicationId);
        if (!app) throw new Error('Application not found.');

        const report = generateAiVerificationReport(
          app,
          db.documentRequirements,
          db.eligibilityRules,
        );

        const now = new Date().toISOString();
        app.aiReport = report;
        app.updatedAt = now;
        if (report.missingDocuments.length > 0) {
          app.status = 'action_required';
        } else {
          app.status = 'under_officer_review';
        }

        app.timeline.push({
          id: `tl-ai-${Date.now()}`,
          timestamp: now,
          stage: `AI Verification Completed (${report.overallScore}/100)`,
          actor: 'JanSahayak AI Engine',
          description: report.summary,
          state:
            report.recommendedAction === 'recommend_approve'
              ? 'completed'
              : report.recommendedAction === 'recommend_reject'
                ? 'danger'
                : 'warning',
        });

        appendAuditLog(db, {
          actorId: 'system-ai',
          actorName: 'JanSahayak AI Engine',
          actorRole: 'admin',
          action: 'AI_VERIFICATION_RUN',
          targetType: 'application',
          targetId: app.referenceNumber,
          details: `Generated AI verification report (Score: ${report.overallScore}/100, Recommendation: ${report.recommendedAction}).`,
          severity: report.eligibilityPassed ? 'info' : 'warning',
        });

        saveDemoDb(db);
        return { application: app, report };
      },
    );
  },
};
