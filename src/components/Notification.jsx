import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Notification = ({ message, type = "info", onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={20} />,
    error: <AlertCircle className="text-rose-400" size={20} />,
    warning: <AlertTriangle className="text-amber-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  const borders = {
    success: "border-emerald-500/20",
    error: "border-rose-500/20",
    warning: "border-amber-500/20",
    info: "border-blue-500/20",
  };

  const backgrounds = {
    success: "bg-emerald-500/10",
    error: "bg-rose-500/10",
    warning: "bg-amber-500/10",
    info: "bg-blue-500/10",
  };

  return (
    <div
      className={`
        pointer-events-auto
        flex items-center gap-3 p-4 rounded-xl border bg-bg-secondary shadow-lg
        transition-opacity duration-200
        ${isExiting ? "opacity-0" : "opacity-100"}
        ${borders[type]} ${backgrounds[type]}
      `}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-bold text-txt-main">{message}</div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-txt-muted hover:text-txt-main transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;
