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
           <div className="flex items-center gap-2 pb-2 border-b border-border-main">
             <User size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Información Personal</h4>
           </div>
           
           <div className="space-y-1">
             <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Nombre Completo *</label>
             <input 
               type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
               className="input-field h-12" placeholder="Ej: Juan Pérez"
             />
           </div>
        </div>

        {/* Credenciales */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 pb-2 border-b border-border-main">
             <Lock size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Credenciales de Acceso</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Nombre de Usuario *</label>
                <div className="relative">
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                  <input 
                    type="text" name="username" required value={formData.username} onChange={handleChange}
                    className="input-field h-12 pl-12" placeholder="jperez"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className="input-field h-12 pl-12" placeholder="juan.perez@empresa.com"
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Seguridad y Roles */}
        <div className="space-y-4">
           <div className="flex items-center gap-2 pb-2 border-b border-border-main">
             <Shield size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Permisos y Estatus</h4>
           </div>
           <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Rol de Sistema</label>
                <select 
                  name="role" value={formData.role} onChange={handleChange}
                  className="input-field h-12 font-bold"
                >
                  <option value="admin">Administrador (Control Total)</option>
                  <option value="inspector">Inspector (Registro y Búsqueda)</option>
                  <option value="analyst">Analista (Solo Lectura y Reportes)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Contraseña *</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" required value={formData.password} onChange={handleChange}
                    className="input-field h-12 pr-12 font-bold" placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="btn-primary"
        >
          Crear Usuario Admin
        </button>
      </div>
    </form>
  );
}
