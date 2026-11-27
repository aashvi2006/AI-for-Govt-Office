import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath, getRoleLabel } from '../utils/helpers';

interface NavbarProps {
  onToggleSidebar?: () => void;
  portalTitle: string;
}

export function Navbar({ onToggleSidebar, portalTitle }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky-top">
      <div className="civic-top-stripe" />
      <nav className="navbar navbar-dark js-navbar px-3 px-lg-4">
        <div className="d-flex align-items-center gap-2">
          {onToggleSidebar && (
            <button
              type="button"
              className="btn btn-outline-light btn-sm d-lg-none me-1"
              onClick={onToggleSidebar}
              aria-label="Toggle navigation sidebar"
            >
              <i className="bi bi-list fs-5" />
            </button>
          )}
          <Link
            to={user ? getRoleHomePath(user.role) : '/login'}
            className="navbar-brand d-flex align-items-center gap-2 mb-0"
          >
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-2 bg-warning text-dark fw-bold"
              style={{ width: 34, height: 34 }}
            >
              <i className="bi bi-bank2" />
            </span>
            <span className="d-flex flex-column lh-1">
              <span className="fw-bold font-display fs-6 text-white">JanSahayak AI</span>
              <small className="text-white-50" style={{ fontSize: '0.7rem' }}>
                {portalTitle}
              </small>
            </span>
          </Link>
        </div>

        <div className="d-flex align-items-center gap-3">
          {user && (
            <>
              <div className="d-none d-md-flex flex-column text-end lh-sm">
                <span className="text-white fw-semibold" style={{ fontSize: '0.88rem' }}>
                  {user.fullName}
                </span>
                <span className="text-warning" style={{ fontSize: '0.72rem' }}>
                  {getRoleLabel(user.role)}
                  {user.department ? ` · ${user.department}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-sm btn-outline-light d-flex align-items-center gap-1"
              >
                <i className="bi bi-box-arrow-right" />
                <span className="d-none d-sm-inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
