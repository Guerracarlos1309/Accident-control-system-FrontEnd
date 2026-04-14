import { useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  UserPlus, 
  Eye, 
  EyeOff,
  UserCheck,
  Smartphone
} from "lucide-react";

export default function UserForm({ onCancel }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    status: "active"
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Creating administrative user...", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Información Personal */}
        <div className="col-span-1 md:col-span-2 space-y-4">
           <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
             <User size={16} className="text-blue-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Información Personal</h4>
           </div>
           
           <div className="space-y-1">
             <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre Completo *</label>
             <input 
               type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
               className="input-field h-11" placeholder="Ej: Juan Pérez"
             />
           </div>
        </div>

        {/* Credenciales */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
             <Lock size={16} className="text-emerald-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Credenciales de Acceso</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nombre de Usuario *</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="text" name="username" required value={formData.username} onChange={handleChange}
                    className="input-field h-10 pl-10" placeholder="jperez"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className="input-field h-10 pl-10" placeholder="juan.perez@empresa.com"
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Seguridad y Roles */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
             <Shield size={16} className="text-amber-500" />
             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Permisos y Estatus</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rol de Sistema</label>
                <select 
                  name="role" value={formData.role} onChange={handleChange}
                  className="input-field h-10 text-slate-300 [&>option]:bg-slate-800"
                >
                  <option value="admin">Administrador (Control Total)</option>
                  <option value="inspector">Inspector (Registro y Búsqueda)</option>
                  <option value="analyst">Analista (Solo Lectura y Reportes)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contraseña *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" required value={formData.password} onChange={handleChange}
                    className="input-field h-10 pr-10" placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* FOOTER PEGAJOSO (SÓLIDO) */}
      <div className="sticky bottom-0 bg-slate-900 pt-6 pb-2 border-t border-slate-800 flex justify-end gap-3 translate-y-2">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-primary px-8 h-11"
        >
          Crear Usuario Admin
        </button>
      </div>
    </form>
  );
}
