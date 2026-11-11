import React, { useId } from "react";
import Publicacion from "./Publicacion.jsx";
import { useSelector, useDispatch } from "react-redux";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  filtrarPublicacionesPorSearch,
  modificarSearchSlice,
  modificarCategoriaFiltroSlice,
} from "../redux/features/publicacionesSlice.js";

const Publicaciones = () => {
  const dispatch = useDispatch();

  const listaPublicacionesFiltradas = useSelector(
    filtrarPublicacionesPorSearch,
  );
  const searchActual = useSelector((state) => state.publicacionesSlice.search);
  const categoriaFiltroActual = useSelector(
    (state) => state.publicacionesSlice.categoriaFiltro,
  );
  const listaCategorias = useSelector((state) => state.categoriasSlice);

  const idInputFiltro = useId();
  const idSelectCategoria = useId();

  const handlerFilterTexto = (e) => {
    const textoAFiltrar = e.target.value;
    dispatch(modificarSearchSlice(textoAFiltrar));
  };

  const handlerFilterCategoria = (e) => {
    const categoriaSeleccionada = e.target.value;
    dispatch(modificarCategoriaFiltroSlice(categoriaSeleccionada));
  };

  return (
    <div className="seccion-panel text-start">
      <h5 className="mb-3">Mis Publicaciones</h5>

      <Row className="mb-3">
        <Col md={7} className="mb-2 mb-md-0">
          <Form.Label htmlFor={idInputFiltro} className="small mb-1">
            Buscar por título o descripción:
          </Form.Label>
          <Form.Control
            type="text"
            id={idInputFiltro}
            placeholder="Filtrar publicaciones..."
            value={searchActual}
            onChange={handlerFilterTexto}
          />
        </Col>
        <Col md={5}>
          <Form.Label htmlFor={idSelectCategoria} className="small mb-1">
            Filtrar por categoría:
          </Form.Label>
          <Form.Select
            id={idSelectCategoria}
            value={categoriaFiltroActual}
            onChange={handlerFilterCategoria}
          >
            <option value="">Todas las categorías</option>
            {listaCategorias?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nombre}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <div className="tarjetas">
        {listaPublicacionesFiltradas?.length > 0 ? (
          listaPublicacionesFiltradas.map((publicacion) => (
            <Publicacion key={publicacion._id} publicacion={publicacion} />
          ))
        ) : (
          <p className="text-muted text-center py-3">
            No se encontraron publicaciones para mostrar.
          </p>
        )}
      </div>
    </div>
  );
};

export default Publicaciones;
