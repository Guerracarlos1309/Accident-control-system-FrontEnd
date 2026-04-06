import { useState } from "react";

export default function EmployeeForm({ onCancel }) {
  const [formData, setFormData] = useState({
    personalNumber: "", idCard: "", firstName: "", lastName: "",
    email: "", phone: "", gender: "", birthDate: "",
    maritalStatus: "", dominantHand: "", departmentId: "", 
    jobTitleId: "", occupationId: "", birthPlace: ""
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving employee...", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Identificación */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">N° Personal *</label>
          <input type="text" name="personalNumber" required value={formData.personalNumber} onChange={handleChange} className="input-field" placeholder="Ej: P-123456" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Cédula de Identidad *</label>
          <input type="text" name="idCard" required value={formData.idCard} onChange={handleChange} className="input-field" placeholder="Ej: 12345678" />
        </div>

        {/* Nombres y Apellidos */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Nombres *</label>
          <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Apellidos *</label>
          <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} className="input-field" />
        </div>

        {/* Contacto */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Correo Electrónico *</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Teléfono</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field" />
        </div>

        {/* Datos Personales */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Fecha de Nacimiento</label>
          <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="input-field" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Lugar de Nacimiento</label>
          <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="input-field" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Género</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Mano Dominante</label>
          <select name="dominantHand" value={formData.dominantHand} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione...</option>
            <option value="1">Diestro</option>
            <option value="2">Zurdo</option>
            <option value="3">Ambidiestro</option>
          </select>
        </div>

        {/* Area y Ocupación */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Departamento</label>
          <select name="departmentId" value={formData.departmentId} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione departamento</option>
            <option value="1">Mantenimiento</option>
            <option value="2">Operaciones</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-300">Cargo</label>
          <select name="jobTitleId" value={formData.jobTitleId} onChange={handleChange} className="input-field text-slate-300 [&>option]:bg-slate-800">
            <option value="">Seleccione cargo</option>
            <option value="1">Técnico Electricista</option>
            <option value="2">Ingeniero Supervisor</option>
          </select>
        </div>

      </div>

      <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-transparent hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
        <button type="submit" className="btn-primary py-2 text-sm">Registrar Empleado</button>
      </div>
    </form>
  );
}
