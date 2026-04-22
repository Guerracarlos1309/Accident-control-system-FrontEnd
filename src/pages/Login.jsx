import { useState } from "react";
import { Lock, User, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoCorpoelec from "../assets/logoCorpoelecSinFondo.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(formData.username, formData.password);

    setIsSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex bg-white transition-colors duration-200 overflow-hidden">
      {/* Columna Izquierda - Acceso */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src={logoCorpoelec}
              alt="Corpoelec"
              className="w-20 h-20 object-contain"
            />
          </div>

          {/* Brand Header */}
          <div className="text-center lg:text-left mb-12">
            <h1 className="text-5xl font-black text-corpoelec-blue tracking-tighter uppercase">
              ASHO
            </h1>
            <div className="h-1.5 w-12 bg-corpoelec-red mt-3 rounded-full mx-auto lg:mx-0"></div>
            <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">
              Sistema de Gestión Integral
            </p>
          </div>

          {/* Minimalist Login Form */}
          <div className="space-y-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
                >
                  Usuario
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ingrese su nombre de usuario"
                    className="input-field pl-12 h-14 text-sm font-bold bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
                >
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="input-field pl-12 h-14 text-sm font-bold bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full h-14 mt-4 shadow-none cursor-pointer "
              >
                {isSubmitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <span className="font-black uppercase tracking-widest text-xs">
                    Iniciar Sesión
                  </span>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between opacity-50">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                &copy; {new Date().getFullYear()} Corpoelec
              </p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                ASHO TÁCHIRA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Branding Azul */}
      <div className="hidden lg:flex lg:w-1/2 bg-corpoelec-blue relative items-center justify-center p-12">
        <div className="text-center">
          <div className="w-40 h-40 mx-auto mb-8 bg-white p-6 rounded-[2.5rem] shadow-xl">
            <img
              src={logoCorpoelec}
              alt="Corpoelec"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">
            CONTROL <br /> & <span className="text-blue-200">PREVENCIÓN</span>
          </h2>
          <div className="w-12 h-1 bg-corpoelec-red mx-auto mt-6 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
}
