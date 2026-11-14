import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Badge, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";

import { modificarPublicacionSlice } from "../redux/features/publicacionesSlice.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";
import {
  obtenerPublicacionesPendientesApi,
  moderarPublicacionApi,
} from "../services/publicacionesServices.js";
import {
  useObtenerNombreCategoria,
  extraerMensajeError,
} from "../utils/utils.js";

const ModeracionPublicaciones = () => {
  const dispatch = useDispatch();
  const obtenerNombreCategoria = useObtenerNombreCategoria();
  const listaPublicacionesUsuario = useSelector(
    (state) => state.publicacionesSlice.listaPublicaciones,
  );

  const [pendientes, setPendientes] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    const cargarPendientes = async () => {
      try {
        const data = await obtenerPublicacionesPendientesApi(controller.signal);
        if (data?.publicaciones) {
          setPendientes(data.publicaciones);
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;
      }
    };

    cargarPendientes();

    return () => {
      controller.abort();
    };
  }, [listaPublicacionesUsuario]);

  const handlerModerar = async (idPublicacion, decision) => {
    try {
      dispatch(aumentarContadorPeticiones());
      const respuesta = await moderarPublicacionApi(idPublicacion, decision);

      setPendientes((prev) => prev.filter((p) => p._id !== idPublicacion));

      if (respuesta?.publicacion) {
        dispatch(modificarPublicacionSlice(respuesta.publicacion));
      }

      toast.success(
        decision === "aprobar"
          ? "Publicación aprobada"
          : "Publicación rechazada",
      );
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo moderar la publicación"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  return (
    <div className="seccion-panel text-start">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Moderación de Publicaciones Pendientes</h5>
        <Badge bg="secondary">{pendientes.length} pendientes</Badge>
      </div>

      {pendientes.length === 0 ? (
        <p className="text-muted mb-0">
          No hay publicaciones pendientes de revisión.
        </p>
      ) : (
        <Row>
          {pendientes.map((pub) => (
            <Col md={6} key={pub._id} className="mb-2">
              <div className="border rounded p-3 d-flex justify-content-between align-items-center gap-2">
                <div>
                  <Badge bg="secondary" className="mb-1">
                    {obtenerNombreCategoria(pub?.categoria)}
                  </Badge>
                  <h6 className="mb-1 fw-bold">{pub?.titulo}</h6>
                  <p className="text-muted small mb-1">{pub?.descripcion}</p>
                  <strong className="small text-primary">
                    {pub?.pesosUy ? "$U" : "USD"} {pub?.precio}
                  </strong>
                </div>
                <div className="d-flex flex-column gap-1">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handlerModerar(pub._id, "aprobar")}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handlerModerar(pub._id, "rechazar")}
                  >
                    Rechazar
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ModeracionPublicaciones;
