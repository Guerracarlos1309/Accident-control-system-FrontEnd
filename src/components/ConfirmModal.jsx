import React from "react";
import { AlertTriangle, X } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirmar Acción", 
  message = "¿Está seguro de realizar esta acción?", 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  variant = "danger" // danger | warning | info
}) {
  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700 shadow-red-600/20 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20 text-white",
    info: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 text-white"
  };

  const iconStyles = {
    danger: "text-red-500 bg-red-500/10",
    warning: "text-amber-500 bg-amber-500/10",
    info: "text-blue-500 bg-blue-500/10"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${iconStyles[variant]}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white leading-tight">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95 ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
