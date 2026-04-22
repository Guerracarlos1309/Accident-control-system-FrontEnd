import MasterEntityManager from "../../components/MasterEntityManager";

export default function HRCatalogs() {
  return (
    <div className="space-y-8">
      <MasterEntityManager 
        title="Gestión de Cargos" 
        entityName="Cargo" 
        apiPath="/lookups/occupations"
      />
      <MasterEntityManager 
        title="Departamentos" 
        entityName="Departamento" 
        apiPath="/lookups/departments"
      />
    </div>
  );
}
