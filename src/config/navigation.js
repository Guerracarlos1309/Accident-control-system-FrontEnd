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
      {
        path: "/hr/inactive",
        label: "Personal Inactivo",
        allowedRoles: ["Administrador", "Inspector"],
      },
      {
        path: "/hr/catalogs",
        label: "Cargos y Gerencias",
        allowedRoles: ["Administrador"],
      },
    ],
  },
  {
    id: "infra",
    label: "Infraestructura",
    icon: Building,
    items: [
      { path: "/infra/facilities", label: "Sedes y Plantas" },
      {
        path: "/infra/inactive",
        label: "Sedes Inactivas",
        allowedRoles: ["Administrador", "Inspector"],
      },
      { path: "/infra/codes", label: "Códigos de Control" },
      {
        path: "/infra/locations",
        label: "Ubicación Geog.",
        allowedRoles: ["Administrador"],
      },
    ],
  },
  {
    id: "asho",
    label: "Seguridad (ASHO)",
    icon: ShieldAlert,
    items: [
      { path: "/accidents/register", label: "Control Accidentes" },
      { path: "/inspections/extinguishers", label: "Inspecc. Extintores" },
      {
        path: "/accidents/catalogs",
        label: "Config. Accidentes",
        allowedRoles: ["Administrador"],
      },
    ],
  },
  {
    id: "protection",
    label: "Equipos de Protección",
    icon: Zap,
    items: [
      { path: "/protection/inventory", label: "Inventario EPP" },
      { path: "/protection/inspections", label: "Inspecciones EPP" },
    ],
  },
  {
    id: "fleet",
    label: "Inspecciones Vehiculares",
    icon: Car,
    items: [
      { path: "/fleet/inventory", label: "Inventario Flota" },
      { path: "/inspections/vehicles", label: "Inspecc. Vehículos" },
      {
        path: "/fleet/setup",
        label: "Modelos y Marcas",
        allowedRoles: ["Administrador"],
      },
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
    id: "ayuda",
    label: "Ayuda",
    path: "/ayuda",
    icon: FileSearch,
    isRoot: true,
  },

  {
    id: "admin",
    label: "Administración",
    icon: Database,
    separator: true,
    allowedRoles: ["Administrador"],
    items: [{ path: "/admin/users", label: "Usuarios y Sistema" }],
  },
];
