import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { adminService } from '../../services/adminService';
import type { User, UserRole, UserStatus } from '../../types/user';
import { formatDate } from '../../utils/helpers';

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('officer');
  const [department, setDepartment] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let active = true;
    adminService
      .getUsers()
      .then((list) => {
        if (active) setUsers(list);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to fetch users.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleUpdate = async (userId: string, newRole: UserRole, newStatus: UserStatus) => {
    setError(null);
    try {
      const updated = await adminService.updateUserRoleAndStatus(userId, newRole, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user.');
    }
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const created = await adminService.createUser({
        fullName,
        email,
        phone,
        role,
        department: department || undefined,
      });
      setUsers((prev) => [...prev, created]);
      setFullName('');
      setEmail('');
      setPhone('');
      setDepartment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to provision user.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading system users..." />;

  const filtered = users.filter((u) => roleFilter === 'all' || u.role === roleFilter);

  return (
    <div>
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="h3 fw-bold mb-1">User & Role Management</h1>
          <p className="text-muted mb-0">
            Provision officers/administrators and manage portal access permissions.
          </p>
        </div>

        <select
          className="form-select form-select-sm"
          style={{ width: 200 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
        >
          <option value="all">All Roles ({users.length})</option>
          <option value="citizen">Citizens</option>
          <option value="officer">Officers</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      {error && <div className="alert alert-danger small">{error}</div>}

      <div className="js-card p-4 mb-4">
        <h2 className="h6 fw-bold mb-3">Provision New Account</h2>
        <form onSubmit={handleCreateUser} className="row g-2 align-items-end">
          <div className="col-md-3">
            <label className="form-label small fw-medium">Full Name</label>
            <input
              type="text"
              className="form-control form-control-sm"
              required
              placeholder="e.g. Vikram Kulkarni"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label small fw-medium">Email</label>
            <input
              type="email"
              className="form-control form-control-sm"
              required
              placeholder="officer@jansahayak.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-medium">Phone</label>
            <input
              type="tel"
              className="form-control form-control-sm"
              required
              placeholder="+91 98..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small fw-medium">Role</label>
            <select
              className="form-select form-select-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="citizen">Citizen</option>
              <option value="officer">Officer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-sm btn-gov-primary w-100" disabled={creating}>
              {creating ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>
      </div>

      <div className="js-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Name & Contact</th>
                <th>Department / ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fw-semibold">{u.fullName}</div>
                    <div className="small text-muted">
                      {u.email} · {u.phone}
                    </div>
                  </td>
                  <td className="small">
                    {u.department || u.aadhaarMasked || 'General Citizen'}
                  </td>
                  <td style={{ width: 150 }}>
                    <select
                      className="form-select form-select-sm"
                      value={u.role}
                      onChange={(e) =>
                        void handleUpdate(u.id, e.target.value as UserRole, u.status)
                      }
                    >
                      <option value="citizen">Citizen</option>
                      <option value="officer">Officer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ width: 150 }}>
                    <select
                      className="form-select form-select-sm"
                      value={u.status}
                      onChange={(e) =>
                        void handleUpdate(u.id, u.role, e.target.value as UserStatus)
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="small text-muted">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
