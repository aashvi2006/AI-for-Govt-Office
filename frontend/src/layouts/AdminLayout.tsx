import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarNavItem } from '../components/Sidebar';

const adminNavItems: SidebarNavItem[] = [
  { to: '/admin/dashboard', label: 'Admin Overview', icon: 'bi-sliders' },
  { to: '/admin/users', label: 'User Management', icon: 'bi-people' },
  { to: '/admin/services', label: 'Services Config', icon: 'bi-building-gear' },
  { to: '/admin/document-requirements', label: 'Document Rules', icon: 'bi-file-earmark-ruled' },
  { to: '/admin/rules', label: 'Eligibility Rules', icon: 'bi-diagram-3' },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'bi-journal-text' },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar
        portalTitle="System Administration Console"
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="js-shell">
        <Sidebar
          items={adminNavItems}
          sectionLabel="Administration"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="js-main-content">
          <div className="js-page-body container-fluid" style={{ maxWidth: 1380 }}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
