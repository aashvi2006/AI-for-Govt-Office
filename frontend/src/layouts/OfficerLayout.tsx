import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarNavItem } from '../components/Sidebar';

const officerNavItems: SidebarNavItem[] = [
  { to: '/officer/dashboard', label: 'Officer Overview', icon: 'bi-shield-check' },
  { to: '/officer/pending', label: 'Pending Applications', icon: 'bi-inboxes' },
];

export function OfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar
        portalTitle="Government Officer Workbench"
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="js-shell">
        <Sidebar
          items={officerNavItems}
          sectionLabel="Officer Review"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="js-main-content">
          <div className="js-page-body container-fluid" style={{ maxWidth: 1360 }}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
