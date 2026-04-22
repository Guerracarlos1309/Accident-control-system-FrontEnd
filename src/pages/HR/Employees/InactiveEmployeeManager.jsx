import MasterEntityManager from "../../../components/MasterEntityManager";
import EmployeeForm from "./EmployeeForm";
import EmployeeDetails from "./EmployeeDetails";

export default function InactiveEmployeeManager() {
  return (
    <MasterEntityManager 
      title="Personal Inactivo / Histórico" 
      description="Historial del personal desactivado. Aquí puede reactivar empleados o eliminarlos permanentemente."
      entityName="Empleado" 
      apiPath="/employees?status=0" 
      idField="personalNumber"
      deleteMode="hard"
      allowReactivate={true}
      FormComponent={EmployeeForm}
      ViewComponent={EmployeeDetails}
      fields={[
        { name: "personalNumber", label: "N° Personal" },
        { name: "firstName", label: "Nombre" },
        { name: "lastName", label: "Apellido" },
        { name: "idCard", label: "Cédula" }
      ]}
    />
  );
}
