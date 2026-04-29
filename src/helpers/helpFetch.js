const BASE_URL = "http://localhost:3000/api";

export const helpFetch = () => {
  const customFetch = (endpoint, options) => {
    const defaultHeader = {
      accept: "application/json",
      "Content-Type": "application/json",
    };

    // Include token if available
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
        // Let the browser set the boundary for multipart/form-data
        delete options.headers["Content-Type"];
      } else {
        options.body = JSON.stringify(options.body);
      }
    } else {
      delete options.body;
    }

    setTimeout(() => controller.abort(), 10000); // timeout 10s

    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}/${endpoint.replace(/^\//, "")}`;

    return fetch(url, options)
      .then((res) =>
        res.ok
          ? res.json()
          : res.json().then((json) =>
              Promise.reject({
                err: true,
                status: res.status || "00",
                statusText: json.message || res.statusText || "Oops, ha ocurrido un error",
              })
            )
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

  return {
    get,
    post,
    put,
    del,
  };
};
