import {
  Users,
  Building,
  ShieldAlert,
  FileSearch,
  Car,
  Zap,
  Activity,
  Database,
  BarChart3
} from "lucide-react";

export const NAVIGATION_CONFIG = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: Activity,
    isRoot: true
  },
  {
    id: "hr",
    label: "Recursos Humanos",
    icon: Users,
    items: [
      { path: "/hr/employees", label: "Directorio Personal" },
      { path: "/hr/catalogs", label: "Cargos y Deptos" }
    ]
  },
  {
    id: "infra",
    label: "Infraestructura",
    icon: Building,
    items: [
      { path: "/infra/facilities", label: "Sedes y Plantas" },
      { path: "/infra/locations", label: "Ubicación Geog." }
    ]
  },
  {
    id: "asho",
    label: "Seguridad (ASHO)",
    icon: ShieldAlert,
    items: [
      { path: "/accidents/register", label: "Control Accidentes" },
      { path: "/inspections/extinguishers", label: "Inspecc. Extintores" },
      { path: "/accidents/catalogs", label: "Config. Accidentes" }
    ]
  },
  {
    id: "protection",
    label: "Protección (EPI)",
    icon: Zap,
    items: [
      { path: "/protection/inventory", label: "Inventario EPI" },
      { path: "/protection/inspections", label: "Inspecciones EPI" },
      { path: "/protection/setup", label: "Categorías EPI" }
    ]
  },
  {
    id: "fleet",
    label: "Flota Vehicular",
    icon: Car,
    items: [
      { path: "/fleet/inventory", label: "Inventario Flota" },
      { path: "/inspections/vehicles", label: "Inspecc. Vehículos" },
      { path: "/fleet/setup", label: "Modelos y Marcas" }
    ]
  },
  {
    id: "inspections-gen",
    label: "Inspecciones Gral.",
    icon: FileSearch,
    items: [
      { path: "/inspections/new", label: "Nueva Inspección" },
      { path: "/reports", label: "Reportes Consolidados" }
    ]
  },
  {
    id: "admin",
    label: "Administración",
    icon: Database,
    separator: true,
    items: [
      { path: "/admin/users", label: "Usuarios y Sistema" }
    ]
  }
];
