import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/user';
import {
  apiClient,
  simulateDelay,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  withApiFallback,
} from './api';
import { appendAuditLog, loadDemoDb, saveDemoDb } from './demoStore';

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
        this.persistSession(data);
        return data;
      },
      async () => {
        await simulateDelay(320);
        const db = loadDemoDb();
        const user = db.users.find(
          (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase(),
        );
        if (!user) {
          throw new Error('Invalid email or password. Try one of the demo accounts below.');
        }
        if (user.status !== 'active') {
          throw new Error(`Account is currently ${user.status}. Please contact the administrator.`);
        }
        user.lastLoginAt = new Date().toISOString();
        appendAuditLog(db, {
          actorId: user.id,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'USER_LOGIN',
          targetType: 'auth',
          targetId: user.id,
          details: `Signed in via JanSahayak Portal (${user.role}).`,
          severity: 'info',
        });
        saveDemoDb(db);

        const response: AuthResponse = {
          token: `demo-jwt-${user.role}-${Date.now()}`,
          user,
        };
        this.persistSession(response);
        return response;
      },
    );
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    return withApiFallback(
      async () => {
        const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
        this.persistSession(data);
        return data;
      },
      async () => {
        await simulateDelay(360);
        const db = loadDemoDb();
        const exists = db.users.some(
          (u) => u.email.toLowerCase() === payload.email.trim().toLowerCase(),
        );
        if (exists) {
          throw new Error('An account with this email already exists.');
        }
        const newUser: User = {
          id: `usr-${Date.now()}`,
          fullName: payload.fullName.trim(),
          email: payload.email.trim().toLowerCase(),
          phone: payload.phone.trim(),
          role: payload.role || 'citizen',
          status: 'active',
          aadhaarMasked: payload.aadhaarLast4
            ? `XXXX-XXXX-${payload.aadhaarLast4}`
            : 'XXXX-XXXX-0000',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        db.users.push(newUser);
        appendAuditLog(db, {
          actorId: newUser.id,
          actorName: newUser.fullName,
          actorRole: newUser.role,
          action: 'USER_REGISTERED',
          targetType: 'user',
          targetId: newUser.id,
          details: `New ${newUser.role} account registered: ${newUser.email}`,
          severity: 'info',
        });
        saveDemoDb(db);

        const response: AuthResponse = {
          token: `demo-jwt-${newUser.role}-${Date.now()}`,
          user: newUser,
        };
        this.persistSession(response);
        return response;
      },
    );
  },

  persistSession(auth: AuthResponse): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, auth.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(auth.user));
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },
};
