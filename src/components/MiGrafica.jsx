import { useState, useEffect } from "react";
import Grafica from "./Grafica.jsx";
import { useSelector } from "react-redux";
import { useObtenerNombreCategoria } from "../utils/utils.js";
import { filtrarPublicacionesPorSearch } from "../redux/features/publicacionesSlice.js";

const reducePublicaciones = (acc, publicacion) => {
  const categoriaId = publicacion?.categoria;
  if (categoriaId) {
    if (acc[categoriaId]) {
      acc[categoriaId] = acc[categoriaId] + 1;
    } else {
      acc[categoriaId] = 1;
    }
  }
  return acc;
};

const MiGrafica = () => {
  const listaPublicacionesFiltradas = useSelector(
    filtrarPublicacionesPorSearch,
  );
  const listaCategorias = useSelector((state) => state.categoriasSlice);

  const [datos, setDatos] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);

  const obtenerNombreCategoria = useObtenerNombreCategoria();

  useEffect(() => {
    if (listaPublicacionesFiltradas?.length > 0) {
      const objetoPorCategoria = listaPublicacionesFiltradas.reduce(
        reducePublicaciones,
        {},
      );

      const etiquetasIdCategoria = Object.keys(objetoPorCategoria);
      const etiquetasAux = etiquetasIdCategoria.map((idCat) =>
        obtenerNombreCategoria(idCat),
      );
      const datosAux = Object.values(objetoPorCategoria);

      setDatos(datosAux);
      setEtiquetas(etiquetasAux);
    } else {
      setDatos([]);
      setEtiquetas([]);
    }
  }, [listaPublicacionesFiltradas, listaCategorias]);

  return (
    <div className="seccion-panel">
      <h5 className="text-start mb-3">Gráfica de Publicaciones por Categoría</h5>
      {datos.length > 0 ? (
        <Grafica
          etiquetas={etiquetas}
          datos={datos}
          nombreGrafica={"Cantidad de publicaciones por categoría"}
          nombreDatos={"Publicaciones"}
        />
      ) : (
        <p className="text-muted py-4">
          No hay publicaciones para graficar en este momento.
        </p>
      )}
    </div>
  );
};

export default MiGrafica;
