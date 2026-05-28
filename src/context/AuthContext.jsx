import React, { createContext, useContext, useState, useEffect } from "react";
import { helpFetch } from "../helpers/helpFetch";
import { useNotification } from "./NotificationContext";

const AuthContext = createContext();

const normalizeUserRole = (userObj) => {
  if (!userObj || !userObj.role) return userObj;
  
  const roleUpper = userObj.role.toUpperCase();
  let normalizedRole = userObj.role;
  
  if (roleUpper === "ADMINISTRADOR") {
    normalizedRole = "Administrador";
  } else if (roleUpper === "INSPECTOR") {
    normalizedRole = "Inspector";
  } else if (roleUpper === "ANALISTA") {
    normalizedRole = "Analista";
  }
  
  return { ...userObj, role: normalizedRole };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = helpFetch();
  const { showNotification } = useNotification();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const res = await api.get("/auth/me");
          if (!res.err) {
            setUser(normalizeUserRole(res));
          } else {
            sessionStorage.removeItem("token");
          }
        } catch (error) {
          sessionStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password, showUiNotification = true) => {
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const res = await api.post("/auth/login", { body: { username: normalizedUsername, password } });

      // Si la respuesta es exitosa (contiene el token y success: true)
      if (res && res.success) {
        sessionStorage.setItem("token", res.token);
        setUser(normalizeUserRole(res.user));
        showNotification(`¡Bienvenido de nuevo, ${res.user.firstName || res.user.username}!`, "success");
        return { success: true };
      } 
      
      // Si hay un error capturado por helpFetch (err: true) o mensaje de error
      const errorMsg = res.statusText || res.message || "Error al iniciar sesión";
      if (showUiNotification) {
        showNotification(errorMsg, "error");
      }
      return { success: false, message: errorMsg };
      
    } catch (error) {
      if (showUiNotification) {
        showNotification("Error de conexión con el servidor", "error");
      }
      return { success: false, message: "Error de conexión" };
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    showNotification("Sesión cerrada correctamente", "info");
  };

  const updateUser = async (data) => {
    try {
      const res = await api.put("/users/me", { body: data });

      if (res && !res.err) {
        setUser(normalizeUserRole(res));
        showNotification("Perfil actualizado correctamente", "success");
        return { success: true };
      }

      const errorMsg = res.statusText || res.message || "Error al actualizar el perfil";
      showNotification(errorMsg, "error");
      return { success: false, message: errorMsg };
    } catch (error) {
      showNotification("Error de conexión con el servidor", "error");
      return { success: false, message: "Error de conexión" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
