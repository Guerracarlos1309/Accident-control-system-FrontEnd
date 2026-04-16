import { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Shield, 
  Key, 
  Eye, 
  EyeOff,
  UserCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showNotification } = useNotification();
  const [showPass, setShowPass] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        role: user.role || "Usuario"
      }));
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return showNotification("Las contraseñas no coinciden", "error");
    }

    setIsSubmitting(true);
    
    const updateData = {
      name: formData.name,
      email: formData.email
    };

    if (formData.newPassword) {
      updateData.password = formData.newPassword;
    }

    const result = await updateUser(updateData);
    
    setIsSubmitting(false);
    
    if (result.success) {
      setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Mi Perfil</h2>
          <p className="text-sm text-slate-500">Gestione su información personal y configuración de acceso.</p>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
          ID: {user?.id}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS GENERALES */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800/50">
          <div className="flex items-center gap-2 mb-8 pb-3 border-b border-slate-800/50">
            <UserCircle size={20} className="text-blue-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Información de Usuario</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="input-field h-11" 
                placeholder="Su nombre"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="input-field h-11 pl-10" 
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username} 
                  disabled 
                  className="input-field h-11 pl-10 bg-slate-950/50 text-slate-500 cursor-not-allowed border-dashed" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Rol en el Sistema</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                <div className="h-11 pl-10 flex items-center bg-slate-950/50 border border-slate-800 border-dashed rounded-xl text-xs text-slate-500 font-bold uppercase tracking-wider">
                  {formData.role}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: SEGURIDAD */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-800/50">
          <div className="flex items-center gap-2 mb-8 pb-3 border-b border-slate-800/50">
            <Key size={20} className="text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Cambio de Contraseña</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  name="newPassword" 
                  value={formData.newPassword} 
                  onChange={handleChange} 
                  className="input-field h-11 pr-10" 
                  placeholder="Dejar vacío para no cambiar"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirmar Contraseña</label>
              <input 
                type={showPass ? "text" : "password"} 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                className="input-field h-11" 
                placeholder="Repita la nueva contraseña"
              />
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            className="px-6 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
          >
            Descartar Cambios
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-primary px-10 h-12 shadow-xl shadow-blue-600/20 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              "Actualizar Perfil"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
