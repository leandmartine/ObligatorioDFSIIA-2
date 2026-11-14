import React, { useState } from "react";
import { Col, Container, Row, Button, Badge, Modal, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";

import { cancelarVencimiento } from "../utils/sesion.js";
import {
  obtenerUsuarioPorIdApi,
  actualizarUsuarioApi,
  eliminarUsuarioApi,
} from "../services/usuariosServices.js";
import { obtenerRolesApi } from "../services/authServices.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";
import { extraerMensajeError } from "../utils/utils.js";

const Menu = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useSelector((state) => state.loadingSlice.contadorPeticiones);

  const idUsuario = localStorage.getItem("idUsuario");
  const nombreUsuario = localStorage.getItem("nombreUsuario");
  const emailUsuario = localStorage.getItem("emailUsuario");
  const esPremium = localStorage.getItem("esPremium") === "true";
  const esAdmin = localStorage.getItem("esAdmin") === "true";
  const puedeModerar = localStorage.getItem("puedeModerar") === "true";

  // Estado para modal "Mi Perfil" (GET /usuarios/:id, PATCH /usuarios/:id, DELETE /usuarios/:id)
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [nombreEdit, setNombreEdit] = useState(nombreUsuario || "");
  const [rolEdit, setRolEdit] = useState("");
  const [passwordEdit, setPasswordEdit] = useState("");
  const [telefonoActual, setTelefonoActual] = useState("");

  const handlerLogout = () => {
    cancelarVencimiento();
    window.localStorage.clear();
    navigate("/login");
  };

  const abrirModalPerfil = async () => {
    setNombreEdit(localStorage.getItem("nombreUsuario") || "");
    setPasswordEdit("");
    setMostrarPerfil(true);

    if (!idUsuario) return;

    try {
      dispatch(aumentarContadorPeticiones());
      const [resUsuario, resRoles] = await Promise.all([
        obtenerUsuarioPorIdApi(idUsuario),
        obtenerRolesApi(),
      ]);

      const listaRoles = resRoles?.roles || [];
      setRolesDisponibles(listaRoles);

      if (resUsuario?.usuario) {
        const u = resUsuario.usuario;
        setNombreEdit(u.name || "");
        setTelefonoActual(u.phone || "");
        const rolNombre =
          typeof u.role === "object" && u.role?.nombre
            ? u.role.nombre
            : listaRoles.find((r) => String(r._id) === String(u.role))?.nombre ||
              "";
        setRolEdit(rolNombre);
      }
    } catch {
      // Mantenemos datos locales si falla la consulta
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const handleGuardarPerfil = async (e) => {
    e.preventDefault();
    const nombreLimpio = nombreEdit.trim();
    if (nombreLimpio.length < 3 || nombreLimpio.length > 30) {
      toast.error("El nombre debe tener entre 3 y 30 caracteres");
      return;
    }
    if (passwordEdit && passwordEdit.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      dispatch(aumentarContadorPeticiones());
      // Mapeado exactamente a updateUsuarioSchema en backend
      const payload = {
        name: nombreLimpio,
      };
      if (rolEdit.trim().length >= 2) {
        payload.role = rolEdit.trim();
      }
      if (passwordEdit.length >= 6) {
        payload.password = passwordEdit;
      }

      const res = await actualizarUsuarioApi(idUsuario, payload);
      if (res?.usuarioActualizado) {
        localStorage.setItem("nombreUsuario", nombreLimpio);
        setMostrarPerfil(false);
        toast.success("Tu perfil fue actualizado correctamente");
      }
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo actualizar tu perfil"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const handleEliminarMiCuenta = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que querés dar de baja tu cuenta? Tus publicaciones activas serán canceladas y se cerrará tu sesión.",
    );
    if (!confirmar) return;

    try {
      dispatch(aumentarContadorPeticiones());
      await eliminarUsuarioApi(idUsuario);
      cancelarVencimiento();
      window.localStorage.clear();
      setMostrarPerfil(false);
      toast.info("Tu cuenta ha sido dada de baja.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo dar de baja tu cuenta"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  return (
    <>
      <div className="menu">
        <Container>
          <Row className="align-items-center">
            <Col md={5} className="text-md-start text-center mb-2 mb-md-0">
              <h4 className="mb-0 fw-bold">Gestión de Publicaciones</h4>
            </Col>
            <Col
              md={7}
              className="d-flex align-items-center justify-content-md-end justify-content-center gap-2 flex-wrap"
            >
              <span className="small fw-medium">
                {nombreUsuario || emailUsuario || "Usuario"}
              </span>
              <Badge bg={esPremium ? "warning" : "info"} text="dark">
                Plan {esPremium ? "Premium" : "Plus"}
              </Badge>
              {esAdmin && <Badge bg="danger">Admin</Badge>}
              {puedeModerar && <Badge bg="secondary">Moderador</Badge>}
              <Button
                variant="outline-info"
                size="sm"
                onClick={abrirModalPerfil}
              >
                Mi Perfil
              </Button>
              <Button variant="outline-light" size="sm" onClick={handlerLogout}>
                Logout
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Modal
        show={mostrarPerfil}
        onHide={() => setMostrarPerfil(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">Mi Perfil</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleGuardarPerfil}>
          <Modal.Body className="text-start">
            <div className="bg-light rounded p-2 mb-3 small text-muted">
              <div>
                <strong>Email:</strong> {emailUsuario}
              </div>
              {telefonoActual && (
                <div>
                  <strong>Teléfono:</strong> {telefonoActual}
                </div>
              )}
            </div>

            <Form.Group className="mb-3" controlId="perfilNombre">
              <Form.Label className="small mb-1">Nombre</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={nombreEdit}
                onChange={(e) => setNombreEdit(e.target.value)}
                placeholder="Tu nombre (3 a 30 caracteres)"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="perfilRol">
              <Form.Label className="small mb-1">Rol</Form.Label>
              <Form.Select
                size="sm"
                value={rolEdit}
                onChange={(e) => setRolEdit(e.target.value)}
              >
                <option value="">Seleccioná tu rol...</option>
                {rolesDisponibles.map((r) => (
                  <option key={r._id || r.nombre} value={r.nombre}>
                    {r.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="perfilPassword">
              <Form.Label className="small mb-1">
                Nueva Contraseña (opcional)
              </Form.Label>
              <Form.Control
                type="password"
                size="sm"
                value={passwordEdit}
                onChange={(e) => setPasswordEdit(e.target.value)}
                placeholder="Dejar vacío para mantener la actual (mín. 6 caract.)"
              />
            </Form.Group>

            <div className="border-top pt-3 mt-3 d-flex justify-content-between align-items-center">
              <span className="small text-muted">
                Dar de baja mi cuenta y cancelar mis publicaciones:
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                type="button"
                onClick={handleEliminarMiCuenta}
              >
                Eliminar mi cuenta
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setMostrarPerfil(false)}
            >
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Guardar cambios
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Menu;
