// Detecta si la app corre en modo desarrollo local (localhost) o en producción (Tauri)
const isDevelopment = import.meta.env.DEV;

let BASE_URL = "http://localhost:3000/api";
let configLoaded = false;

export const loadConfig = async () => {
  if (configLoaded) return;
  try {
    const response = await fetch("/config.json");
    const config = await response.json();
    BASE_URL = `${config.API_URL}/api`;
    configLoaded = true;
    console.log("configuracion cargada", BASE_URL);
  } catch (error) {
    console.error(
      "No se pudo cargar config.json, se usará localhost por defecto",
      error,
    );
  }
};

export const helpFetch = () => {
  const customFetch = async (endpoint, options) => {
    await loadConfig();
    const defaultHeader = {
      accept: "application/json",
      "Content-Type": "application/json",
    };

    const token = sessionStorage.getItem("token");
    if (token) {
      defaultHeader["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    options.signal = controller.signal;

    options.method = options.method || "GET";
    options.headers = options.headers
      ? { ...defaultHeader, ...options.headers }
      : defaultHeader;

    if (options.body) {
      if (options.body instanceof FormData) {
        delete options.headers["Content-Type"];
      } else {
        options.body = JSON.stringify(options.body);
      }
    } else {
      delete options.body;
    }

    setTimeout(() => controller.abort(), 10000);

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${BASE_URL}/${endpoint.replace(/^\//, "")}`;

    return fetch(url, options)
      .then((res) =>
        res.ok
          ? res.json()
          : res.json().then((json) =>
              Promise.reject({
                err: true,
                status: res.status || "00",
                statusText:
                  json.message ||
                  res.statusText ||
                  "Oops, ha ocurrido un error",
              }),
            ),
      )
      .catch((err) => {
        if (err.name === "AbortError") {
          return { err: true, statusText: "La petición ha expirado" };
        }
        return err;
      });
  };

  const get = (url, options = {}) => customFetch(url, options);

  const post = (url, options = {}) => {
    options.method = "POST";
    return customFetch(url, options);
  };

  const put = (url, options = {}) => {
    options.method = "PUT";
    return customFetch(url, options);
  };

  const del = (url, options = {}) => {
    options.method = "DELETE";
    return customFetch(url, options);
  };

  const download = async (endpoint, filename) => {
    await loadConfig();
    const defaultHeader = {};
    const token = sessionStorage.getItem("token");
    if (token) {
      defaultHeader["Authorization"] = `Bearer ${token}`;
    }
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${BASE_URL}/${endpoint.replace(/^\//, "")}`;

    return fetch(url, {
      method: "GET",
      headers: defaultHeader,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al descargar archivo");
        return res.blob();
      })
      .then(async (blob) => {
        // Detectar si está corriendo dentro de Tauri
        const isTauri = typeof window !== "undefined" && !!window.__TAURI__;

        if (isTauri) {
          try {
            // Tauri v1 o Tauri v2 con API global habilitada
            const tauriDialog = window.__TAURI__.dialog;
            const tauriFs = window.__TAURI__.fs;

            if (tauriDialog && tauriFs) {
              const filters = [];
              const ext = filename.split(".").pop();
              if (ext) {
                filters.push({
                  name: ext.toUpperCase(),
                  extensions: [ext],
                });
              }

              // Mostrar el diálogo de guardado nativo
              const filePath = await tauriDialog.save({
                defaultPath: filename,
                filters: filters,
              });

              if (filePath) {
                // Convertir Blob a Uint8Array para Tauri
                const arrayBuffer = await blob.arrayBuffer();
                const binaryData = new Uint8Array(arrayBuffer);

                // Guardar el archivo de forma binaria
                await tauriFs.writeBinaryFile(filePath, binaryData);
              }
              return;
            }
          } catch (tauriError) {
            console.error("Error al guardar archivo en Tauri:", tauriError);
            // Intentar fallback al navegador
          }
        }

        // Comportamiento estándar del navegador web (fuera de Tauri)
        const fileUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(fileUrl);
      })
      .catch((err) => {
        console.error("Download error:", err);
        throw err;
      });
  };

  return {
    get,
    post,
    put,
    del,
    download,
  };
};
