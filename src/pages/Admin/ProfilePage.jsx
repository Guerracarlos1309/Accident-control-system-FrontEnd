import { useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Key, 
  Eye, 
  EyeOff,
  UserCircle
} from "lucide-react";

export default function ProfilePage() {
  const [showPass, setShowPass] = useState({ current: false, new: false });
  const [formData, setFormData] = useState({
    fullName: "Usuario Administrador",
    username: "admin.asho",
    email: "admin.asho@corpoelec.com",
    role: "Administrador de Sistema",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updating personal profile...", formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Mi Perfil</h2>
        <p className="text-sm text-slate-500">Gestione su información personal y configuración de seguridad.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS GENERALES */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
            <UserCircle size={18} className="text-blue-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Información de Usuario</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
              <input 
                type="text" name="fullName" value={formData.fullName} 
                onChange={handleChange} className="input-field h-10" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
              <input 
                type="email" name="email" value={formData.email} 
                onChange={handleChange} className="input-field h-10" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre de Usuario</label>
              <input 
                type="text" name="username" value={formData.username} 
                onChange={handleChange} className="input-field h-10 bg-slate-950/50" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rol Asignado</label>
              <div className="h-10 px-4 flex items-center bg-slate-950/50 border border-slate-800 rounded-xl text-xs text-slate-400 font-medium">
                {formData.role}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: SEGURIDAD */}
        <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-800">
            <Key size={18} className="text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Cambio de Contraseña</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contraseña Actual</label>
              <div className="relative">
                <input 
                  type={showPass.current ? "text" : "password"} 
                  name="currentPassword" value={formData.currentPassword} 
                  onChange={handleChange} className="input-field h-10 pr-10" 
                  placeholder="••••••••"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(p => ({...p, current: !p.current}))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  {showPass.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="hidden md:block"></div> {/* Spacer */}
            
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nueva Contraseña</label>
              <input 
                type="password" name="newPassword" value={formData.newPassword} 
                onChange={handleChange} className="input-field h-10" 
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirmar Nueva Contraseña</label>
              <input 
                type="password" name="confirmPassword" value={formData.confirmPassword} 
                onChange={handleChange} className="input-field h-10" 
              />
            </div>
          </div>
        </div>

        {/* BOTOES DE ACCIÓN (STICKY) */}
        <div className="sticky bottom-0 bg-slate-900 pt-6 pb-2 border-t border-slate-800 flex justify-end gap-3 translate-y-2">
          <button 
            type="button" 
            className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider"
          >
            Descartar
          </button>
          <button 
            type="submit" 
            className="btn-primary px-8 h-11 shadow-lg shadow-blue-500/10"
          >
            Actualizar Perfil
          </button>
        </div>
      </form>
    </div>
  );
}
