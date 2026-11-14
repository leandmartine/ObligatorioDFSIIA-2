import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Form, Badge, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

import {
  borrarPublicacionSlice,
  modificarPublicacionSlice,
} from "../redux/features/publicacionesSlice.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";
import {
  useObtenerNombreCategoria,
  extraerMensajeError,
} from "../utils/utils.js";
import {
  borrarPublicacionApi,
  actualizarPublicacionApi,
} from "../services/publicacionesServices.js";
import ModalConfirmacion from "./ModalConfirmacion.jsx";

const Publicacion = ({
  publicacion,
  esMarketplace = false,
  onVerDetalle,
}) => {
  const dispatch = useDispatch();
  const obtenerNombreCategoria = useObtenerNombreCategoria();

  const idUsuario = localStorage.getItem("idUsuario");
  const esAdmin = localStorage.getItem("esAdmin") === "true";
  const puedeModerar = localStorage.getItem("puedeModerar") === "true";

  const esAutor =
    Boolean(idUsuario) && String(publicacion?.autor) === String(idUsuario);
  const puedeEditar = !esMarketplace || esAutor || esAdmin || puedeModerar;
  const puedeEliminar = !esMarketplace || esAutor || esAdmin;

  const [editando, setEditando] = useState(false);
  const [mostrarConfirmarBorrado, setMostrarConfirmarBorrado] = useState(false);
  const [tituloEditando, setTituloEditando] = useState(
    publicacion?.titulo || "",
  );
  const [descripcionEditando, setDescripcionEditando] = useState(
    publicacion?.descripcion || "",
  );
  const [precioEditando, setPrecioEditando] = useState(
    publicacion?.precio ?? 0,
  );

  const handlerEditar = () => {
    setTituloEditando(publicacion?.titulo || "");
    setDescripcionEditando(publicacion?.descripcion || "");
    setPrecioEditando(publicacion?.precio ?? 0);
    setEditando(true);
  };

  const handlerCancelar = () => {
    setEditando(false);
  };

  const handlerGuardar = async () => {
    if (tituloEditando.trim().length < 5) {
      toast.error("El título debe tener al menos 5 caracteres");
      return;
    }
    if (descripcionEditando.trim().length < 10) {
      toast.error("La descripción debe tener al menos 10 caracteres");
      return;
    }
    if (Number(precioEditando) < 0 || Number.isNaN(Number(precioEditando))) {
      toast.error("El precio debe ser un número válido mayor o igual a 0");
      return;
    }

    try {
      dispatch(aumentarContadorPeticiones());
      const datosActualizados = {
        titulo: tituloEditando.trim(),
        descripcion: descripcionEditando.trim(),
        precio: Number(precioEditando),
      };

      const respuesta = await actualizarPublicacionApi(
        publicacion?._id,
        datosActualizados,
      );

      if (respuesta?.publicacionActualizada) {
        dispatch(modificarPublicacionSlice(respuesta.publicacionActualizada));
        setEditando(false);
        toast.success("Publicación modificada correctamente");
      }
    } catch (error) {
      const mensaje = extraerMensajeError(
        error,
        "No se pudo modificar la publicación",
      );
      toast.error(mensaje);
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const borrarHandler = async () => {
    setMostrarConfirmarBorrado(false);

    try {
      dispatch(aumentarContadorPeticiones());
      await borrarPublicacionApi(publicacion?._id);
      dispatch(borrarPublicacionSlice(publicacion?._id));
      toast.success("Publicación eliminada");
    } catch (error) {
      const mensaje = extraerMensajeError(
        error,
        "No se pudo eliminar la publicación",
      );
      toast.error(mensaje);
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  return (
    <div className="tarjeta h-100">
      <Row className="align-items-center">
        <Col md={3} className="text-center mb-2 mb-md-0">
          {publicacion?.imagenUrl ? (
            <img
              src={publicacion?.imagenUrl}
              alt={`Imagen de ${publicacion?.titulo || "publicación"}`}
              style={{
                width: "100%",
                maxWidth: "140px",
                height: "110px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ) : (
            <div
              className="bg-light border rounded d-flex align-items-center justify-content-center text-muted small"
              style={{ height: "110px" }}
            >
              Sin imagen
            </div>
          )}
        </Col>

        <Col md={9}>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-2">
            <div className="d-flex gap-2 flex-wrap">
              <Badge bg="secondary">
                {obtenerNombreCategoria(publicacion?.categoria)}
              </Badge>
              {!esMarketplace && (
                <Badge
                  bg={publicacion?.activa ? "success" : "warning"}
                  text={publicacion?.activa ? "light" : "dark"}
                >
                  {publicacion?.activa ? "Disponible" : "Pendiente de Revisión"}
                </Badge>
              )}
              <Badge bg="light" text="dark" className="border">
                {publicacion?.nuevo ? "Nuevo" : "Usado"}
              </Badge>
              {publicacion?.aceptaPermuta && (
                <Badge bg="info" text="dark">
                  Acepta Permuta
                </Badge>
              )}
              {esMarketplace && esAutor && (
                <Badge bg="dark">Tu publicación</Badge>
              )}
            </div>
            <span className="text-muted small">
              Cant: {publicacion?.cantidad ?? 1}
            </span>
          </div>

          {editando ? (
            <div className="mt-2">
              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Título</Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  value={tituloEditando}
                  onChange={(e) => setTituloEditando(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  size="sm"
                  value={descripcionEditando}
                  onChange={(e) => setDescripcionEditando(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small mb-1">Precio</Form.Label>
                <Form.Control
                  type="number"
                  size="sm"
                  value={precioEditando}
                  onChange={(e) => setPrecioEditando(e.target.value)}
                />
              </Form.Group>

              <div className="d-flex gap-2 mt-2">
                <Button variant="success" size="sm" onClick={handlerGuardar}>
                  Guardar
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={handlerCancelar}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h6 className="fw-bold mb-1">{publicacion?.titulo}</h6>
              <p className="text-muted small mb-2">
                {publicacion?.descripcion}
              </p>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <strong className="text-primary">
                  {publicacion?.pesosUy ? "$U" : "USD"} {publicacion?.precio}
                </strong>
                <div className="d-flex gap-2 flex-wrap">
                  {esMarketplace && onVerDetalle && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => onVerDetalle(publicacion)}
                    >
                      Ver detalle
                    </Button>
                  )}
                  {puedeEditar && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handlerEditar}
                    >
                      Editar
                    </Button>
                  )}
                  {puedeEliminar && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => setMostrarConfirmarBorrado(true)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </Col>
      </Row>

      <ModalConfirmacion
        mostrar={mostrarConfirmarBorrado}
        titulo="Eliminar publicación"
        mensaje={`¿Estás seguro de eliminar la publicación "${publicacion?.titulo}"?`}
        textoConfirmar="Sí, eliminar"
        onCancelar={() => setMostrarConfirmarBorrado(false)}
        onConfirmar={borrarHandler}
      />
    </div>
  );
};

export default Publicacion;
