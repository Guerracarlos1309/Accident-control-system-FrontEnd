import {
  Users,
  Building,
  ShieldAlert,
  FileSearch,
  Car,
  Zap,
  Activity,
  Database,
  BarChart3,
} from "lucide-react";

export const NAVIGATION_CONFIG = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: Activity,
    isRoot: true,
  },
  {
    id: "hr",
    label: "Recursos Humanos",
    icon: Users,
    items: [
      { path: "/hr/employees", label: "Directorio Personal" },
      { path: "/hr/inactive", label: "Personal Inactivo" },
      { path: "/hr/catalogs", label: "Cargos y Deptos" },
    ],
  },
  {
    id: "infra",
    label: "Infraestructura",
    icon: Building,
    items: [
      { path: "/infra/facilities", label: "Sedes y Plantas" },
      { path: "/infra/locations", label: "Ubicación Geog." },
    ],
  },
  {
    id: "asho",
    label: "Seguridad (ASHO)",
    icon: ShieldAlert,
    items: [
      { path: "/accidents/register", label: "Control Accidentes" },
      { path: "/inspections/extinguishers", label: "Inspecc. Extintores" },
      { path: "/accidents/catalogs", label: "Config. Accidentes" },
    ],
  },
  {
    id: "protection",
    label: "Equipos de Protección",
    icon: Zap,
    items: [
      { path: "/protection/inventory", label: "Inventario EPP" },
      { path: "/protection/inspections", label: "Inspecciones EPP" },
      { path: "/protection/setup", label: "Categorías EPP" },
    ],
  },
  {
    id: "fleet",
    label: "Inspecciones Vehiculares",
    icon: Car,
    items: [
      { path: "/fleet/inventory", label: "Inventario Flota" },
      { path: "/inspections/vehicles", label: "Inspecc. Vehículos" },
      { path: "/fleet/setup", label: "Modelos y Marcas" },
    ],
  },
  {
    id: "reports",
    label: "Reportes",
    path: "/reports",
    icon: BarChart3,
    isRoot: true,
  },
  {
    id: "admin",
    label: "Administración",
    icon: Database,
    separator: true,
    items: [{ path: "/admin/users", label: "Usuarios y Sistema" }],
  },
  {
    id: "ayuda",
    label: "Ayuda",
    path: "/ayuda",
    icon: FileSearch,
    isRoot: true,
  },
];
