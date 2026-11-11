import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Col, Container, Row } from "react-bootstrap";

import Agregar from "./Agregar.jsx";
import Publicaciones from "./Publicaciones.jsx";
import MiGrafica from "./MiGrafica.jsx";
import InformeUso from "./InformeUso.jsx";
import CambioPlan from "./CambioPlan.jsx";
import GestionCategorias from "./GestionCategorias.jsx";
import ModeracionPublicaciones from "./ModeracionPublicaciones.jsx";

import { obtenerPublicacionesUsuarioApi } from "../services/publicacionesServices.js";
import { obtenerCategoriasApi } from "../services/categoriasServices.js";
import { cargarPublicacionesInicialesSlice } from "../redux/features/publicacionesSlice.js";
import { cargaInicialCategoriasSlice } from "../redux/features/categoriasSlice.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";

const Contenido = () => {
  const dispatch = useDispatch();
  const esAdmin = localStorage.getItem("esAdmin") === "true";
  const puedeModerar = localStorage.getItem("puedeModerar") === "true";

  const obtenerPublicacionesDesdeContenido = async (controller) => {
    try {
      dispatch(aumentarContadorPeticiones());
      const respuesta = await obtenerPublicacionesUsuarioApi(controller.signal);
      const listaPublicaciones = respuesta?.publicaciones || [];
      dispatch(cargarPublicacionesInicialesSlice(listaPublicaciones));
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        return;
      }
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const obtenerCategoriasDesdeContenido = async (controller) => {
    try {
      dispatch(aumentarContadorPeticiones());
      const respuesta = await obtenerCategoriasApi(controller.signal);
      const listaCategorias = respuesta?.categorias || [];
      dispatch(cargaInicialCategoriasSlice(listaCategorias));
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        return;
      }
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const obtenerPublicacionesYCategorias = () => {
      obtenerCategoriasDesdeContenido(controller);
      obtenerPublicacionesDesdeContenido(controller);
    };

    obtenerPublicacionesYCategorias();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="contenido">
      <Container fluid>
        <Row className="mb-3">
          <Col md={6} className="mb-3 mb-md-0">
            <InformeUso />
          </Col>
          <Col md={6}>
            <CambioPlan />
          </Col>
        </Row>

        <Agregar />

        <Row className="mb-3">
          <Col lg={5} className="mb-3 mb-lg-0">
            <MiGrafica />
          </Col>
          <Col lg={7}>
            <Publicaciones />
          </Col>
        </Row>

        {puedeModerar && <ModeracionPublicaciones />}

        {esAdmin && <GestionCategorias />}
      </Container>
    </div>
  );
};

export default Contenido;
