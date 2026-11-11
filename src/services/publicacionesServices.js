import axios from "axios";

const urlBase = `${import.meta.env.VITE_API_URL_BACKEND}`;

const api = axios.create({
  baseURL: urlBase,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  },
);

export const obtenerPublicacionesUsuarioApi = async (signal) => {
  const response = await api.get("/usuarios/publicaciones", {
    signal: signal,
  });
  return response.data;
};

export const obtenerPublicacionesApi = async (signal) => {
  const response = await api.get("/publicacion", {
    signal: signal,
  });
  return response.data;
};

export const obtenerPublicacionesPendientesApi = async (signal) => {
  const response = await api.get("/publicacion/revision", {
    signal: signal,
  });
  return response.data;
};

export const crearPublicacionApi = async (formData) => {
  const response = await api.post("/publicacion", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const actualizarPublicacionApi = async (idPublicacion, datos) => {
  const esFormData = datos instanceof FormData;
  const response = await api.patch(
    `/publicacion/${idPublicacion}`,
    datos,
    esFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : undefined,
  );
  return response.data;
};

export const borrarPublicacionApi = async (idPublicacion) => {
  const response = await api.delete(`/publicacion/${idPublicacion}`);
  return response.data;
};

export const moderarPublicacionApi = async (idPublicacion, decision) => {
  const response = await api.patch(`/publicacion/revision/${idPublicacion}`, {
    decision,
  });
  return response.data;
};
