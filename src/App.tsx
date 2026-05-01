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
import { SecretaryAgenda } from './Components/pages/Dashboards/Secretary/SecretaryAgenda';
import { SecretaryPatients } from './Components/pages/Dashboards/Secretary/SecretaryPatients';
import { PatientProfile } from './Components/pages/Dashboards/Secretary/PatientProfile';
import { CashControl } from './Components/pages/Dashboards/Secretary/CashControl';
import { DentistDashboard } from './Components/pages/Dashboards/Dentist/DentistDashboard';
import { DentistPatientProfile } from './Components/pages/Dashboards/Dentist/DentistPatientProfile';
import { OdontogramView } from './Components/pages/Dashboards/Dentist/OdontogramView';
import { OdontogramIndex } from './Components/pages/Dashboards/Dentist/OdontogramIndex';
import { DentistPatients } from './Components/pages/Dashboards/Dentist/DentistPatients';

// --- NUEVOS IMPORTS DEL ADMIN ---
import { AdminDashboard } from './Components/pages/Dashboards/Admin/AdminDashboard';
import { AdminPatientsGlobal } from './Components/pages/Dashboards/Admin/AdminPatientsGlobal';
import { AdminDentists } from './Components/pages/Dashboards/Admin/AdminDentists';
import { AdminStaff } from './Components/pages/Dashboards/Admin/AdminStaff';
// import { StaffManagement } from './Components/pages/Dashboards/Admin/StaffManagement';
// import { GlobalFinance } from './Components/pages/Dashboards/Admin/GlobalFinance';
// import { AuditLogs } from './Components/pages/Dashboards/Admin/AuditLogs';

function App() {
  return (
    <Routes>
      {/* Ruta pública principal */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Ruta de autenticación */}
      <Route path="/login" element={<Auth />} />
      
      {/* Ruta protegida del dashboard (Paciente por defecto) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <PatientDashboard />
          </ProtectedRoute>
        } 
      />

      {/* --- RUTAS DEL PACIENTE --- */}
      <Route path="/dashboard/citas" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
      <Route path="/dashboard/tratamiento" element={<ProtectedRoute><TreatmentsPage /></ProtectedRoute>} />
      <Route path="/dashboard/estudios" element={<ProtectedRoute><StudiesPage /></ProtectedRoute>} />
      <Route path="/dashboard/ajustes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* --- RUTAS DE LA SECRETARÍA --- */}
      <Route path="/secretaria/dashboard" element={<ProtectedRoute><SecretaryDashboard /></ProtectedRoute>} />
      <Route path="/secretaria/agenda" element={<ProtectedRoute><SecretaryAgenda /></ProtectedRoute>} />
      <Route path="/secretaria/pacientes" element={<ProtectedRoute><SecretaryPatients /></ProtectedRoute>} />
      <Route path="/secretary/patients/:id" element={<ProtectedRoute><PatientProfile /></ProtectedRoute>} />
      <Route path="/secretaria/cash" element={<ProtectedRoute><CashControl /></ProtectedRoute>} />

      {/* --- RUTAS DEL DENTISTA --- */}
      <Route path="/dentista/dashboard" element={<ProtectedRoute><DentistDashboard /></ProtectedRoute>} />
      <Route path="/dentista/pacientes/:id" element={<ProtectedRoute><DentistPatientProfile /></ProtectedRoute>} />
      <Route path="/dentista/odontograma" element={<ProtectedRoute><OdontogramIndex /></ProtectedRoute>} />
      <Route path="/dentista/odontogramas/:id" element={<ProtectedRoute><OdontogramView /></ProtectedRoute>} />
      <Route path="/dentista/pacientes" element={<ProtectedRoute><DentistPatients /></ProtectedRoute>} />

      {/* --- RUTAS DEL ADMIN (EL BUNKER) --- */}
      <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/pacientes" element={<ProtectedRoute><AdminPatientsGlobal /></ProtectedRoute>} />
      <Route path="/admin/dentistas" element={<ProtectedRoute><AdminDentists /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute><AdminStaff /></ProtectedRoute>} />
      {/* <Route path="/admin/finanzas" element={<ProtectedRoute><GlobalFinance /></ProtectedRoute>} />
      <Route path="/admin/auditoria" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} /> */}

      {/* Manejo de errores 404 */}
      <Route path="*" element={<div className="h-screen flex items-center justify-center font-serif italic text-2xl text-[#4A3737] bg-[#F7F5F5]">404 | Página no encontrada</div>} />
    </Routes>
  );
}

export default App;