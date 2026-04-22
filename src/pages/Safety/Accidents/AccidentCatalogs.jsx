import MasterEntityManager from "../../../components/MasterEntityManager";

export default function AccidentCatalogs() {
  return (
    <div className="space-y-8">
      <MasterEntityManager title="Tipos de Incidente" entityName="Tipo" />
      <MasterEntityManager title="Causas Raíz" entityName="Causa" />
    </div>
  );
}
