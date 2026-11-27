import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import type { SidebarNavItem } from '../components/Sidebar';

const citizenNavItems: SidebarNavItem[] = [
  { to: '/citizen/dashboard', label: 'Dashboard', icon: 'bi-speedometer2' },
  { to: '/citizen/services', label: 'Browse Services', icon: 'bi-grid-1x2' },
  { to: '/citizen/apply', label: 'New Application', icon: 'bi-file-earmark-plus' },
  { to: '/citizen/track', label: 'Track Applications', icon: 'bi-signpost-split' },
];

export function CitizenLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar
        portalTitle="Citizen Services Portal"
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />
      <div className="js-shell">
        <Sidebar
          items={citizenNavItems}
          sectionLabel="Citizen Portal"
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="js-main-content">
          <div className="js-page-body container-fluid" style={{ maxWidth: 1320 }}>
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
