import { useState } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  UserCog, 
  Mail, 
  ShieldCheck, 
  MoreHorizontal,
  CircleDot,
  Trash2,
  Key
} from "lucide-react";
import Modal from "../../components/Modal";
import UserForm from "./UserForm";

const MOCK_USERS = [
  { id: 1, fullName: "Administrador ASHO", username: "admin.asho", email: "admin@empresa.com", role: "Administrador", status: "activo", lastLogin: "Hoy, 10:45 AM" },
  { id: 2, fullName: "Luis Rodríguez", username: "lrodriguez", email: "l.rodriguez@empresa.com", role: "Inspector", status: "activo", lastLogin: "Ayer, 03:20 PM" },
  { id: 3, fullName: "María García", username: "mgarcia", email: "m.garcia@empresa.com", role: "Analista", status: "suspendido", lastLogin: "12 Abr 2024" },
];

export default function UserManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = MOCK_USERS.filter(u => 
    u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <Users className="text-blue-500" />
             Control de Usuarios y Accesos
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Gestione las cuentas administrativas y niveles de acceso al sistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary shadow-lg shadow-blue-600/20"
        >
          <UserPlus size={18} />
          <span>Crear Administrador</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, usuario o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10 h-11"
        />
      </div>

      <div className="glass-panel overflow-hidden border border-slate-800/50 rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-800">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol / Permisos</th>
                <th className="px-6 py-4">Último Acceso</th>
                <th className="px-6 py-4">Estatus</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 font-black text-xs shadow-inner uppercase">
                        {user.username.substring(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-200">{user.fullName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">@{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={14} className={user.role === 'Administrador' ? 'text-blue-500' : 'text-slate-500'} />
                      <span className="text-xs font-medium text-slate-300">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 italic">{user.lastLogin}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                      user.status === 'activo' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      <CircleDot size={10} />
                      {user.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Resetear Clave">
                        <Key size={14} />
                      </button>
                      <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all" title="Editar Perfil">
                        <UserCog size={14} />
                      </button>
                      <button className="p-2 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Eliminar Usuario">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Crear Nueva Cuenta Administrativa"
        maxWidth="max-w-3xl"
      >
        <UserForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
