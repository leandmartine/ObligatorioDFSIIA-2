import { useSelector } from "react-redux";

export const pausa = (segundos) =>
  new Promise((resolve) => setTimeout(resolve, segundos * 1000));

export const useObtenerNombreCategoria = () => {
  const listaCategorias = useSelector((state) => state.categoriasSlice);

  const obtenerNombreCategoria = (categoriaId) => {
    const categoria = listaCategorias?.find((c) => c._id == categoriaId);
    const categoriaSalida = categoria ? categoria.nombre : "Sin categoría";
    return categoriaSalida;
  };

  return obtenerNombreCategoria;
};

export const extraerMensajeError = (error, mensajePorDefecto) => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (Array.isArray(data.error) && data.error.length > 0) {
      return data.error.map((detalle) => detalle.message).join(". ");
    }
    if (typeof data.error === "string") {
      return data.error;
    }
    if (typeof data.message === "string") {
      return data.message;
    }
  }
  return error?.message || mensajePorDefecto;
};
