import { useState } from "react";
import {
  Plus,
  Search,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Layers,
  Filter,
  Package,
  Building2,
} from "lucide-react";
import Modal from "../../components/Modal";
import EquipmentForm from "./EquipmentForm";

const MOCK_EQUIPMENT = [
  {
    id: 1,
    name: "Casco Dieléctrico Clase E",
    type: "EPP",
    category: "Craneal",
    unit: "piezas",
    total: 150,
    operative: 142,
    management: "Distribución",
    lastUpdate: "2024-04-10",
  },
  {
    id: 2,
    name: "Guantes Dieléctricos Класс 2",
    type: "EPP",
    category: "Manual",
    unit: "pares",
    total: 40,
    operative: 32,
    management: "Mantenimiento",
    lastUpdate: "2024-04-12",
  },
  {
    id: 3,
    name: "Extintor PQS 10lb",
    type: "EPC",
    category: "Incendio",
    unit: "piezas",
    total: 25,
    operative: 25,
    management: "Seguridad ASHO",
    lastUpdate: "2024-04-14",
  },
];

export default function ProtectionInventory() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos"); // todos | epp | epc

  const filteredEquipment = MOCK_EQUIPMENT.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "todos" || item.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Package className="text-blue-500" />
            Inventario Técnico de Seguridad
          </h2>
          <p className="text-slate-400 mt-1 text-sm">
            Control centralizado de Equipos de Protección Personal (EPP) y
            Colectiva (EPC).
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={18} />
          <span>Nuevo Equipo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Unidades"
          value="215"
          icon={Layers}
          color="text-blue-500"
        />
        <StatCard
          label="Equipos Operativos"
          value="199"
          icon={ShieldCheck}
          color="text-emerald-500"
        />
        <StatCard
          label="Alertas de Stock"
          value="03"
          icon={AlertTriangle}
          color="text-amber-500"
        />
        <StatCard
          label="Próximas Revisiones"
          value="12"
          icon={RefreshCw}
          color="text-purple-500"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-11"
          />
        </div>

        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-full md:w-auto">
          {["todos", "epp", "epc"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all rounded-lg ${
                filterType === type
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800/50 overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
              <th className="px-6 py-4">Equipo / Serial</th>
              <th className="px-6 py-4">Clasificación</th>
              <th className="px-6 py-4">Gerencia</th>
              <th className="px-6 py-4 text-center">Und. Medida</th>
              <th className="px-6 py-4 text-center">Stock</th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredEquipment.map((item) => {
              const operativePercent = (item.operative / item.total) * 100;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      SN: {item.id} - {item.category}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit ${item.type === "EPP" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}
                      >
                        {item.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Building2 size={12} className="text-slate-500" />
                      {item.management}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-medium text-slate-500 italic">
                      {item.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm text-slate-300 font-bold">
                      {item.operative}{" "}
                      <span className="text-[10px] text-slate-600">
                        / {item.total}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${operativePercent === 100 ? "bg-emerald-500" : operativePercent > 80 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${operativePercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registro Técnico de Equipo"
        maxWidth="max-w-3xl"
      >
        <EquipmentForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="glass-panel rounded-2xl p-4 flex items-center gap-4 border border-slate-800/30">
      <div
        className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center ${color} shadow-inner`}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}
