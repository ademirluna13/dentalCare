import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './Components/pages/Main/LandingPage';
import { Auth } from './Components/pages/Auth/Auth';
import { PatientDashboard } from './Components/pages/Dashboards/PatientDashboard';
import { ProtectedRoute } from './Components/Shared/ProtectedRoute';

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
    </Routes>
  );
}

export default App;