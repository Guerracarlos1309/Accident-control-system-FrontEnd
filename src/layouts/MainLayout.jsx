import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  ShieldAlert,
  FileSearch,
  Menu,
  Zap,
  X,
  ChevronDown,
  Car,
  FireExtinguisher,
  Database,
  Users,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import { useState, useEffect } from "react";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [inspectionsOpen, setInspectionsOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // auto-open dropdown if inside that route
  useEffect(() => {
    if (location.pathname.startsWith("/inspections") && sidebarOpen) {
      setInspectionsOpen(true);
    }
    if (location.pathname.startsWith("/setup") && sidebarOpen) {
      setSetupOpen(true);
    }
  }, [location.pathname, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (!sidebarOpen) {
      if (location.pathname.startsWith("/inspections"))
        setInspectionsOpen(true);
      if (location.pathname.startsWith("/setup")) setSetupOpen(true);
    } else {
      setInspectionsOpen(false);
      setSetupOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col
        ${sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"}
      `}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between min-h-[64px]">
          {(sidebarOpen || !isMobile) && (
            <div
              className={`flex items-center gap-2 text-blue-500 font-bold text-lg overflow-hidden transition-all ${sidebarOpen ? "opacity-100 flex-1" : "opacity-0 w-0"}`}
            >
              <Zap size={24} fill="currentColor" className="shrink-0" />
              <span>Gerencia ASHO</span>
            </div>
          )}

          {isMobile ? (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors ml-auto"
            >
              <X size={20} />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors mx-auto shrink-0"
            >
              <Menu size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink
            to="/dashboard"
            onClick={() => isMobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden ${
                isActive
                  ? "bg-blue-600/10 text-blue-500 border border-blue-500/20"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <div className="shrink-0">
              <Activity size={20} />
            </div>
            <span
              className={`font-medium whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 md:hidden"}`}
            >
              Dashboard
            </span>
          </NavLink>

          <NavLink
            to="/accidents"
            onClick={() => isMobile && setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors overflow-hidden ${
                isActive
                  ? "bg-blue-600/10 text-blue-500 border border-blue-500/20"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <div className="shrink-0">
              <ShieldAlert size={20} />
            </div>
            <span
              className={`font-medium whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 md:hidden"}`}
            >
              Control de Accidentes
            </span>
          </NavLink>

          {/* Menú Desplegable Inspecciones */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (!sidebarOpen && !isMobile) setSidebarOpen(true);
                setInspectionsOpen(!inspectionsOpen);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors overflow-hidden ${
                location.pathname.includes("/inspections")
                  ? "text-blue-400"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <FileSearch size={20} />
                </div>
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 md:hidden"}`}
                >
                  Inspecciones
                </span>
              </div>
              {sidebarOpen && (
                <div
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    transform: inspectionsOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                >
                  <ChevronDown size={16} />
                </div>
              )}
            </button>

            {/* Submenú Inspecciones */}
            {sidebarOpen && inspectionsOpen && (
              <div className="pl-4 mt-1 space-y-1 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <NavLink
                  to="/inspections/extinguishers"
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-slate-800/80 text-blue-400 border-l-2 border-blue-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent"
                    }`
                  }
                >
                  <FireExtinguisher size={18} />
                  Equipos (Extintores)
                </NavLink>

                <NavLink
                  to="/inspections/vehicles"
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-slate-800/80 text-blue-400 border-l-2 border-blue-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent"
                    }`
                  }
                >
                  <Car size={18} />
                  Parque Automotor
                </NavLink>
              </div>
            )}
          </div>

          {/* Separador */}
          {sidebarOpen && (
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3">
                Configuración Base
              </p>
            </div>
          )}

          {/* Menú Desplegable Configuración/Setups */}
          <div className={!sidebarOpen ? "pt-2" : ""}>
            <button
              onClick={() => {
                if (!sidebarOpen && !isMobile) setSidebarOpen(true);
                setSetupOpen(!setupOpen);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors overflow-hidden ${
                location.pathname.includes("/setup")
                  ? "text-emerald-400"
                  : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  <Database size={20} />
                </div>
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 md:hidden"}`}
                >
                  Bases de Datos
                </span>
              </div>
              {sidebarOpen && (
                <div
                  className="shrink-0 transition-transform duration-200"
                  style={{
                    transform: setupOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown size={16} />
                </div>
              )}
            </button>

            {/* Submenú Setup */}
            {sidebarOpen && setupOpen && (
              <div className="pl-4 mt-1 space-y-1 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <NavLink
                  to="/setup/employees"
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-slate-800/80 text-emerald-400 border-l-2 border-emerald-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent"
                    }`
                  }
                >
                  <Users size={18} />
                  Personal (RRHH)
                </NavLink>

                <NavLink
                  to="/setup/vehicles"
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-slate-800/80 text-emerald-400 border-l-2 border-emerald-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent"
                    }`
                  }
                >
                  <Settings size={18} />
                  Vehículos Base
                </NavLink>

                <NavLink
                  to="/setup/extinguishers"
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-slate-800/80 text-emerald-400 border-l-2 border-emerald-500"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-l-2 border-transparent"
                    }`
                  }
                >
                  <FireExtinguisher size={18} />
                  Extintores Base
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 shrink-0 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center px-4 md:px-8 justify-between z-30">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-lg md:text-xl font-semibold text-slate-100 hidden sm:block">
              Sistema de Control de accidentes e inspecciones ASHO
            </h1>
          </div>
          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-blue-600/30 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950"
              title="Opciones de usuario"
            >
              U
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                ></div>
                <div className="absolute right-0 top-10 mt-2 w-56 glass-panel bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-slate-800 mb-2">
                    <p className="text-sm font-medium text-slate-200">
                      Usuario Administrador
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      usuario@corpoelec.com
                    </p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <User size={16} /> Ajustes de Perfil
                  </NavLink>
                  <NavLink
                    to="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </NavLink>
                </div>
              </>
            )}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950/0 to-slate-950/0 pointer-events-none"></div>
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
