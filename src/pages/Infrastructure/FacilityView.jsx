import {
  Building2,
  MapPin,
  Zap,
  Globe,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { useState } from "react";

export default function FacilityView({ facility }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!facility) return null;

  const nextImage = () => {
    if (facility.images && facility.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % facility.images.length);
    }
  };

  const prevImage = () => {
    if (facility.images && facility.images.length > 0) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + facility.images.length) % facility.images.length,
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Section: Hero Image and Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery Section */}
        <div className="space-y-4">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-bg-main border border-border-main group shadow-2xl">
            {facility.images && facility.images.length > 0 ? (
              <>
                <img
                  src={`${window.BACKEND_URL || "http://localhost:3000"}${facility.images[currentImageIndex].imageUrl}`}
                  alt={facility.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {facility.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-black/20 backdrop-blur-md text-white border border-white/10 hover:bg-black/40 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight size={24} />
                    </button>

                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                      {facility.images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? "w-6 bg-corpoelec-blue" : "w-1.5 bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <div className="absolute top-6 right-6 flex gap-2">
                  <div className="px-4 py-2 rounded-2xl bg-black/20 backdrop-blur-md text-white border border-white/10 text-[10px] font-black uppercase tracking-widest">
                    {currentImageIndex + 1} / {facility.images.length}
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-txt-muted/20 gap-4">
                <Building2 size={120} strokeWidth={1} />
                <p className="text-xs font-black uppercase tracking-widest text-txt-muted/50">
                  Sin registros fotográficos
                </p>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {facility.images && facility.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {facility.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${idx === currentImageIndex ? "border-corpoelec-blue scale-95 shadow-lg" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img
                    src={`${window.BACKEND_URL || "http://localhost:3000"}${img.imageUrl}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Core Technical Info */}
        <div className="flex flex-col justify-center space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 rounded-full bg-corpoelec-blue/10 text-corpoelec-blue text-[10px] font-black uppercase tracking-widest border border-corpoelec-blue/20">
                {facility.installationType?.name || "TIPO NO DEFINIDO"}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)] animate-pulse" />
                <span className="text-[10px] font-black text-txt-muted uppercase tracking-widest">
                  Estado: Operativo
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-black text-txt-main tracking-tighter leading-none mb-4">
              {facility.name}
            </h1>
            <p className="text-txt-muted text-sm font-medium leading-relaxed max-w-md">
              Ficha técnica detallada de la instalación de infraestructura
              eléctrica y administrativa del sistema CORPOELEC.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="glass-panel p-4 rounded-3xl border-border-main/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-inner">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-0.5">
                  Tensión
                </p>
                <p className="text-xl font-black text-txt-main leading-none">
                  {facility.voltageLevel || "N/A"}
                </p>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-3xl border-border-main/40 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-corpoelec-blue/10 text-corpoelec-blue flex items-center justify-center shadow-inner">
                <Globe size={24} />
              </div>
              <div>
                <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-0.5">
                  Ubicación GPS
                </p>
                <p className="text-[11px] font-mono font-bold text-txt-sub truncate max-w-[100px]">
                  {facility.coordinates || "No disp."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-bg-main border border-border-main/50 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-corpoelec-red mt-1 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-txt-muted uppercase tracking-[0.2em] mb-1">
                  Dirección Política
                </p>
                <p className="text-sm font-bold text-txt-main">
                  {facility.location?.parish?.name},{" "}
                  {facility.location?.parish?.city?.name}
                </p>
                <p className="text-xs text-txt-muted font-medium mt-1">
                  Estado{" "}
                  {facility.location?.parish?.city?.state?.name || "Táchira"} —
                  Región Los Andes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: More details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border-main/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-bg-surface border border-border-main flex items-center justify-center text-txt-muted">
            <ShieldCheck size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black text-txt-muted uppercase tracking-widest mb-0.5">
              Nivel de Seguridad
            </p>
            <p className="text-xs font-bold text-emerald-500 uppercase">
              Perímetro Resguardado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
