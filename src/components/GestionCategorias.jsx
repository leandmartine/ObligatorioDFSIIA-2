import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

import {
  crearCategoriaSlice,
  actualizarCategoriaSlice,
  borrarCategoriaSlice,
} from "../redux/features/categoriasSlice.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";
import {
  obtenerCategoriaPorIdApi,
  crearCategoriaApi,
  actualizarCategoriaApi,
  borrarCategoriaApi,
} from "../services/categoriasServices.js";
import { obtenerRolesApi } from "../services/authServices.js";
import { extraerMensajeError } from "../utils/utils.js";

const GestionCategorias = () => {
  const dispatch = useDispatch();
  const listaCategorias = useSelector((state) => state.categoriasSlice);

  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [nombreNueva, setNombreNueva] = useState("");
  const [descripcionNueva, setDescripcionNueva] = useState("");
  const [rolesSeleccionados, setRolesSeleccionados] = useState([]);

  const [idEditando, setIdEditando] = useState(null);
  const [nombreEditando, setNombreEditando] = useState("");
  const [descripcionEditando, setDescripcionEditando] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const cargarRoles = async () => {
      try {
        const data = await obtenerRolesApi(controller.signal);
        if (data?.roles) {
          setRolesDisponibles(data.roles);
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;
      }
    };

    cargarRoles();

    return () => {
      controller.abort();
    };
  }, []);

  const toggleRol = (nombreRol) => {
    if (rolesSeleccionados.includes(nombreRol)) {
      setRolesSeleccionados(rolesSeleccionados.filter((r) => r !== nombreRol));
    } else {
      setRolesSeleccionados([...rolesSeleccionados, nombreRol]);
    }
  };

  const handlerCrearCategoria = async (e) => {
    e.preventDefault();
    if (nombreNueva.trim().length < 2) {
      toast.error("El nombre de la categoría debe tener al menos 2 caracteres");
      return;
    }
    if (rolesSeleccionados.length === 0) {
      toast.error("Seleccioná al menos un rol permitido para la categoría");
      return;
    }

    try {
      dispatch(aumentarContadorPeticiones());
      const respuesta = await crearCategoriaApi({
        nombre: nombreNueva.trim(),
        descripcion: descripcionNueva.trim(),
        rolesPermitidos: rolesSeleccionados,
      });

      if (respuesta?.nuevaCategoria) {
        dispatch(crearCategoriaSlice(respuesta.nuevaCategoria));
        setNombreNueva("");
        setDescripcionNueva("");
        setRolesSeleccionados([]);
        toast.success("Categoría creada correctamente");
      }
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo crear la categoría"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const iniciarEdicion = async (cat) => {
    setIdEditando(cat._id);
    setNombreEditando(cat.nombre || "");
    setDescripcionEditando(cat.descripcion || "");
    try {
      const data = await obtenerCategoriaPorIdApi(cat._id);
      if (data?.categoria) {
        setNombreEditando(data.categoria.nombre || "");
        setDescripcionEditando(data.categoria.descripcion || "");
      }
    } catch {
      // Si falla la consulta puntual, mantenemos los valores en memoria
    }
  };

  const guardarEdicion = async (idCat) => {
    if (nombreEditando.trim().length < 2) {
      toast.error("El nombre debe tener al menos 2 caracteres");
      return;
    }

    try {
      dispatch(aumentarContadorPeticiones());
      const respuesta = await actualizarCategoriaApi(idCat, {
        nombre: nombreEditando.trim(),
        descripcion: descripcionEditando.trim(),
      });

      if (respuesta?.categoriaActualizada) {
        dispatch(actualizarCategoriaSlice(respuesta.categoriaActualizada));
        setIdEditando(null);
        toast.success("Categoría actualizada");
      }
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo actualizar la categoría"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const handlerEliminarCategoria = async (cat) => {
    const confirmar = window.confirm(
      `¿Eliminar la categoría "${cat.nombre}"?`,
    );
    if (!confirmar) return;

    try {
      dispatch(aumentarContadorPeticiones());
      await borrarCategoriaApi(cat._id);
      dispatch(borrarCategoriaSlice(cat._id));
      toast.success("Categoría eliminada");
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo eliminar la categoría"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  return (
    <div className="seccion-panel text-start">
      <h5 className="mb-3">Administración de Categorías (Admin)</h5>

      <Form onSubmit={handlerCrearCategoria} className="mb-4">
        <Row className="align-items-end">
          <Col md={3} className="mb-2">
            <Form.Label className="small mb-1">Nombre</Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder="Ej: Tecnología"
              value={nombreNueva}
              onChange={(e) => setNombreNueva(e.target.value)}
            />
          </Col>
          <Col md={4} className="mb-2">
            <Form.Label className="small mb-1">Descripción</Form.Label>
            <Form.Control
              type="text"
              size="sm"
              placeholder="Descripción opcional"
              value={descripcionNueva}
              onChange={(e) => setDescripcionNueva(e.target.value)}
            />
          </Col>
          <Col md={3} className="mb-2">
            <Form.Label className="small mb-1 d-block">
              Roles permitidos:
            </Form.Label>
            <div className="d-flex gap-2 flex-wrap">
              {rolesDisponibles.map((rol) => (
                <Form.Check
                  key={rol._id || rol.nombre}
                  type="checkbox"
                  id={`cat_rol_${rol.nombre}`}
                  label={rol.nombre}
                  checked={rolesSeleccionados.includes(rol.nombre)}
                  onChange={() => toggleRol(rol.nombre)}
                />
              ))}
            </div>
          </Col>
          <Col md={2} className="mb-2">
            <Button variant="primary" size="sm" type="submit" className="w-100">
              Crear Categoría
            </Button>
          </Col>
        </Row>
      </Form>

      <Row>
        {listaCategorias?.map((cat) => (
          <Col md={6} key={cat._id} className="mb-2">
            <div className="border rounded p-2 d-flex justify-content-between align-items-center gap-2">
              {idEditando === cat._id ? (
                <div className="w-100">
                  <Form.Control
                    type="text"
                    size="sm"
                    className="mb-1"
                    value={nombreEditando}
                    onChange={(e) => setNombreEditando(e.target.value)}
                  />
                  <Form.Control
                    type="text"
                    size="sm"
                    className="mb-2"
                    value={descripcionEditando}
                    onChange={(e) => setDescripcionEditando(e.target.value)}
                  />
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => guardarEdicion(cat._id)}
                    >
                      Guardar
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setIdEditando(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <strong>{cat.nombre}</strong>
                    {cat.descripcion && (
                      <div className="text-muted small">{cat.descripcion}</div>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => iniciarEdicion(cat)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handlerEliminarCategoria(cat)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default GestionCategorias;
