import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { getRoleHomePath } from '../../utils/helpers';

export function Register() {
  const { user, isAuthenticated, register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated && user) {
    return <Navigate to={getRoleHomePath(user.role)} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (aadhaarLast4 && !/^\d{4}$/.test(aadhaarLast4)) {
      setError('Please enter valid last 4 digits of Aadhaar.');
      return;
    }

    setLoading(true);
    try {
      const created = await register({
        fullName,
        email,
        phone,
        password,
        aadhaarLast4,
        role: 'citizen',
      });
      navigate(getRoleHomePath(created.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <div className="civic-top-stripe" />
      <div className="flex-grow-1 d-flex align-items-center py-4 px-3">
        <div className="container" style={{ maxWidth: 620 }}>
          <div className="js-card p-4 p-lg-5 bg-white shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-3">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-2 bg-warning text-dark fw-bold"
                style={{ width: 36, height: 36 }}
              >
                <i className="bi bi-bank2" />
              </span>
              <div>
                <h1 className="h4 fw-bold mb-0">Citizen Registration</h1>
                <div className="small text-muted">JanSahayak AI Digital Service Account</div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label htmlFor="regName" className="form-label fw-medium small">
                    Full Legal Name (as on Government ID)
                  </label>
                  <input
                    id="regName"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rohan Kulkarni"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="regEmail" className="form-label fw-medium small">
                    Email Address
                  </label>
                  <input
                    id="regEmail"
                    type="email"
                    className="form-control"
                    placeholder="rohan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="regPhone" className="form-label fw-medium small">
                    Mobile Number
                  </label>
                  <input
                    id="regPhone"
                    type="tel"
                    className="form-control"
                    placeholder="+91 98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label htmlFor="regAadhaar" className="form-label fw-medium small">
                    Aadhaar Last 4 Digits (Optional, for faster verification)
                  </label>
                  <input
                    id="regAadhaar"
                    type="text"
                    maxLength={4}
                    className="form-control"
                    placeholder="e.g. 4821"
                    value={aadhaarLast4}
                    onChange={(e) => setAadhaarLast4(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="regPass" className="form-label fw-medium small">
                    Password
                  </label>
                  <input
                    id="regPass"
                    type="password"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label htmlFor="regConfirmPass" className="form-label fw-medium small">
                    Confirm Password
                  </label>
                  <input
                    id="regConfirmPass"
                    type="password"
                    className="form-control"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-gov-primary w-100 py-2 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner compact message="Creating Citizen Account..." />
                ) : (
                  'Register & Enter Citizen Portal'
                )}
              </button>
            </form>

            <div className="text-center small mt-3">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-decoration-none">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
