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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-4">
      {/* Background decoration */}
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
          <p className="text-slate-400 text-sm mt-1">
            Sist. de Accidentes e Inspecciones
          </p>
        </div>

        {/* Login Box */}
        <div className="glass-panel p-8 rounded-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ingrese su usuario"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="input-field pl-10"
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
          &copy; {new Date().getFullYear()} Gerencia de ASHO. Todos los derechos
          reservados.
        </p>
      </div>
    </div>
  );
}
