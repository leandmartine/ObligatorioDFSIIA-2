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

export const loginApi = async (dataLogin) => {
  const resultado = await api.post("/auth/login", dataLogin);
  return resultado.data;
};

export const registerApi = async (dataRegister) => {
  const resultado = await api.post("/auth/register", dataRegister);
  return resultado.data;
};

export const obtenerRolesApi = async (signal) => {
  const resultado = await api.get("/auth/roles", {
    signal: signal,
  });
  return resultado.data;
};

export default api;
