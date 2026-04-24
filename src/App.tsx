import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './Components/pages/Main/LandingPage';
import { Auth } from './Components/pages/Auth/Auth';
import { PatientDashboard } from './Components/pages/Dashboards/Patient/PatientDashboard';
import { ProtectedRoute } from './Components/Shared/ProtectedRoute';
import { AppointmentsPage } from './Components/pages/Dashboards/Patient/AppointmentPage';
import { TreatmentsPage } from './Components/pages/Dashboards/Patient/TreatementsPage';
import { StudiesPage } from './Components/pages/Dashboards/Patient/StudiesPage';
import { SettingsPage } from './Components/pages/Dashboards/Patient/SettingsPage';
import { SecretaryDashboard } from './Components/pages/Dashboards/Secretary/SecretaryDashboard';

function App() {
  return (
    <Routes>
      {/* Ruta pública principal */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Ruta de autenticación */}
      <Route path="/login" element={<Auth />} />
      
      {/* Ruta protegida del dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Manejo de errores 404 */}
      <Route path="*" element={<div className="h-screen flex items-center justify-center">404 | Página no encontrada</div>} />

      <Route path="/dashboard/citas" element={<AppointmentsPage />} />

      <Route path="/dashboard/tratamiento" element={<TreatmentsPage />} />

      <Route path="/dashboard/estudios" element={<StudiesPage />} />

      <Route path="/dashboard/ajustes" element={<SettingsPage />} />
      {/* --- RUTA DE LA SECRETARÍA --- */}
      <Route path="/secretaria/dashboard" element={<SecretaryDashboard />} />
      {/* Aquí irán después: /secretaria/pacientes, /secretaria/pagos, etc. */}
      
    </Routes>
  );
}

export default App;