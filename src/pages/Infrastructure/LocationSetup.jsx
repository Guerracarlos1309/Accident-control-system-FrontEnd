import { useState, useEffect } from "react";
import MasterEntityManager from "../../components/MasterEntityManager";
import { Map, MapPin, Navigation, Filter, Globe } from "lucide-react";
import { helpFetch } from "../../helpers/helpFetch";

export default function LocationSetup() {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState("");
  const api = helpFetch();

  const refreshParents = async () => {
    try {
      const [sRes, cRes] = await Promise.all([
        api.get("states"),
        api.get("cities"),
      ]);
      if (Array.isArray(sRes)) setStates(sRes);
      if (Array.isArray(cRes)) setCities(cRes);
    } catch (error) {
      console.error("Error refreshing parents", error);
    }
  };

  useEffect(() => {
    refreshParents();
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-corpoelec-blue/10 text-corpoelec-blue rounded-2xl">
            <Globe size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-txt-main tracking-tight uppercase">
              Explorador Geográfico
            </h1>
            <p className="text-txt-muted text-sm font-bold uppercase tracking-widest mt-1">
              Organización jerárquica del territorio nacional
            </p>
          </div>
        </div>

        {/* FILTRO GLOBAL POR ESTADO */}
        <div className="w-full md:w-auto min-w-[300px]">
          <div className="glass-panel p-4 rounded-2xl border border-corpoelec-blue/30 bg-corpoelec-blue/5 flex items-center gap-3">
            <Filter size={20} className="text-corpoelec-blue" />
            <div className="flex-1">
              <p className="text-[9px] font-black text-corpoelec-blue uppercase tracking-widest mb-1">Filtrar Todo por Estado</p>
              <select 
                value={selectedStateId} 
                onChange={(e) => setSelectedStateId(e.target.value)}
                className="w-full bg-transparent text-sm font-black text-txt-main focus:outline-none cursor-pointer"
              >
                <option value="" className="text-txt-muted bg-bg-surface">TODOS LOS ESTADOS</option>
                {states.map(s => (
                  <option key={s.id} value={s.id} className="text-txt-main bg-bg-surface">{s.name.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* ESTADOS (Solo se muestra si no hay filtro o para gestión general) */}
        {!selectedStateId && (
          <div className="glass-panel p-8 rounded-[2rem] border border-border-main/50 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            <MasterEntityManager
              title="Estados"
              description="Gestión de las entidades federales principales."
              entityName="Estado"
              apiPath="states"
              onSuccess={refreshParents}
              fields={[
                {
                  name: "name",
                  label: "Nombre del Estado",
                  type: "text",
                  required: true,
                },
              ]}
            />
          </div>
        )}

        {/* CIUDADES / MUNICIPIOS */}
        <div className="glass-panel p-8 rounded-[2rem] border border-border-main/50 relative overflow-hidden">
          <MasterEntityManager
            title={selectedStateId ? `Ciudades en ${states.find(s => s.id == selectedStateId)?.name}` : "Ciudades / Municipios"}
            description="Relación de ciudades pertenecientes a los estados."
            entityName="Ciudad"
            apiPath={selectedStateId ? `cities?stateId=${selectedStateId}` : "cities"}
            onSuccess={refreshParents}
            fields={[
              {
                name: "name",
                label: "Nombre de la Ciudad",
                type: "text",
                required: true,
              },
              {
                name: "stateId",
                label: "Estado Perteneciente",
                type: "select",
                required: true,
                displayKey: "state",
                options: states.map((s) => ({ value: s.id, label: s.name })),
              },
            ]}
          />
        </div>

        {/* PARROQUIAS */}
        <div className="glass-panel p-8 rounded-[2rem] border border-border-main/50 relative overflow-hidden">
          <MasterEntityManager
            title={selectedStateId ? `Parroquias en ${states.find(s => s.id == selectedStateId)?.name}` : "Parroquias / Localidades"}
            description="Nivel de detalle máximo por cada municipio."
            entityName="Parroquia"
            apiPath={selectedStateId ? `parishes?stateId=${selectedStateId}` : "parishes"}
            fields={[
              {
                name: "name",
                label: "Nombre de la Parroquia",
                type: "text",
                required: true,
              },
              {
                name: "cityId",
                label: "Ciudad Perteneciente",
                type: "select",
                required: true,
                displayKey: "city",
                options: cities.map((c) => ({ value: c.id, label: c.name })),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
