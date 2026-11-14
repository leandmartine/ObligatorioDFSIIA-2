import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Badge, Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";

import Publicacion from "./Publicacion.jsx";
import {
  obtenerPublicacionesApi,
  obtenerPublicacionPorIdApi,
} from "../services/publicacionesServices.js";
import { obtenerUsuarioPorIdApi } from "../services/usuariosServices.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";
import {
  useObtenerNombreCategoria,
  extraerMensajeError,
} from "../utils/utils.js";

const PublicacionesMarketplace = () => {
  const dispatch = useDispatch();
  const obtenerNombreCategoria = useObtenerNombreCategoria();
  const versionMarketplace = useSelector(
    (state) => state.publicacionesSlice.versionMarketplace,
  );

  const [publicaciones, setPublicaciones] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);

  const [mostrarModalDetalle, setMostrarModalDetalle] = useState(false);
  const [detallePublicacion, setDetallePublicacion] = useState(null);
  const [detalleAutor, setDetalleAutor] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const cargarMarketplace = async () => {
      try {
        dispatch(aumentarContadorPeticiones());
        const data = await obtenerPublicacionesApi(
          paginaActual,
          controller.signal,
        );
        if (data?.publicaciones) {
          setPublicaciones(data.publicaciones);
          setTotalPaginas(data.totalPaginas || 1);
          setTotalPublicaciones(data.total ?? data.publicaciones.length);
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    };

    cargarMarketplace();

    return () => {
      controller.abort();
    };
  }, [paginaActual, versionMarketplace, dispatch]);

  const handleVerDetalle = async (pub) => {
    try {
      dispatch(aumentarContadorPeticiones());
      const resPub = await obtenerPublicacionPorIdApi(pub._id);
      const pubCompleta = resPub?.publicacion || pub;
      setDetallePublicacion(pubCompleta);
      setDetalleAutor(null);

      if (pubCompleta?.autor) {
        try {
          const resAutor = await obtenerUsuarioPorIdApi(pubCompleta.autor);
          if (resAutor?.usuario) {
            setDetalleAutor(resAutor.usuario);
          }
        } catch {
          // Si el autor no está disponible, mostramos igualmente la publicación
        }
      }
      setMostrarModalDetalle(true);
    } catch (error) {
      toast.error(
        extraerMensajeError(
          error,
          "No se pudo obtener el detalle de la publicación",
        ),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  return (
    <div className="seccion-panel seccion-marketplace text-start mt-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 pb-2 border-bottom">
        <div>
          <h5 className="mb-1 fw-bold">Publicaciones del marketplace</h5>
          <p className="text-muted small mb-0">
            Catálogo general de publicaciones activas disponibles en la
            plataforma.
          </p>
        </div>
        <Badge bg="primary" pill>
          {totalPublicaciones} disponibles
        </Badge>
      </div>

      {publicaciones.length === 0 ? (
        <p className="text-muted text-center py-4 mb-0">
          No hay publicaciones disponibles en el marketplace en este momento.
        </p>
      ) : (
        <>
          <Row>
            {publicaciones.map((pub) => (
              <Col lg={6} key={pub._id} className="mb-3">
                <Publicacion
                  publicacion={pub}
                  esMarketplace={true}
                  onVerDetalle={handleVerDetalle}
                />
              </Col>
            ))}
          </Row>

          {totalPaginas > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-2">
              <Button
                variant="outline-primary"
                size="sm"
                disabled={paginaActual <= 1}
                onClick={() => setPaginaActual((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </Button>
              <span className="small text-muted">
                Página {paginaActual} de {totalPaginas}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={paginaActual >= totalPaginas}
                onClick={() =>
                  setPaginaActual((prev) => Math.min(totalPaginas, prev + 1))
                }
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      <Modal
        show={mostrarModalDetalle}
        onHide={() => setMostrarModalDetalle(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            {detallePublicacion?.titulo || "Detalle de la publicación"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detallePublicacion && (
            <div>
              {detallePublicacion.imagenUrl && (
                <div className="text-center mb-3">
                  <img
                    src={detallePublicacion.imagenUrl}
                    alt={detallePublicacion.titulo}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "220px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}

              <div className="d-flex gap-2 flex-wrap mb-2">
                <Badge bg="secondary">
                  {obtenerNombreCategoria(detallePublicacion.categoria)}
                </Badge>
                <Badge bg="light" text="dark" className="border">
                  {detallePublicacion.nuevo ? "Nuevo" : "Usado"}
                </Badge>
                {detallePublicacion.aceptaPermuta && (
                  <Badge bg="info" text="dark">
                    Acepta Permuta
                  </Badge>
                )}
              </div>

              <p className="mb-2">{detallePublicacion.descripcion}</p>

              <div className="d-flex justify-content-between align-items-center border-top pt-2 mb-2">
                <span>
                  <strong>Precio:</strong>{" "}
                  <span className="text-primary fw-bold">
                    {detallePublicacion.pesosUy ? "$U" : "USD"}{" "}
                    {detallePublicacion.precio}
                  </span>
                </span>
                <span>
                  <strong>Cantidad disponible:</strong>{" "}
                  {detallePublicacion.cantidad ?? 1}
                </span>
              </div>

              {detalleAutor && (
                <div className="bg-light rounded p-2 mt-2 small">
                  <strong className="d-block mb-1">Datos del vendedor:</strong>
                  <div>Nombre: {detalleAutor.name}</div>
                  <div>Email: {detalleAutor.email}</div>
                  {detalleAutor.phone && (
                    <div>Teléfono: {detalleAutor.phone}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMostrarModalDetalle(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PublicacionesMarketplace;
