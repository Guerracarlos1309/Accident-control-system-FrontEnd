import { Zap, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex bg-slate-950 relative overflow-hidden">
      
      {/* Columna Izquierda - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        {/* Background decoration specifically for the left side view */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950/80 to-slate-950 pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-sm">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4 animate-in zoom-in duration-500">
              <Zap size={36} className="text-white" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              ASHO
            </h1>
            <p className="text-slate-400 text-sm mt-1 text-center">
              Sist. de Accidentes e Inspecciones
            </p>
          </div>

          {/* Login Box */}
          <div className="glass-panel p-8 rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="username" className="text-sm font-medium text-slate-300">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User size={18} />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Ingrese su usuario"
                    className="input-field"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="input-field"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 mt-2 transition-all hover:scale-[1.02]"
              >
                Ingresar al Sistema
              </button>
            </form>
          </div>

          {/* Footer info */}
          <p className="text-center text-xs text-slate-500 mt-6 font-medium">
            &copy; {new Date().getFullYear()} Gerencia de ASHO. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Columna Derecha - Imagen */}
      <div className="hidden lg:block lg:w-1/2 relative bg-slate-900 border-l border-slate-800/50 overflow-hidden">
        {/* 
          Puedes cambiar esta URL de unsplash por la ruta local de tu foto. 
          Ej: <img src="/images/mi-foto-corpoelec.jpg" ... 
        */}
        <img 
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
          alt="Corporative Building" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 hover:opacity-50 transition-opacity duration-700"
        />
        
        {/* Gradientes decorativos para fusionar la imagen con el fondo oscuro y dar toque moderno */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
        
        {/* Texto opcional encima de la imagen */}
        <div className="absolute bottom-12 left-12 right-12 z-20">
          <div className="glass-panel p-6 rounded-xl border-l-4 border-l-blue-500 max-w-lg animate-in slide-in-from-right-8 duration-700 delay-300 fill-mode-both">
            <h2 className="text-xl font-bold text-white mb-2">Control y Prevención</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Herramienta integral para la administración, monitoreo y reporte analítico de incidencias, parque automotor e inspecciones operativas de prevención de riesgos.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
