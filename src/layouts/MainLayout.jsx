import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Menu, Zap, X, ChevronDown, LogOut, User } from "lucide-react";

import { useState, useEffect } from "react";
import { NAVIGATION_CONFIG } from "../config/navigation";

export default function MainLayout() {
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
            ? "text-blue-400 font-semibold bg-blue-500/5 shadow-sm"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
        }`
      }
    >
      <div className="w-1.5 h-1.5 rounded-full bg-slate-700 active-dot transition-colors" />
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
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
              <Zap
                size={24}
                fill="currentColor"
                className="shrink-0 animate-pulse"
              />
              <span className="tracking-tight">Corpoelec ASHO Táchira</span>
            </div>
          )}

          <button
            onClick={isMobile ? () => setSidebarOpen(false) : toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors mx-auto shrink-0 text-slate-400 hover:text-white"
          >
            {isMobile && sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {NAVIGATION_CONFIG.map((module) => (
            <div
              key={module.id}
              className={
                module.separator ? "pt-4 mt-4 border-t border-slate-800/50" : ""
              }
            >
              {module.isRoot ? (
                <NavLink
                  to={module.path}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-xl transition-all overflow-hidden ${
                      isActive
                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
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
                        ? "text-blue-400 bg-blue-500/5"
                        : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
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
                        className={`transition-transform duration-300 ${openMenus[module.id] ? "rotate-180" : ""}`}
                      />
                    )}
                  </button>

                  {sidebarOpen && openMenus[module.id] && (
                    <div className="pl-9 space-y-1 animate-in slide-in-from-top-2 duration-300">
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
        <header className="h-16 shrink-0 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800 flex items-center px-4 md:px-8 justify-between z-30">
          <div className="flex items-center gap-3">
            {isMobile && !sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400"
              >
                <Menu size={20} />
              </button>
            )}
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent hidden sm:block">
              Sistema Integral ASHO
            </h1>
          </div>

          <div className="flex items-center gap-4 relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-sm shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all focus:outline-none ring-offset-2 ring-offset-slate-950 hover:ring-2 ring-blue-500"
            >
              U
            </button>

            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />
                <div className="absolute right-0 top-12 w-64 bg-slate-950 border border-slate-700/60 rounded-2xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 fade-in duration-200 ring-1 ring-white/5">
                  <div className="px-4 py-3 border-b border-slate-800/80 mb-2">
                    <p className="text-sm font-black text-white">
                      Usuario Administrador
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                      admin.asho@corpoelec.com
                    </p>
                  </div>
                  <NavLink
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <User size={16} /> Ver Perfil
                  </NavLink>
                  <NavLink
                    to="/login"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-1"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </NavLink>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative custom-scrollbar">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/5 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
