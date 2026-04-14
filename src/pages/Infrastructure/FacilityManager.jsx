import { useState } from "react";
import { 
  Plus, 
  Search, 
  Building2, 
  MapPin, 
  Zap, 
  Globe, 
  Layers,
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import Modal from "../../components/Modal";
import FacilityForm from "./FacilityForm";

const MOCK_FACILITIES = [
  { 
    id: 1, 
    name: "Subestación Punto Fijo IV", 
    state: "Falcón",
    city: "Punto Fijo",
    parish: "Carirubana",
    coordinates: "11.6992, -70.1833", 
    typeId: "1", 
    type: "Subestación (S/E)", 
    voltage: "115 kV",
    status: "Activa"
  },
  { 
    id: 2, 
    name: "Planta Termoeléctrica Josefa Camejo", 
    state: "Falcón",
    city: "Punto Fijo",
    parish: "Los Taques",
    coordinates: "11.7512, -70.1554", 
    typeId: "2", 
    type: "Planta Generadora", 
    voltage: "230 kV",
    status: "Activa"
  },
  { 
    id: 3, 
    name: "Centro de Distribución Coro", 
    state: "Falcón",
    city: "Coro",
    parish: "Miranda",
    coordinates: "11.4083, -69.6775", 
    typeId: "4", 
    type: "Centro de Distribución", 
    voltage: "13.8 kV",
    status: "Activa"
  },
];

export default function FacilityManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFacilities = MOCK_FACILITIES.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
             <Building2 className="text-blue-500" />
             Catálogo de Sedes e Infraestructura
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Registro técnico de plantas, subestaciones y oficinas administrativas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} />
          <span>Nueva Sede</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por nombre, tipo o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10 h-11"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {filteredFacilities.map(facility => (
          <div key={facility.id} className="glass-panel rounded-3xl p-6 border border-slate-800/50 hover:border-blue-500/30 transition-all group relative overflow-hidden">
            {/* Background Icon Decoration */}
            <div className="absolute -right-4 -bottom-4 text-slate-900 group-hover:text-blue-500/5 transition-all duration-500 rotate-12">
               <Building2 size={120} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase tracking-widest leading-none">
                    {facility.type}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{facility.status}</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-black text-white leading-tight mb-4 group-hover:text-blue-400 transition-colors">
                {facility.name}
              </h3>

              <div className="space-y-4">
                {/* Geo Hierarchy */}
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-slate-500"><MapPin size={14} /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">Jurisdicción</span>
                    <span className="text-xs text-slate-300 font-semibold lowercase first-letter:uppercase"> 
                      {facility.city}, {facility.parish}
                    </span>
                    <span className="text-[10px] text-slate-500">Estado {facility.state}</span>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Zap size={12} className="text-amber-500" />
                       <span className="text-[9px] font-bold uppercase tracking-widest">Tensión</span>
                    </div>
                    <span className="text-sm font-black text-slate-200">{facility.voltage}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-500">
                       <Globe size={12} className="text-blue-400" />
                       <span className="text-[9px] font-bold uppercase tracking-widest">Coordenadas</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 truncate">{facility.coordinates}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 pt-2">
                <button className="flex-1 h-10 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  <ExternalLink size={14} /> Ver Ficha Full
                </button>
                <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center">
                  <ShieldCheck size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registro Técnico de Instalación"
        maxWidth="max-w-3xl"
      >
        <FacilityForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
