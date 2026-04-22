import { useState, useEffect } from "react";
import { 
  Mail, 
  Lock, 
  Shield, 
  Eye, 
  EyeOff,
  Loader2
} from "lucide-react";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

export default function UserForm({ data: editingData, onCancel, onSubmitSuccess }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({
    username: editingData?.username || "",
    roleId: editingData?.roleId || "",
    password: ""
  });

  const api = helpFetch();
  const { showNotification } = useNotification();
  const isEditing = !!editingData;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/roles");
        if (res && !res.err && Array.isArray(res)) {
          setRoles(res);
        } else {
          setRoles([]);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roleId) return showNotification("Seleccione un rol", "error");
    if (!isEditing && !formData.password) return showNotification("La contraseña es obligatoria", "error");

    setLoading(true);
    try {
      const payload = {
        ...formData,
        email: formData.username // Make email = username as requested
      };

      const method = isEditing ? "put" : "post";
      const url = isEditing ? `users/${editingData.id}` : "users";
      
      const res = await api[method](url, { body: payload });
      
      if (res && !res.err) {
        showNotification(`Usuario ${isEditing ? "actualizado" : "creado"} con éxito`, "success");
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        showNotification(res.message || "Error al procesar solicitud", "error");
      }
    } catch (err) {
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Credenciales */}
        <div className="space-y-5">
           <div className="flex items-center gap-2 pb-2 border-b border-border-main">
             <Mail size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Identificación</h4>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Usuario (Correo Electrónico) *</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                  <input 
                    type="email" 
                    name="username" 
                    required 
                    readOnly={isEditing}
                    value={formData.username} 
                    onChange={handleChange}
                    className={`input-field h-12 pl-12 font-bold ${isEditing ? 'opacity-60 cursor-not-allowed bg-bg-main/5' : ''}`} 
                    placeholder="ejemplo@corpoelec.gob.ve"
                  />
                </div>
                {isEditing && <p className="text-[9px] text-txt-muted italic ml-1 mt-1">El identificador de acceso no puede ser modificado.</p>}
              </div>

              <div className="space-y-1.5 focus-within:z-10 relative">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Contraseña {isEditing ? "(Opcional)" : "*"}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted" size={16} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    required={!isEditing} 
                    value={formData.password} 
                    onChange={handleChange}
                    className="input-field h-12 pl-12 pr-12 font-bold" 
                    placeholder={isEditing ? "•••••••• (Dejar vacío para no cambiar)" : "••••••••"}
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

        {/* Estatus y Permisos */}
        <div className="space-y-5">
           <div className="flex items-center gap-2 pb-2 border-b border-border-main">
             <Shield size={16} className="text-corpoelec-blue" />
             <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Nivel de Acceso</h4>
           </div>
           
           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] ml-1">Rol de Sistema *</label>
                <select 
                  name="roleId" 
                  required 
                  value={formData.roleId} 
                  onChange={handleChange}
                  className="input-field h-12 font-bold"
                >
                  <option value="">Seleccione rol...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-corpoelec-blue/5 border border-corpoelec-blue/10 rounded-2xl">
                 <p className="text-[9px] text-corpoelec-blue font-black uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Shield size={12} strokeWidth={3} /> Nota de Seguridad
                 </p>
                 <p className="text-[10px] text-txt-muted leading-relaxed">
                    Asegúrese de asignar el rol correcto. Los administradores tienen acceso total a la gestión de datos sensibles.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-bg-surface pt-6 pb-2 border-t border-border-main flex justify-end gap-3 translate-y-2">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          className="px-6 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="btn-primary min-w-[200px]"
        >
          {loading ? (
             <div className="flex items-center gap-2">
               <Loader2 size={16} className="animate-spin" />
               <span>Procesando...</span>
             </div>
          ) : isEditing ? "Actualizar Cuenta" : "Crear Usuario Admin"}
        </button>
      </div>
    </form>
  );
}
