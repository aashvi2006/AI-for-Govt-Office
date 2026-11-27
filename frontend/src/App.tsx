import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { CitizenLayout } from './layouts/CitizenLayout';
import { OfficerLayout } from './layouts/OfficerLayout';
import { AuditLogsPage } from './pages/admin/AuditLogs';
import { AdminDashboard } from './pages/admin/Dashboard';
import { DocumentRequirementsPage } from './pages/admin/DocumentRequirements';
import { AdminRules } from './pages/admin/Rules';
import { AdminServices } from './pages/admin/Services';
import { AdminUsers } from './pages/admin/Users';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ApplyPage } from './pages/citizen/Apply';
import { CitizenDashboard } from './pages/citizen/Dashboard';
import { ServiceDetails } from './pages/citizen/ServiceDetails';
import { CitizenServices } from './pages/citizen/Services';
import { TrackApplication } from './pages/citizen/TrackApplication';
import { UploadDocuments } from './pages/citizen/UploadDocuments';
import { VerificationResults } from './pages/citizen/VerificationResults';
import { ApplicationReview } from './pages/officer/ApplicationReview';
import { OfficerDashboard } from './pages/officer/Dashboard';
import { DocumentInspection } from './pages/officer/DocumentInspection';
import { PendingApplications } from './pages/officer/PendingApplications';
import { getRoleHomePath } from './utils/helpers';

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getRoleHomePath(user.role)} replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Citizen Portal */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CitizenDashboard />} />
            <Route path="services" element={<CitizenServices />} />
            <Route path="services/:serviceId" element={<ServiceDetails />} />
            <Route path="apply" element={<ApplyPage />} />
            <Route path="apply/:serviceId" element={<ApplyPage />} />
            <Route path="applications/:applicationId/documents" element={<UploadDocuments />} />
            <Route path="applications/:applicationId/verification" element={<VerificationResults />} />
            <Route path="applications/:applicationId/track" element={<TrackApplication />} />
            <Route path="track" element={<TrackApplication />} />
          </Route>

          {/* Government Officer Workbench */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={['officer']}>
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="pending" element={<PendingApplications />} />
            <Route path="applications/:applicationId" element={<ApplicationReview />} />
            <Route path="applications/:applicationId/documents" element={<DocumentInspection />} />
          </Route>

          {/* System Admin Console */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="document-requirements" element={<DocumentRequirementsPage />} />
            <Route path="rules" element={<AdminRules />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
