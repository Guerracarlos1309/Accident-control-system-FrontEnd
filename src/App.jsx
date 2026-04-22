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
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Módulos Especializados (Domain Managers)
import AccidentsManager from "./pages/Safety/Accidents/AccidentsManager";
import AccidentCatalogs from "./pages/Safety/Accidents/AccidentCatalogs";
import ExtinguisherManager from "./pages/Safety/Inspections/Extinguishers/ExtinguisherManager";
import VehicleManager from "./pages/Safety/Inspections/Vehicles/VehicleManager";
import FacilityManager from "./pages/Infrastructure/FacilityManager";
import LocationSetup from "./pages/Infrastructure/LocationSetup";
import ProtectionInventory from "./pages/Safety/Protection/ProtectionInventory.jsx";
import ProtectionSetup from "./pages/Safety/Protection/ProtectionSetup";
import VehicleInventory from "./pages/Fleet/Inventory/VehicleInventory";
import EmployeeManager from "./pages/HR/Employees/EmployeeManager";
import InactiveEmployeeManager from "./pages/HR/Employees/InactiveEmployeeManager";
import HRCatalogs from "./pages/HR/HRCatalogs";
import UserManager from "./pages/Admin/Users/UserManager";
import ProfilePage from "./pages/Admin/Profile/ProfilePage";
import FleetSetup from "./pages/Fleet/Setup/FleetSetup";
import Help from "./pages/Help";
import ReportCenter from "./pages/Reports";

function App() {
  return (
    <ThemeProvider>
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
                  <Route path="hr/employees" element={<EmployeeManager />} />
                  <Route path="hr/inactive" element={<InactiveEmployeeManager />} />
                  <Route path="hr/catalogs" element={<HRCatalogs />} />

                  {/* Infraestructura */}
                  <Route path="infra/facilities" element={<FacilityManager />} />
                  <Route path="infra/locations" element={<LocationSetup />} />

                  {/* Accidentes */}
                  <Route path="accidents/register" element={<AccidentsManager />} />
                  <Route path="accidents/catalogs" element={<AccidentCatalogs />} />

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
                  <Route path="protection/setup" element={<ProtectionSetup />} />

                  {/* Admin, Reportes y Ayuda */}
                  <Route path="admin/users" element={<UserManager />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="reports" element={<ReportCenter />} />
                  <Route path="ayuda" element={<Help />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
