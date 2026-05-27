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
        flex items-start gap-4 p-5 rounded-2xl border shadow-2xl bg-bg-surface
        transition-all duration-200
        ${isExiting ? "opacity-0 scale-95" : "opacity-100 scale-100"}
        ${borders[type]}
      `}
    >
      <div className="flex-shrink-0 p-2 rounded-xl bg-bg-main/5">{icons[type]}</div>
      <div className="flex-1 pt-1 text-sm font-black text-txt-main tracking-tight leading-relaxed">{message}</div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1.5 hover:bg-bg-main/10 rounded-lg text-txt-muted hover:text-txt-main transition-all"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Notification;
