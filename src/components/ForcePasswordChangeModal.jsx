import { useState } from "react";
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
} from "lucide-react";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";

/**
 * ForcePasswordChangeModal
 * Shown when user.mustChangePassword === true after login.
 * Blocks the app until the user sets a new password.
 * Cannot be dismissed.
 */
export default function ForcePasswordChangeModal({ onSuccess }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const api = helpFetch();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.trim().length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/users/me/change-password", {
        body: { newPassword },
      });

      if (res && !res.err) {
        showNotification("¡Contraseña actualizada correctamente!", "success");
        onSuccess();
      } else {
        setError(res?.message || "Error al actualizar la contraseña.");
      }
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Full-screen overlay — non-dismissable */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Card */}
        <div className="bg-bg-surface border border-border-main rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent stripe */}
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} className="text-amber-500 " />
            </div>
            <div>
              <h2 className="text-xl font-black text-txt-main tracking-tight uppercase">
                Cambio de Contraseña Requerido
              </h2>
              <p className="text-txt-muted text-xs leading-relaxed mt-2 max-w-xs mx-auto">
                El administrador ha restablecido tu contraseña. Debes establecer
                una nueva contraseña antes de continuar.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-1.5">
                <KeyRound size={11} /> Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Mínimo 4 caracteres"
                  className="input-field pl-10 pr-10 h-12 w-full"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main transition-colors p-1"
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-txt-muted uppercase tracking-widest flex items-center gap-1.5">
                <KeyRound size={11} /> Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Repite la contraseña"
                  className="input-field pl-10 pr-10 h-12 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt-main transition-colors p-1"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-corpoelec-red/10 border border-corpoelec-red/20 rounded-xl px-4 py-3">
                <p className="text-corpoelec-red text-xs font-bold">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-12 text-sm font-black uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShieldAlert size={18} />
              )}
              {loading ? "Actualizando..." : "Establecer Nueva Contraseña"}
            </button>

            <p className="text-center text-[9px] text-txt-muted uppercase tracking-widest">
              No puedes acceder al sistema hasta completar este paso.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
