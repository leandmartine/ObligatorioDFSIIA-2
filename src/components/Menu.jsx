import React from "react";
import { Col, Container, Row, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { cancelarVencimiento } from "../utils/sesion.js";

const Menu = () => {
  const navigate = useNavigate();
  useSelector((state) => state.loadingSlice.contadorPeticiones);

  const nombreUsuario = localStorage.getItem("nombreUsuario");
  const emailUsuario = localStorage.getItem("emailUsuario");
  const esPremium = localStorage.getItem("esPremium") === "true";
  const esAdmin = localStorage.getItem("esAdmin") === "true";
  const puedeModerar = localStorage.getItem("puedeModerar") === "true";

  const handlerLogout = () => {
    cancelarVencimiento();
    window.localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="menu">
      <Container>
        <Row className="align-items-center">
          <Col md={6} className="text-md-start text-center mb-2 mb-md-0">
            <h4 className="mb-0">Gestión de Publicaciones</h4>
          </Col>
          <Col
            md={6}
            className="d-flex align-items-center justify-content-md-end justify-content-center gap-2 flex-wrap"
          >
            <span className="small">
              {nombreUsuario || emailUsuario || "Usuario"}
            </span>
            <Badge bg={esPremium ? "warning" : "info"} text="dark">
              Plan {esPremium ? "Premium" : "Plus"}
            </Badge>
            {esAdmin && <Badge bg="danger">Admin</Badge>}
            {puedeModerar && <Badge bg="secondary">Moderador</Badge>}
            <Button variant="outline-light" size="sm" onClick={handlerLogout}>
              Logout
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Menu;
