import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }) {
  // Manejo de la tecla Esc para cerrar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // Prevenir scroll de fondo
    }
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-none">
      {/* Backdrop con blur profundo */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Contenedor Modal con Flex-Col y Max-Height definida */}
      <div className={`
        relative w-full ${maxWidth} 
        glass-panel bg-slate-900 border border-slate-700/60 rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.8)] 
        flex flex-col 
        animate-in fade-in zoom-in-95 duration-300 
        max-h-[90vh] overflow-hidden pointer-events-auto
      `}>
        
        {/* Cabecera (Sólida y fija en el tope del flex) */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-800 bg-slate-900 shrink-0 select-none">
          <h3 className="text-lg md:text-xl font-bold text-slate-100 line-clamp-1">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Cuerpo del modal (Única área scrolleable) */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="p-4 md:p-8">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
