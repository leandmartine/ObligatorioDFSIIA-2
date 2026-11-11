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

export const obtenerCategoriasApi = async (signal) => {
  const response = await api.get("/categoria", {
    signal: signal,
  });
  return response.data;
};

export const crearCategoriaApi = async (categoria) => {
  const response = await api.post("/categoria", categoria);
  return response.data;
};

export const actualizarCategoriaApi = async (idCategoria, categoria) => {
  const response = await api.patch(`/categoria/${idCategoria}`, categoria);
  return response.data;
};

export const borrarCategoriaApi = async (idCategoria) => {
  const response = await api.delete(`/categoria/${idCategoria}`);
  return response.data;
};
