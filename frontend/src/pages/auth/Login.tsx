import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomePath } from '../../utils/helpers';

const DEMO_ACCOUNTS = [
  {
    role: 'Citizen Portal',
    name: 'Aarav Sharma',
    email: 'citizen@jansahayak.gov.in',
    icon: 'bi-person-badge',
    badge: 'bg-primary-subtle text-primary',
  },
  {
    role: 'Officer Workbench',
    name: 'Rajeshwar Verma',
    email: 'officer@jansahayak.gov.in',
    icon: 'bi-shield-check',
    badge: 'bg-success-subtle text-success',
  },
  {
    role: 'Admin Console',
    name: 'Dr. Kavita Nair',
    email: 'admin@jansahayak.gov.in',
    icon: 'bi-gear-wide-connected',
    badge: 'bg-warning-subtle text-warning-emphasis',
  },
];

export function Login() {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  const executeLogin = async (loginEmail: string, loginPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login({ email: loginEmail, password: loginPass });
      navigate(getRoleHomePath(loggedUser.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void executeLogin(email, password);
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <div className="civic-top-stripe" />
      <div className="flex-grow-1 d-flex align-items-center py-4 px-3">
        <div className="container" style={{ maxWidth: 1060 }}>
          <div className="row g-0 js-card overflow-hidden shadow-sm">
            <div className="col-lg-6 js-auth-hero p-4 p-lg-5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-2 bg-warning text-dark fw-bold"
                    style={{ width: 40, height: 40 }}
                  >
                    <i className="bi bi-bank2 fs-5" />
                  </span>
                  <div>
                    <div className="fw-bold font-display fs-5">JanSahayak AI</div>
                    <div className="small text-white-50">Unified Civic Service & Verification</div>
                  </div>
                </div>

                <h1 className="h2 fw-bold mb-3">
                  Transparent, AI-Assisted Government Services
                </h1>
                <p className="text-white-50 mb-4">
                  Apply for certificates, welfare pensions, scholarships, and municipal licenses
                  with instant AI document pre-screening and real-time officer tracking.
                </p>

                <div className="d-flex flex-column gap-3 small">
                  <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-check-circle-fill text-warning mt-1" />
                    <span>Instant OCR verification catches missing or mismatched documents before submission.</span>
                  </div>
                  <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-check-circle-fill text-warning mt-1" />
                    <span>Side-by-side officer inspection accelerates approval turnaround times.</span>
                  </div>
                  <div className="d-flex align-items-start gap-2">
                    <i className="bi bi-check-circle-fill text-warning mt-1" />
                    <span>Complete audit trail across citizens, verification officers, and policy rules.</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top border-light border-opacity-25 small text-white-50">
                <i className="bi bi-shield-lock me-1" />
                Protected by Role-Based Access Control (RBAC)
              </div>
            </div>

            <div className="col-lg-6 p-4 p-lg-5 bg-white">
              <h2 className="h4 fw-bold mb-1">Sign In to Portal</h2>
              <p className="text-muted small mb-4">
                Enter your registered credentials or choose a demo role to explore.
              </p>

              {error && (
                <div className="alert alert-danger py-2 px-3 small" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label fw-medium small">
                    Email Address
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    className="form-control"
                    placeholder="name@jansahayak.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="loginPassword" className="form-label fw-medium small">
                    Password
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-gov-primary w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? <LoadingSpinner compact message="Authenticating..." /> : 'Sign In'}
                </button>
              </form>

              <div className="text-center small mb-4">
                New citizen?{' '}
                <Link to="/register" className="fw-semibold text-decoration-none">
                  Create Citizen Account
                </Link>
              </div>

              <div className="border-top pt-3">
                <div className="text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '0.72rem' }}>
                  Quick Demo Access (1-Click Sign In)
                </div>
                <div className="d-flex flex-column gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      disabled={loading}
                      onClick={() => void executeLogin(acc.email, 'demo1234')}
                      className="btn btn-light border text-start d-flex align-items-center justify-content-between py-2 px-3"
                    >
                      <span className="d-flex align-items-center gap-2">
                        <i className={`bi ${acc.icon} text-primary fs-5`} />
                        <span>
                          <span className="d-block fw-semibold small text-dark">{acc.name}</span>
                          <span className="d-block text-muted" style={{ fontSize: '0.75rem' }}>
                            {acc.email}
                          </span>
                        </span>
                      </span>
                      <span className={`badge rounded-pill ${acc.badge}`}>{acc.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
