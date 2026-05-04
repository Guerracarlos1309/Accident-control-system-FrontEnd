import { useState, useEffect } from "react";
import { helpFetch } from "../helpers/helpFetch";

/**
 * GeographicCascade - Reusable 3-level select fetching data from the database.
 */
export default function GeographicCascade({ 
  value = { stateId: "", cityId: "", parish: "" }, 
  onChange,
  required = false 
}) {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [parishes, setParishes] = useState([]);
  
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingParishes, setLoadingParishes] = useState(false);

  const api = helpFetch();

  // Load States on mount
  useEffect(() => {
    const fetchStates = async () => {
      setLoadingStates(true);
      try {
        const res = await api.get("states");
        if (Array.isArray(res)) setStates(res);
      } catch (error) {
        console.error("Error fetching states", error);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  // Load Cities when stateId changes
  useEffect(() => {
    if (!value.stateId) {
      setCities([]);
      return;
    }
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await api.get(`states/${value.stateId}/cities`);
        if (Array.isArray(res)) setCities(res);
      } catch (error) {
        console.error("Error fetching cities", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [value.stateId]);

  // Load Parishes when cityId changes
  useEffect(() => {
    if (!value.cityId) {
      setParishes([]);
      return;
    }
    const fetchParishes = async () => {
      setLoadingParishes(true);
      try {
        const res = await api.get(`cities/${value.cityId}/parishes`);
        if (Array.isArray(res)) setParishes(res);
      } catch (error) {
        console.error("Error fetching parishes", error);
      } finally {
        setLoadingParishes(false);
      }
    };
    fetchParishes();
  }, [value.cityId]);

  const handleSelectChange = (e) => {
    const { name, value: newValue } = e.target;
    let updatedLocation = { ...value };

    if (name === "stateId") {
      updatedLocation = { stateId: newValue, cityId: "", parish: "" };
    } else if (name === "cityId") {
      updatedLocation = { ...value, cityId: newValue, parish: "" };
    } else {
      updatedLocation = { ...value, parish: newValue };
    }

    // Find names for metadata
    const stateObj = states.find(s => s.id == updatedLocation.stateId);
    const cityObj = cities.find(c => c.id == updatedLocation.cityId);
    const parishObj = parishes.find(p => p.id == updatedLocation.parish);
    
    const metadata = {
      ...updatedLocation,
      stateName: stateObj?.name || "",
      cityName: cityObj?.name || "",
      parishName: parishObj?.name || "",
      fullText: `${parishObj?.name ? parishObj.name + ", " : ""}${cityObj?.name ? cityObj.name + ", " : ""}${stateObj?.name || ""}`.replace(/, $/, "")
    };

    onChange(metadata);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {/* Estado */}
      <div className="space-y-1">
        <label className="text-[11px] font-black text-txt-muted uppercase tracking-[0.15em] ml-1">Estado {required && "*"}</label>
        <select 
          name="stateId" 
          value={value.stateId} 
          onChange={handleSelectChange}
          required={required}
          className="input-field h-12 text-sm font-bold"
        >
          <option value="">{loadingStates ? "Cargando..." : "Seleccione..."}</option>
          {states.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Ciudad */}
      <div className="space-y-1">
        <label className={`text-[11px] font-black uppercase tracking-[0.15em] ml-1 ${!value.stateId ? 'text-txt-muted/30' : 'text-txt-muted'}`}>
          Ciudad {required && "*"}
        </label>
        <select 
          name="cityId" 
          disabled={!value.stateId || loadingCities}
          value={value.cityId} 
          onChange={handleSelectChange}
          required={required}
          className={`input-field h-12 text-sm font-bold ${!value.stateId ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
        >
          <option value="">{loadingCities ? "Cargando..." : "Seleccione..."}</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
        </select>
      </div>

      {/* Parroquia / Localidad */}
      <div className="space-y-1">
        <label className={`text-[11px] font-black uppercase tracking-[0.15em] ml-1 ${!value.cityId ? 'text-txt-muted/30' : 'text-txt-muted'}`}>
          Parroquia {required && "*"}
        </label>
        <select 
          name="parish" 
          disabled={!value.cityId || loadingParishes}
          value={value.parish} 
          onChange={handleSelectChange}
          required={required}
          className={`input-field h-12 text-sm font-bold ${!value.cityId ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
        >
          <option value="">{loadingParishes ? "Cargando..." : "Seleccione..."}</option>
          {parishes.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
        </select>
      </div>
    </div>
  );
}
