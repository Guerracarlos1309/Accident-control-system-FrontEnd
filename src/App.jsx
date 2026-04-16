import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Context Providers
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Componentes Core
import MasterEntityManager from "./components/MasterEntityManager";

// Módulos Especializados
import AccidentsManager from "./pages/Accidents/AccidentsManager";
import ExtinguisherManager from "./pages/Inspections/ExtinguisherManager";
import VehicleManager from "./pages/Inspections/VehicleManager";
import FacilityManager from "./pages/Infrastructure/FacilityManager";
import ProtectionInventory from "./pages/Protection/ProtectionInventory";
import VehicleInventory from "./pages/Fleet/VehicleInventory";
import EmployeeForm from "./pages/Setup/EmployeeForm";
import UserManager from "./pages/Admin/UserManager";
import ProfilePage from "./pages/Admin/ProfilePage";
import FleetSetup from "./pages/Fleet/FleetSetup";

function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Navigate to="/login" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* RRHH */}
                <Route path="hr/employees" element={
                  <MasterEntityManager 
                    title="Directorio de Empleados" 
                    entityName="Empleado" 
                    FormComponent={EmployeeForm} 
                    modalMaxWidth="max-w-4xl"
                  />
                } />
                <Route path="hr/catalogs" element={
                  <div className="space-y-8">
                    <MasterEntityManager title="Gestión de Cargos" entityName="Cargo" />
                    <MasterEntityManager title="Departamentos" entityName="Departamento" />
                  </div>
                } />

                {/* Infraestructura */}
                <Route path="infra/facilities" element={<FacilityManager />} />
                <Route path="infra/locations" element={
                  <div className="space-y-8">
                    <MasterEntityManager title="Estado / Provincias" entityName="Estado" />
                    <MasterEntityManager title="Municipios y Ciudades" entityName="Ciudad" />
                  </div>
                } />

                {/* Accidentes */}
                <Route path="accidents/register" element={<AccidentsManager />} />
                <Route path="accidents/catalogs" element={
                  <div className="space-y-8">
                    <MasterEntityManager title="Tipos de Incidente" entityName="Tipo" />
                    <MasterEntityManager title="Causas Raíz" entityName="Causa" />
                  </div>
                } />

                {/* Inspecciones */}
                <Route path="inspections/new" element={
                  <div className="p-12 glass-panel rounded-3xl text-center border border-slate-800/50">
                    <h2 className="text-xl font-semibold text-slate-200 mb-2">Nueva Inspección de Campo</h2>
                    <p className="text-slate-500 max-w-md mx-auto">Seleccione el tipo de inspección desde el menú lateral para comenzar el registro digital.</p>
                  </div>
                } />
                <Route path="inspections/extinguishers" element={<ExtinguisherManager />} />
                <Route path="inspections/vehicles" element={<VehicleManager />} />

                {/* Flota */}
                <Route path="fleet/inventory" element={<VehicleInventory />} />
                <Route path="fleet/setup" element={<FleetSetup />} />

                {/* Protección EPI */}
                <Route path="protection/inventory" element={<ProtectionInventory />} />
                <Route path="protection/inspections" element={<div className="p-12 glass-panel rounded-3xl text-center text-slate-500">Módulo de Inspección de Equipos de Protección Personal</div>} />
                <Route path="protection/setup" element={<MasterEntityManager title="Categorías de Equipos" entityName="Categoría" />} />

                {/* Admin */}
                <Route path="admin/users" element={<UserManager />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
