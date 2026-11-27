import type {
  DocumentRequirement,
  EligibilityRule,
  GovernmentService,
} from '../types/service';
import type { AuditLog, User, UserRole, UserStatus } from '../types/user';
import { apiClient, simulateDelay, withApiFallback } from './api';
import { authService } from './authService';
import { appendAuditLog, loadDemoDb, resetDemoDb, saveDemoDb } from './demoStore';

export const adminService = {
  async getUsers(): Promise<User[]> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<User[]>('/admin/users');
        return data;
      },
      async () => {
        await simulateDelay(180);
        return loadDemoDb().users;
      },
    );
  },

  async updateUserRoleAndStatus(
    userId: string,
    role: UserRole,
    status: UserStatus,
  ): Promise<User> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.patch<User>(`/admin/users/${userId}`, { role, status });
        return data;
      },
      async () => {
        await simulateDelay(220);
        const db = loadDemoDb();
        const target = db.users.find((u) => u.id === userId);
        if (!target) throw new Error('User not found.');
        target.role = role;
        target.status = status;

        const admin = authService.getCurrentUser();
        appendAuditLog(db, {
          actorId: admin?.id || 'usr-adm-1',
          actorName: admin?.fullName || 'System Admin',
          actorRole: 'admin',
          action: 'USER_UPDATED',
          targetType: 'user',
          targetId: target.id,
          details: `Updated ${target.fullName} role=${role}, status=${status}.`,
          severity: status === 'suspended' ? 'warning' : 'info',
        });
        saveDemoDb(db);
        return target;
      },
    );
  },

  async createUser(payload: {
    fullName: string;
    email: string;
    phone: string;
    role: UserRole;
    department?: string;
    designation?: string;
  }): Promise<User> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.post<User>('/admin/users', payload);
        return data;
      },
      async () => {
        await simulateDelay(240);
        const db = loadDemoDb();
        if (db.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
          throw new Error('User with this email already exists.');
        }
        const newUser: User = {
          id: `usr-${Date.now()}`,
          fullName: payload.fullName,
          email: payload.email.toLowerCase(),
          phone: payload.phone,
          role: payload.role,
          status: 'active',
          department: payload.department,
          designation: payload.designation,
          createdAt: new Date().toISOString(),
        };
        db.users.push(newUser);
        const admin = authService.getCurrentUser();
        appendAuditLog(db, {
          actorId: admin?.id || 'usr-adm-1',
          actorName: admin?.fullName || 'System Admin',
          actorRole: 'admin',
          action: 'USER_PROVISIONED',
          targetType: 'user',
          targetId: newUser.id,
          details: `Provisioned ${newUser.role} account for ${newUser.fullName}.`,
          severity: 'info',
        });
        saveDemoDb(db);
        return newUser;
      },
    );
  },

  async saveService(service: GovernmentService): Promise<GovernmentService> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.put<GovernmentService>(`/admin/services/${service.id}`, service);
        return data;
      },
      async () => {
        await simulateDelay(220);
        const db = loadDemoDb();
        const idx = db.services.findIndex((s) => s.id === service.id);
        if (idx >= 0) {
          db.services[idx] = service;
        } else {
          db.services.push(service);
        }
        const admin = authService.getCurrentUser();
        appendAuditLog(db, {
          actorId: admin?.id || 'usr-adm-1',
          actorName: admin?.fullName || 'System Admin',
          actorRole: 'admin',
          action: idx >= 0 ? 'SERVICE_UPDATED' : 'SERVICE_CREATED',
          targetType: 'service',
          targetId: service.code,
          details: `Configured government service: ${service.name} (${service.isActive ? 'Active' : 'Inactive'}).`,
          severity: 'info',
        });
        saveDemoDb(db);
        return service;
      },
    );
  },

  async getDocumentRequirements(): Promise<DocumentRequirement[]> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<DocumentRequirement[]>('/admin/document-requirements');
        return data;
      },
      async () => {
        await simulateDelay(160);
        return loadDemoDb().documentRequirements;
      },
    );
  },

  async saveDocumentRequirement(req: DocumentRequirement): Promise<DocumentRequirement> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.put<DocumentRequirement>(
          `/admin/document-requirements/${req.id}`,
          req,
        );
        return data;
      },
      async () => {
        await simulateDelay(200);
        const db = loadDemoDb();
        const idx = db.documentRequirements.findIndex((r) => r.id === req.id);
        if (idx >= 0) {
          db.documentRequirements[idx] = req;
        } else {
          db.documentRequirements.push(req);
        }
        const admin = authService.getCurrentUser();
        appendAuditLog(db, {
          actorId: admin?.id || 'usr-adm-1',
          actorName: admin?.fullName || 'System Admin',
          actorRole: 'admin',
          action: idx >= 0 ? 'DOC_REQUIREMENT_UPDATED' : 'DOC_REQUIREMENT_ADDED',
          targetType: 'document',
          targetId: req.id,
          details: `Saved document requirement "${req.title}" for service ${req.serviceId}.`,
          severity: 'info',
        });
        saveDemoDb(db);
        return req;
      },
    );
  },

  async deleteDocumentRequirement(reqId: string): Promise<void> {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/admin/document-requirements/${reqId}`);
      },
      async () => {
        await simulateDelay(180);
        const db = loadDemoDb();
        db.documentRequirements = db.documentRequirements.filter((r) => r.id !== reqId);
        saveDemoDb(db);
      },
    );
  },

  async getRules(): Promise<EligibilityRule[]> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<EligibilityRule[]>('/admin/rules');
        return data;
      },
      async () => {
        await simulateDelay(160);
        return loadDemoDb().eligibilityRules;
      },
    );
  },

  async saveRule(rule: EligibilityRule): Promise<EligibilityRule> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.put<EligibilityRule>(`/admin/rules/${rule.id}`, rule);
        return data;
      },
      async () => {
        await simulateDelay(200);
        const db = loadDemoDb();
        const idx = db.eligibilityRules.findIndex((r) => r.id === rule.id);
        if (idx >= 0) {
          db.eligibilityRules[idx] = rule;
        } else {
          db.eligibilityRules.push(rule);
        }
        const admin = authService.getCurrentUser();
        appendAuditLog(db, {
          actorId: admin?.id || 'usr-adm-1',
          actorName: admin?.fullName || 'System Admin',
          actorRole: 'admin',
          action: idx >= 0 ? 'RULE_UPDATED' : 'RULE_CREATED',
          targetType: 'rule',
          targetId: rule.id,
          details: `Rule "${rule.ruleName}": ${rule.field} ${rule.operator} ${rule.value} (${rule.isActive ? 'Enabled' : 'Disabled'}).`,
          severity: 'info',
        });
        saveDemoDb(db);
        return rule;
      },
    );
  },

  async deleteRule(ruleId: string): Promise<void> {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/admin/rules/${ruleId}`);
      },
      async () => {
        await simulateDelay(180);
        const db = loadDemoDb();
        db.eligibilityRules = db.eligibilityRules.filter((r) => r.id !== ruleId);
        saveDemoDb(db);
      },
    );
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.get<AuditLog[]>('/admin/audit-logs');
        return data;
      },
      async () => {
        await simulateDelay(160);
        return loadDemoDb().auditLogs;
      },
    );
  },

  resetDemoDatabase(): void {
    resetDemoDb();
  },
};
