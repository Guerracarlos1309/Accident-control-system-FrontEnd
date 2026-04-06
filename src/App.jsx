import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

// Modulos
import AccidentsManager from "./pages/Accidents/AccidentsManager";
import ExtinguisherManager from "./pages/Inspections/ExtinguisherManager";
import VehicleManager from "./pages/Inspections/VehicleManager";
import Instalaciones from "./pages/Inspections/Instalaciones";
import EntitySetupManager from "./pages/EntitySetupManager";

// Setup Forms
import EmployeeForm from "./pages/Setup/EmployeeForm";
import VehicleBaseForm from "./pages/Setup/VehicleBaseForm";
import ExtinguisherBaseForm from "./pages/Setup/ExtinguisherBaseForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="accidents" element={<AccidentsManager />} />

          <Route
            path="inspections/extinguishers"
            element={<ExtinguisherManager />}
          />
          <Route path="inspections/vehicles" element={<VehicleManager />} />
          <Route path="inspections/instalaciones" element={<Instalaciones />} />

          <Route
            path="setup/employees"
            element={
              <EntitySetupManager
                title="Directorio de Empleados"
                description="Administración de la nómina y datos del trabajador"
                entityName="Empleado"
                FormComponent={EmployeeForm}
              />
            }
          />

          <Route
            path="setup/vehicles"
            element={
              <EntitySetupManager
                title="Inventario de Vehículos"
                description="Gestión base automotriz"
                entityName="Vehículo"
                FormComponent={VehicleBaseForm}
              />
            }
          />

          <Route
            path="setup/extinguishers"
            element={
              <EntitySetupManager
                title="Inventario de Extintores"
                description="Red base de equipos contraincendios"
                entityName="Extintor"
                FormComponent={ExtinguisherBaseForm}
              />
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
