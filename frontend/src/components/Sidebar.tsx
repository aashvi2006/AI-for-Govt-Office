import { NavLink } from 'react-router-dom';

export interface SidebarNavItem {
  to: string;
  label: string;
  icon: string;
  badge?: string | number;
}

interface SidebarProps {
  items: SidebarNavItem[];
  sectionLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ items, sectionLabel, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="js-sidebar-backdrop d-lg-none"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside className={`js-sidebar ${isOpen ? 'show' : ''}`}>
        <div className="p-3 flex-grow-1 overflow-auto">
          <div
            className="text-uppercase fw-bold text-muted px-2 mb-2"
            style={{ fontSize: '0.7rem', letterSpacing: '0.07em' }}
          >
            {sectionLabel}
          </div>
          <nav className="d-flex flex-column">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) => `js-nav-link ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} />
                <span className="flex-grow-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="badge rounded-pill bg-primary-subtle text-primary">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-3 border-top bg-light">
          <div className="d-flex align-items-start gap-2 small text-secondary">
            <i className="bi bi-shield-lock-fill text-success mt-1" />
            <div>
              <div className="fw-semibold text-dark">AI Assist Active</div>
              <div style={{ fontSize: '0.75rem' }}>
                Automated OCR, consistency & eligibility checks enabled.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
