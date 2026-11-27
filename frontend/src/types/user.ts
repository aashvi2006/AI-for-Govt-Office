export type UserRole = 'citizen' | 'officer' | 'admin';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  aadhaarMasked?: string;
  department?: string;
  designation?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  aadhaarLast4?: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'application' | 'document' | 'service' | 'rule' | 'user' | 'auth';
  targetId: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}
