import { 
  Car, 
  Palette, 
  Calendar, 
  Settings, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function VehicleDetails({ data }) {
  if (!data) return <div className="p-8 text-center text-txt-muted font-bold text-sm">Cargando información...</div>;

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-bg-main/5 transition-colors group">
      <div className="p-2.5 bg-bg-surface rounded-xl border border-border-main/50 text-txt-muted group-hover:text-corpoelec-blue group-hover:border-corpoelec-blue/30 transition-all">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-txt-muted mb-1">{label}</p>
        <p className="text-sm font-bold text-txt-main leading-tight">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border-main">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 glass-panel rounded-3xl border border-corpoelec-blue/20 bg-gradient-to-br from-corpoelec-blue/5 to-transparent">
        <div className="h-24 w-24 rounded-2xl bg-corpoelec-blue/10 border border-corpoelec-blue/20 flex items-center justify-center text-corpoelec-blue overflow-hidden shrink-0">
          {data.images && data.images.length > 0 ? (
            <img src={`http://localhost:3000${data.images[0].imageUrl}`} alt="Vehículo Principal" className="w-full h-full object-cover" />
          ) : (
            <Car size={48} />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-txt-main leading-tight">{data.plate}</h2>
          <p className="text-xs font-black uppercase tracking-widest text-txt-muted mt-1">
            {data.model?.brand?.name} {data.model?.name}
          </p>
          <div className="flex gap-2 mt-3">
             <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter bg-corpoelec-blue/10 text-corpoelec-blue border border-corpoelec-blue/20">
               {data.type?.name || "Vehículo General"}
             </span>
          </div>
        </div>
      </div>

      {/* Identificación Técnica */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-1 bg-corpoelec-blue rounded-full shadow-[0_0_8px_rgba(0,103,177,0.3)]"></div>
          <Settings size={16} className="text-corpoelec-blue" />
          <h3 className="text-xs font-black uppercase tracking-widest text-txt-main">Especificaciones</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-bg-main/5 p-2 rounded-3xl border border-border-main/30 shadow-inner">
          <DetailItem icon={Car} label="Placa / Serial" value={data.plate} />
          <DetailItem icon={Calendar} label="Año de Fabricación" value={data.year} />
          <DetailItem icon={Palette} label="Color Predominante" value={data.color} />
          <DetailItem icon={Settings} label="Clasificación" value={data.type?.name} />
        </div>
      </div>

      {/* Galería de Imágenes */}
      {data.images && data.images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-1 bg-corpoelec-blue rounded-full shadow-[0_0_8px_rgba(0,103,177,0.3)]"></div>
            <ImageIcon size={16} className="text-corpoelec-blue" />
            <h3 className="text-xs font-black uppercase tracking-widest text-txt-main">Galería de Unidad ({data.images.length})</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-bg-main/5 border border-border-main/30">
            {data.images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden border border-border-main hover:border-corpoelec-blue transition-colors group cursor-pointer">
                <img src={`http://localhost:3000${img.imageUrl}`} alt="Vehículo Detalle" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
