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
        flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl
        transition-all duration-300 transform
        ${isExiting ? "opacity-0 translate-x-10" : "opacity-100 translate-x-0 animate-in slide-in-from-right-full"}
        ${borders[type]} ${backgrounds[type]}
      `}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium text-slate-200">{message}</div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;
