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
      {/* Backdrop con color plano */}
      <div 
        className="absolute inset-0 bg-black/60 transition-opacity duration-200 pointer-events-auto"
        onClick={onClose}
      />
      
      {/* Contenedor Modal */}
      <div className={`
        relative w-full ${maxWidth} 
        bg-bg-surface border border-border-main/50 rounded-[2.5rem] shadow-lg
        flex flex-col 
        max-h-[90vh] overflow-hidden pointer-events-auto
      `}>
        
        {/* Cabecera */}
        <div className="flex justify-between items-center p-6 border-b border-border-main bg-bg-surface shrink-0 select-none">
          <h3 className="text-xl font-black text-txt-main tracking-tighter uppercase">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-txt-muted hover:text-corpoelec-red hover:bg-corpoelec-red/10 transition-all active:scale-95 border border-border-main/50 hover:border-corpoelec-red/20 shadow-sm hover:shadow-md"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>
        
        {/* Cuerpo del modal */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="p-6 md:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
