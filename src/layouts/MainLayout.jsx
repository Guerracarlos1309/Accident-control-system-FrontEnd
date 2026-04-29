import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Menu,
  Zap,
  X,
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";
import logoCorpoelec from "../assets/logoCorpoelecSinFondo.png";
import { useTheme } from "../context/ThemeContext";

import { useState, useEffect } from "react";
import { NAVIGATION_CONFIG } from "../config/navigation";

export default function MainLayout() {
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [openMenus, setOpenMenus] = useState({});
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
    if (!sidebarOpen) return;

    const currentModule = NAVIGATION_CONFIG.find((m) =>
      m.items?.some((item) => location.pathname.startsWith(item.path)),
    );

    if (currentModule) {
      setOpenMenus((prev) => ({ ...prev, [currentModule.id]: true }));
    }
  }, [location.pathname, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (sidebarOpen) setOpenMenus({});
  };

  const toggleMenu = (id) => {
    if (!sidebarOpen && !isMobile) {
      setSidebarOpen(true);
      setOpenMenus({ [id]: true });
    } else {
      setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  const SubNavLink = ({ to, label }) => (
    <NavLink
      to={to}
      onClick={() => isMobile && setSidebarOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 p-2.5 rounded-lg transition-all text-sm ${
          isActive
            ? "text-white font-semibold bg-white/10 shadow-sm"
            : "text-blue-100/70 hover:text-white hover:bg-white/5"
        }`
      }
    >
      <div className="w-1.5 h-1.5 rounded-full bg-slate-700 active-dot transition-colors" />
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-bg-main text-txt-main selection:bg-corpoelec-blue/30">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static inset-y-0 left-0 z-50
        bg-sidebar border-r border-white/10 transition-all duration-300 flex flex-col
        ${sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"}
      `}
      >
        <div className="border-b border-white/10 transition-all duration-300 overflow-hidden">
          {(sidebarOpen || !isMobile) && (
            <div
              className={`transition-all duration-300 h-24 flex items-center justify-center ${
                sidebarOpen ? "opacity-100" : "opacity-0 w-0 h-0"
              }`}
            >
              <img
                src={logoCorpoelec}
                alt="Corpoelec"
                className="w-full h-auto scale-90 transform hover:scale-[1.6] transition-transform pointer-events-none"
              />
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {NAVIGATION_CONFIG.map((module) => (
            <div
              key={module.id}
              className={
                module.separator ? "pt-4 mt-4 border-t border-white/10" : ""
              }
            >
              {module.isRoot ? (
                <NavLink
                  to={module.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-xl transition-all overflow-hidden ${
                      isActive
                        ? "bg-white/20 text-white border border-white/20 shadow-lg"
                        : "hover:bg-white/10 text-blue-50 hover:text-white"
                    }`
                  }
                >
                  <div className="shrink-0">
                    <module.icon size={20} />
                  </div>
                  <span
                    className={`font-medium whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 md:hidden"}`}
                  >
                    {module.label}
                  </span>
                </NavLink>
              ) : (
                <div className="space-y-1">
                  <button
                    onClick={() => toggleMenu(module.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all overflow-hidden ${
                      location.pathname.includes(
                        module.items[0].path.split("/")[1],
                      )
                        ? "text-white bg-white/10"
                        : "hover:bg-white/5 text-blue-100 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <module.icon size={20} />
                      </div>
                      <span
                        className={`font-medium whitespace-nowrap transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 w-0 md:hidden"}`}
                      >
                        {module.label}
                      </span>
                    </div>
                    {sidebarOpen && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${openMenus[module.id] ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {sidebarOpen && openMenus[module.id] && (
                    <div className="pl-9 space-y-1 transition-all">
                      {module.items.map((item) => (
                        <SubNavLink
                          key={item.path}
                          to={item.path}
                          label={item.label}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 shrink-0 bg-bg-surface border-b border-border-main flex items-center px-4 md:px-8 justify-between z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl bg-bg-main/50 hover:bg-bg-main border border-border-main transition-all text-txt-sub hover:text-txt-main shadow-sm"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:flex items-center gap-3 select-none">
              <span
                className="text-2xl md:text-3xl font-black text-yellow-400 uppercase tracking-tighter drop-shadow-xl"
                style={{
                  textShadow: "3px 3px 0px #000, 5px 5px 0px rgba(0,0,0,0.15)",
                }}
              >
                ASHO
              </span>
              <span className="text-xl md:text-2xl font-bold text-txt-main uppercase tracking-tight border-l border-border-main pl-3">
                Táchira
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-bg-main/50 hover:bg-bg-main border border-border-main transition-all text-txt-sub hover:text-txt-main shadow-sm"
              title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-10 h-10 rounded-xl bg-corpoelec-blue flex items-center justify-center font-bold text-sm text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all focus:outline-none ring-offset-2 ring-offset-bg-primary hover:ring-2 ring-corpoelec-blue"
            >
              U
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-12 w-64 bg-bg-surface border border-border-main rounded-2xl shadow-lg py-2 z-50">
                  <div className="px-4 py-3 border-b border-border-main mb-2">
                    <p className="text-sm font-black text-txt-main">
                      Usuario Administrador
                    </p>
                    <p className="text-[10px] text-txt-muted truncate mt-0.5 font-mono">
                      admin.asho@corpoelec.com
                    </p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-txt-sub hover:text-txt-main hover:bg-bg-main/50 transition-colors"
                  >
                    <User size={16} /> Ver Perfil
                  </NavLink>
                  <NavLink
                    to="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-corpoelec-red hover:bg-corpoelec-red/10 transition-colors mt-1"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </NavLink>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative custom-scrollbar">
          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
