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

// Componentes Core
import MasterEntityManager from "./components/MasterEntityManager";

// Módulos Especializados
import AccidentsManager from "./pages/Safety/Accidents/AccidentsManager";
import ExtinguisherManager from "./pages/Safety/Inspections/Extinguishers/ExtinguisherManager";
import VehicleManager from "./pages/Safety/Inspections/Vehicles/VehicleManager";
import FacilityManager from "./pages/Infrastructure/FacilityManager";
import ProtectionInventory from "./pages/Safety/Protection/ProtectionInventory.jsx";
import VehicleInventory from "./pages/Fleet/Inventory/VehicleInventory";
import EmployeeForm from "./pages/HR/Employees/EmployeeForm";
import EmployeeDetails from "./pages/HR/Employees/EmployeeDetails";
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
                  <Route path="hr/employees" element={
                    <MasterEntityManager 
                      title="Directorio de Empleados" 
                      entityName="Empleado" 
                      apiPath="/employees"
                      idField="personalNumber"
                      fields={[
                        { name: "personalNumber", label: "N° Personal" },
                        { name: "idCard", label: "Cédula" },
                        { name: "firstName", label: "Nombre" },
                        { name: "lastName", label: "Apellido" },
                        { name: "jobTitle", label: "Cargo", displayKey: "jobTitle" }
                      ]}
                      FormComponent={EmployeeForm} 
                      ViewComponent={EmployeeDetails}
                      modalMaxWidth="max-w-4xl"
                    />
                  } />
                  <Route path="hr/inactive" element={
                    <MasterEntityManager 
                      title="Personal Inactivo / Histórico" 
                      description="Historial del personal desactivado. Aquí puede reactivar empleados o eliminarlos permanentemente."
                      entityName="Empleado" 
                      apiPath="/employees?status=0" 
                      idField="personalNumber"
                      deleteMode="hard"
                      allowReactivate={true}
                      FormComponent={EmployeeForm}
                      ViewComponent={EmployeeDetails}
                      fields={[
                        { name: "personalNumber", label: "N° Personal" },
                        { name: "firstName", label: "Nombre" },
                        { name: "lastName", label: "Apellido" },
                        { name: "idCard", label: "Cédula" }
                      ]}
                    />
                  } />
                  <Route path="hr/catalogs" element={
                    <div className="space-y-8">
                      <MasterEntityManager 
                        title="Gestión de Cargos" 
                        entityName="Cargo" 
                        apiPath="/lookups/occupations"
                      />
                      <MasterEntityManager 
                        title="Departamentos" 
                        entityName="Departamento" 
                        apiPath="/lookups/departments"
                      />
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
