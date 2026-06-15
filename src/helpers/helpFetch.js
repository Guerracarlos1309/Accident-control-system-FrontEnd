// Detecta si la app corre en modo desarrollo local (localhost) o en producción (Tauri)
const isDevelopment =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const BASE_URL = isDevelopment
  ? "http://localhost:3000/api"
  : "http://10.68.19.200:3000/api";

export const helpFetch = () => {
  const customFetch = (endpoint, options) => {
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

  const download = (endpoint, filename) => {
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
      .then((blob) => {
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
