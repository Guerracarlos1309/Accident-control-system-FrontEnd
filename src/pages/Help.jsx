import { useState } from "react";
import {
  FileText,
  Download,
  HelpCircle,
  BookOpen,
  Mail,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Database,
  Loader2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "../context/NotificationContext";

export default function Help() {
  const { user } = useAuth();
  const api = helpFetch();
  const { showNotification } = useNotification();
  const [downloadingDb, setDownloadingDb] = useState(false);

  const handleDownloadManual = async () => {
    // Detectar si corre dentro de Tauri v2 (app de escritorio)
    const isTauri =
      typeof window !== "undefined" && !!window.__TAURI_INTERNALS__;

    if (isTauri) {
      try {
        showNotification("Abriendo Manual de Usuario...", "info");
        // Tauri v2 inyecta __TAURI_INTERNALS__.invoke globalmente en el WebView
        await window.__TAURI_INTERNALS__.invoke("open_user_manual");
        showNotification("Manual de Usuario abierto correctamente", "success");
      } catch (err) {
        console.error("Error al abrir el manual en Tauri:", err);
        showNotification(`No se pudo abrir el manual: ${err}`, "error");
      }
    } else {
      // Fallback para navegador web (modo desarrollo)
      const link = document.createElement("a");
      link.href = "/Manual de usuario.pdf";
      link.download = "Manual de usuario.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification("Descargando Manual de Usuario...", "success");
    }
  };

  const handleDownloadBackup = async () => {
    setDownloadingDb(true);
    try {
      showNotification("Preparando respaldo de base de datos...", "info");

      // Introducir una pequeña pausa deliberada para mejorar la experiencia de usuario y lectura de notificaciones
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const filename = `backup_sistema_${new Date().toISOString().split("T")[0]}.sqlite`;
      await api.download("/admin/backup-database", filename);

      showNotification("Respaldo descargado exitosamente", "success");
    } catch (error) {
      console.error(error);
      showNotification("Error al intentar descargar el respaldo", "error");
    } finally {
      setDownloadingDb(false);
    }
  };

  const FAQS = [
    {
      q: "¿Cómo registro un nuevo accidente?",
      a: "Dirígete al módulo Seguridad (ASHO) > Control Accidentes y haz clic en el botón 'Nuevo Accidente'.",
    },
    {
      q: "¿Cómo puedo cambiar mi contraseña?",
      a: "Puedes hacerlo desde la página de perfil haciendo clic en el icono de usuario en la esquina superior derecha.",
    },
    {
      q: "¿Quién tiene acceso a los reportes?",
      a: "Solo los usuarios con rol de 'Administrador' o 'Analista' pueden visualizar el centro de reportes consolidados.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-txt-main tracking-tight flex items-center gap-3 uppercase">
            <HelpCircle className="text-corpoelec-blue" size={28} />
            Centro de Ayuda y Soporte
          </h2>
          <p className="text-txt-muted mt-1 text-[11px] font-medium uppercase tracking-widest">
            Recursos de aprendizaje y contacto técnico.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Resources */}
        <div className="lg:col-span-2 space-y-8">
          {/* Manual Section */}
          <div className="glass-panel p-10 rounded-[2.5rem] border border-border-main/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-corpoelec-blue/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-transform group-hover:scale-125" />

            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-corpoelec-blue/10 rounded-2xl flex items-center justify-center text-corpoelec-blue shadow-inner">
                <BookOpen size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-txt-main tracking-tight uppercase">
                  Manual de Usuario
                </h3>
                <p className="text-txt-muted text-sm leading-relaxed max-w-lg">
                  Guía completa de uso del sistema de control de accidentes e
                  inspecciones. Incluye capturas de pantalla, pasos detallados
                  para el registro y solución a problemas comunes.
                </p>
              </div>
              <button
                onClick={handleDownloadManual}
                className="btn-primary min-w-[280px]"
              >
                <Download size={18} />
                <span>Descargar Manual (PDF)</span>
              </button>
            </div>
          </div>

          {/* Database Backup Section (Admin Only) */}
          {user?.role === "Administrador" && (
            <div className="glass-panel p-10 rounded-[2.5rem] border border-border-main/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl transition-transform group-hover:scale-125" />

              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner">
                  <Database size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-txt-main tracking-tight uppercase">
                    Respaldo de Base de Datos
                  </h3>
                  <p className="text-txt-muted text-sm leading-relaxed max-w-lg">
                    Herramienta de administración para descargar una copia de
                    seguridad completa de la base de datos del sistema (SQLite).
                    Mantenga sus datos seguros exportándolos regularmente.
                  </p>
                </div>
                <button
                  onClick={handleDownloadBackup}
                  disabled={downloadingDb}
                  className="btn-primary min-w-[280px] bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/10"
                >
                  {downloadingDb ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                  <span>
                    {downloadingDb
                      ? "Generando Respaldo..."
                      : "Descargar Respaldo"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-black text-txt-muted uppercase tracking-[0.3em] ml-4">
              Preguntas Frecuentes
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-3xl border border-border-main/30 hover:border-corpoelec-blue/30 transition-all transition-duration-300"
                >
                  <div className="flex gap-4">
                    <div className="mt-1 text-corpoelec-blue">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-txt-main">{faq.q}</p>
                      <p className="text-sm text-txt-muted leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Contact Support */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-[2rem] border border-border-main/50 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border-main/50">
              <MessageSquare className="text-corpoelec-blue" size={20} />
              <h4 className="text-[11px] font-black text-txt-main uppercase tracking-widest">
                Soporte Técnico
              </h4>
            </div>

            <p className="text-xs text-txt-muted leading-relaxed font-medium">
              Si experimentas errores técnicos, lentitud o necesitas restablecer
              tu acceso, contacta con la División de Informática.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-bg-main/5 rounded-2xl border border-border-main/30 group hover:border-corpoelec-blue/30 transition-colors">
                <Mail
                  className="text-txt-muted group-hover:text-corpoelec-blue"
                  size={18}
                />
                <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1">
                    Email Interno
                  </p>
                  <p className="text-xs font-bold text-txt-main">
                    soporte.asho@corpoelec.gob.ve
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-bg-main/5 rounded-2xl border border-border-main/30 group hover:border-corpoelec-blue/30 transition-colors">
                <div className="w-[18px] h-[18px] flex items-center justify-center">
                  <ShieldCheck
                    size={18}
                    className="text-txt-muted group-hover:text-corpoelec-blue"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1">
                    Extensión Interna
                  </p>
                  <p className="text-xs font-bold text-txt-main">2245 / 2246</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="p-4 bg-corpoelec-blue/5 border border-corpoelec-blue/10 rounded-2xl space-y-2">
                <p className="text-[9px] font-black text-corpoelec-blue uppercase tracking-[0.2em] flex items-center gap-2">
                  <FileText size={12} /> Versión del Sistema
                </p>
                <p className="text-xs font-bold text-txt-sub">
                  Corpoelec ASHO v2.5.0
                </p>
                <p className="text-[9px] text-txt-muted font-black uppercase tracking-widest">
                  Fecha de Actualización: 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
