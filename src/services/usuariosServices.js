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

export const obtenerUsuariosApi = async (signal) => {
  const response = await api.get("/usuarios", {
    signal: signal,
  });
  return response.data;
};

export const obtenerUsuarioPorIdApi = async (idUsuario, signal) => {
  const response = await api.get(`/usuarios/${idUsuario}`, {
    signal: signal,
  });
  return response.data;
};

export const crearUsuarioApi = async (datosUsuario) => {
  const response = await api.post("/usuarios", datosUsuario);
  return response.data;
};

export const altaUsuarioPremiumApi = async (idUsuario) => {
  const response = await api.patch(`/usuarios/altaPremium/${idUsuario}`, {
    esPremium: true,
  });
  return response.data;
};

export const actualizarUsuarioApi = async (idUsuario, datosUsuario) => {
  const response = await api.patch(`/usuarios/${idUsuario}`, datosUsuario);
  return response.data;
};

export const eliminarUsuarioApi = async (idUsuario) => {
  const response = await api.delete(`/usuarios/${idUsuario}`);
  return response.data;
};
