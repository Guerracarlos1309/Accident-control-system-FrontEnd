import { useState, useEffect } from "react";
import { VENEZUELA_DATA } from "../data/venezuela";

/**
 * GeographicCascade - Reusable 3-level select for Venezuelan states, cities, and parishes.
 */
export default function GeographicCascade({ 
  value = { stateId: "", cityId: "", parish: "" }, 
  onChange,
  required = false 
}) {
  const [internalLocation, setInternalLocation] = useState(value);

  // Sync internal state with props
  useEffect(() => {
    setInternalLocation(value);
  }, [value.stateId, value.cityId, value.parish]);

  const handleSelectChange = (e) => {
    const { name, value: newValue } = e.target;
    let updatedLocation = { ...internalLocation };

    if (name === "stateId") {
      updatedLocation = { stateId: newValue, cityId: "", parish: "" };
    } else if (name === "cityId") {
      updatedLocation = { ...internalLocation, cityId: newValue, parish: "" };
    } else {
      updatedLocation = { ...internalLocation, parish: newValue };
    }

    // Prepare metadata for the parent
    const stateObj = VENEZUELA_DATA.find(s => s.id === updatedLocation.stateId);
    const cityObj = stateObj?.cities.find(c => c.id === updatedLocation.cityId);
    
    const metadata = {
      ...updatedLocation,
      stateName: stateObj?.name || "",
      cityName: cityObj?.name || "",
      parishName: updatedLocation.parish || "",
      fullText: `${updatedLocation.parish ? updatedLocation.parish + ", " : ""}${cityObj?.name ? cityObj.name + ", " : ""}${stateObj?.name || ""}`.replace(/, $/, "")
    };

    setInternalLocation(updatedLocation);
    onChange(metadata);
  };

  const currentState = VENEZUELA_DATA.find(s => s.id === internalLocation.stateId);
  const currentCities = currentState?.cities || [];
  const currentCity = currentCities.find(c => c.id === internalLocation.cityId);
  const currentParishes = currentCity?.parishes || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {/* Estado */}
      <div className="space-y-1">
        <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Estado {required && "*"}</label>
        <select 
          name="stateId" 
          value={internalLocation.stateId} 
          onChange={handleSelectChange}
          required={required}
          className="input-field h-12 text-sm font-bold"
        >
          <option value="">Seleccione...</option>
          {VENEZUELA_DATA.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Ciudad */}
      <div className="space-y-1">
        <label className={`text-[11px] font-black uppercase tracking-[0.15em] ml-1 ${!internalLocation.stateId ? 'text-txt-muted/30' : 'text-txt-muted'}`}>
          Ciudad {required && "*"}
        </label>
        <select 
          name="cityId" 
          disabled={!internalLocation.stateId}
          value={internalLocation.cityId} 
          onChange={handleSelectChange}
          required={required}
          className={`input-field h-12 text-sm font-bold ${!internalLocation.stateId ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
        >
          <option value="">Seleccione...</option>
          {currentCities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Parroquia / Localidad */}
      <div className="space-y-1">
        <label className={`text-[11px] font-black uppercase tracking-[0.15em] ml-1 ${!internalLocation.cityId ? 'text-txt-muted/30' : 'text-txt-muted'}`}>
          Parroquia {required && "*"}
        </label>
        <select 
          name="parish" 
          disabled={!internalLocation.cityId}
          value={internalLocation.parish} 
          onChange={handleSelectChange}
          required={required}
          className={`input-field h-12 text-sm font-bold ${!internalLocation.cityId ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
        >
          <option value="">Seleccione...</option>
          {currentParishes.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
}
