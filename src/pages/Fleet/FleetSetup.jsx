import { useState, useEffect, useMemo } from "react";
import MasterEntityManager from "../../components/MasterEntityManager";
import { helpFetch } from "../../helpers/helpFetch";
import { Loader2 } from "lucide-react";

export default function FleetSetup() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = helpFetch();

  const fetchBrands = async () => {
    const res = await api.get("/lookups/brands");
    if (res && !res.err) {
      setBrands(res);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const brandOptions = useMemo(() => 
    brands.map(b => ({ value: b.id, label: b.name })), 
    [brands]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
        <p className="text-slate-500 animate-pulse">Cargando dependencias de flota...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <section>
        <MasterEntityManager 
          title="Marcas de Vehículos" 
          entityName="Marca" 
          apiPath="/lookups/brands"
          onSuccess={fetchBrands} // Refresh local brands when one is added
        />
      </section>

      <section className="pt-8 border-t border-slate-800/50">
        <MasterEntityManager 
          title="Modelos y Versiones" 
          entityName="Modelo" 
          apiPath="/lookups/models"
          fields={[
            { name: "name", label: "Nombre del Modelo", type: "text", required: true },
            { 
              name: "brandId", 
              label: "Marca Fabricante", 
              type: "select", 
              required: true,
              options: brandOptions,
              displayKey: "brand" // This tells the manager to look for the 'brand' object for display
            },
            { name: "description", label: "Especificaciones Técnicas", type: "textarea" }
          ]}
        />
      </section>
    </div>
  );
}
