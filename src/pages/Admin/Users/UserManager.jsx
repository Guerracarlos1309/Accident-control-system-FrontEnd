import { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserPlus,
  UserCog,
  ShieldCheck,
  CircleDot,
  Trash2,
  Lock,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Modal from "../../../components/Modal";
import UserForm from "./UserForm";
import { helpFetch } from "../../../helpers/helpFetch";
import { useNotification } from "../../../context/NotificationContext";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });

  const api = helpFetch();
  const { showNotification } = useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      if (res && !res.err && Array.isArray(res)) {
        setUsers(res);
      } else {
        showNotification("Error al obtener usuarios", "error");
        setUsers([]);
      }
    } catch (err) {
      showNotification("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async () => {
    const userId = deleteModal.user?.id;
    if (!userId) return;

    try {
      const res = await api.del(`users/${userId}`);
      if (res && !res.err) {
        showNotification("Usuario eliminado correctamente", "success");
        fetchUsers();
        setDeleteModal({ isOpen: false, user: null });
      } else {
        showNotification(res.message || "Error al eliminar usuario", "error");
      }
    } catch (err) {
      showNotification("Error de conexión", "error");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.role?.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
            <Users className="text-corpoelec-blue" size={28} />
            Gestión de Usuarios
          </h2>
          <p className="text-txt-muted mt-1 text-[11px] font-medium uppercase tracking-widest">
            Administración central de credenciales y roles.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn-primary">
          <UserPlus size={18} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-muted group-focus-within:text-corpoelec-blue transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por usuario o rol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 h-12"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 size={48} className="text-corpoelec-blue animate-spin" />
          <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.3em]">
            Sincronizando base de datos...
          </p>
        </div>
      ) : (
        <div className="glass-panel overflow-hidden border border-border-main/50 rounded-[2rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main/5 text-[10px] font-black uppercase text-txt-muted tracking-[0.2em] border-b border-border-main">
                  <th className="px-8 py-5">Identificador de Acceso</th>
                  <th className="px-8 py-5">Nivel de Permisos</th>
                  <th className="px-8 py-5">Última Actividad</th>
                  <th className="px-8 py-5 text-right">Gestión</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/20">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-bg-main/5 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-bg-surface border border-border-main flex items-center justify-center text-corpoelec-blue font-black text-xs shadow-sm shadow-black/5 uppercase">
                            {user.username.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-txt-main tracking-tight">
                              {user.username}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-txt-sub">
                            {user.role?.name || "Sin Rol"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-xs text-txt-muted font-medium italic">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleString()
                            : "Nunca ha ingresado"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2.5 text-txt-muted hover:text-corpoelec-blue hover:bg-corpoelec-blue/10 rounded-xl transition-all"
                            title="Editar Cuenta"
                          >
                            <UserCog size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({ isOpen: true, user })
                            }
                            className="p-2.5 text-txt-muted/50 hover:text-corpoelec-red hover:bg-corpoelec-red/10 rounded-xl transition-all"
                            title="Eliminar Acceso"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-20 text-center text-txt-muted font-black uppercase tracking-widest text-[10px]"
                    >
                      No se encontraron cuentas configuradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingUser
            ? "Editar Configuración de Usuario"
            : "Configurar Nueva Cuenta Administradora"
        }
        maxWidth="max-w-4xl"
      >
        <UserForm
          data={editingUser}
          onCancel={() => setIsModalOpen(false)}
          onSubmitSuccess={() => {
            setIsModalOpen(false);
            fetchUsers();
          }}
        />
      </Modal>

      {/* Modal Confirmación Borrado */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        title="Confirmar Eliminación"
        maxWidth="max-w-md"
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-16 h-16 bg-corpoelec-red/10 rounded-full flex items-center justify-center mx-auto text-corpoelec-red">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <p className="text-txt-main font-bold text-lg">
              ¿Está totalmente seguro?
            </p>
            <p className="text-txt-muted text-sm leading-relaxed">
              Esta acción revocará el acceso de{" "}
              <span className="font-black text-txt-main">
                {deleteModal.user?.username}
              </span>{" "}
              permanentemente. No se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setDeleteModal({ isOpen: false, user: null })}
              className="flex-1 px-4 py-3 text-xs font-black uppercase tracking-widest text-txt-muted hover:text-txt-main bg-bg-main/5 rounded-2xl transition-colors"
            >
              Mantener
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-corpoelec-red hover:bg-corpoelec-red-dark text-white text-xs font-black uppercase tracking-widest py-3 rounded-2xl transition-all shadow-lg shadow-corpoelec-red/20"
            >
              Eliminar Acceso
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
