import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Badge } from "react-bootstrap";
import { toast } from "react-toastify";

import {
  obtenerUsuariosApi,
  crearUsuarioApi,
  actualizarUsuarioApi,
  eliminarUsuarioApi,
} from "../services/usuariosServices.js";
import { obtenerRolesApi } from "../services/authServices.js";
import { notificarCambioMarketplaceSlice } from "../redux/features/publicacionesSlice.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";
import { cancelarVencimiento } from "../utils/sesion.js";
import { extraerMensajeError } from "../utils/utils.js";

const GestionUsuarios = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const idUsuarioActual = localStorage.getItem("idUsuario");

  const [usuarios, setUsuarios] = useState([]);
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [mostrarAlta, setMostrarAlta] = useState(false);

  // Estado formulario alta de usuario (POST /usuarios - createUsuarioSchema)
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [nuevoPhone, setNuevoPhone] = useState("");
  const [nuevoPassword, setNuevoPassword] = useState("");
  const [nuevoRol, setNuevoRol] = useState("");
  const [nuevoEsAdmin, setNuevoEsAdmin] = useState(false);
  const [nuevoPuedeModerar, setNuevoPuedeModerar] = useState(false);
  const [nuevoEsPremium, setNuevoEsPremium] = useState(false);

  // Estado para edición inline (PATCH /usuarios/:id - updateUsuarioSchema)
  const [idEditando, setIdEditando] = useState(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [rolEdit, setRolEdit] = useState("");
  const [passwordEdit, setPasswordEdit] = useState("");
  const [esAdminEdit, setEsAdminEdit] = useState(false);
  const [puedeModerarEdit, setPuedeModerarEdit] = useState(false);
  const [esPremiumEdit, setEsPremiumEdit] = useState(false);

  const obtenerNombreRol = (rolCampo) => {
    if (!rolCampo) return "";
    if (typeof rolCampo === "object" && rolCampo.nombre) {
      return rolCampo.nombre;
    }
    const encontrado = rolesDisponibles.find(
      (r) => String(r._id) === String(rolCampo) || r.nombre === rolCampo,
    );
    return encontrado ? encontrado.nombre : "";
  };

  useEffect(() => {
    const controller = new AbortController();

    const cargarDatos = async () => {
      try {
        dispatch(aumentarContadorPeticiones());
        const [dataUsuarios, dataRoles] = await Promise.all([
          obtenerUsuariosApi(controller.signal),
          obtenerRolesApi(controller.signal),
        ]);

        if (dataUsuarios?.usuarios) {
          setUsuarios(dataUsuarios.usuarios);
        }
        if (dataRoles?.roles) {
          setRolesDisponibles(dataRoles.roles);
        }
      } catch (error) {
        if (error.code === "ERR_CANCELED") return;
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    };

    cargarDatos();

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    if (nuevoNombre.trim().length < 3 || nuevoNombre.trim().length > 30) {
      toast.error("El nombre debe tener entre 3 y 30 caracteres");
      return;
    }
    if (!nuevoEmail.trim().includes("@")) {
      toast.error("Ingresá un email válido");
      return;
    }
    if (!nuevoPhone || Number.isNaN(Number(nuevoPhone))) {
      toast.error("El teléfono es obligatorio y debe ser numérico");
      return;
    }
    if (nuevoPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (!nuevoRol.trim()) {
      toast.error("Seleccioná un rol para el usuario");
      return;
    }

    try {
      dispatch(aumentarContadorPeticiones());
      const payload = {
        name: nuevoNombre.trim(),
        email: nuevoEmail.trim(),
        phone: Number(nuevoPhone),
        password: nuevoPassword,
        role: nuevoRol.trim(),
        esAdmin: Boolean(nuevoEsAdmin),
        puedeModerar: Boolean(nuevoPuedeModerar),
        esPremium: Boolean(nuevoEsPremium),
      };

      const res = await crearUsuarioApi(payload);
      if (res?.nuevoUsuario) {
        const recarga = await obtenerUsuariosApi();
        if (recarga?.usuarios) {
          setUsuarios(recarga.usuarios);
        } else {
          setUsuarios((prev) => [...prev, res.nuevoUsuario]);
        }
        setNuevoNombre("");
        setNuevoEmail("");
        setNuevoPhone("");
        setNuevoPassword("");
        setNuevoRol("");
        setNuevoEsAdmin(false);
        setNuevoPuedeModerar(false);
        setNuevoEsPremium(false);
        setMostrarAlta(false);
        toast.success("Usuario creado exitosamente");
      }
    } catch (error) {
      toast.error(extraerMensajeError(error, "No se pudo crear el usuario"));
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const iniciarEdicion = (u) => {
    setIdEditando(u._id);
    setNombreEdit(u.name || "");
    setRolEdit(obtenerNombreRol(u.role));
    setPasswordEdit("");
    setEsAdminEdit(Boolean(u.esAdmin));
    setPuedeModerarEdit(Boolean(u.puedeModerar));
    setEsPremiumEdit(Boolean(u.esPremium));
  };

  const guardarEdicion = async (idUsuario) => {
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
      // Mapeado exactamente a updateUsuarioSchema del backend
      const payload = {
        name: nombreLimpio,
        esAdmin: Boolean(esAdminEdit),
        puedeModerar: Boolean(puedeModerarEdit),
        esPremium: Boolean(esPremiumEdit),
      };

      if (rolEdit.trim().length >= 2) {
        payload.role = rolEdit.trim();
      }
      if (passwordEdit.length >= 6) {
        payload.password = passwordEdit;
      }

      const res = await actualizarUsuarioApi(idUsuario, payload);
      if (res?.usuarioActualizado) {
        const recarga = await obtenerUsuariosApi();
        if (recarga?.usuarios) {
          setUsuarios(recarga.usuarios);
        }

        if (String(idUsuario) === String(idUsuarioActual)) {
          localStorage.setItem("nombreUsuario", nombreLimpio);
          localStorage.setItem("esAdmin", String(Boolean(esAdminEdit)));
          localStorage.setItem(
            "puedeModerar",
            String(Boolean(puedeModerarEdit)),
          );
          localStorage.setItem("esPremium", String(Boolean(esPremiumEdit)));
        }

        setIdEditando(null);
        toast.success("Usuario actualizado correctamente");
      }
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo actualizar el usuario"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  const handleEliminarUsuario = async (u) => {
    const esPropio = String(u._id) === String(idUsuarioActual);
    const confirmar = window.confirm(
      esPropio
        ? "¿Estás seguro de dar de baja tu propia cuenta? Se cerrará tu sesión y se cancelarán tus publicaciones."
        : `¿Estás seguro de dar de baja al usuario "${u.name}" (${u.email})? Se cancelarán sus publicaciones activas.`,
    );
    if (!confirmar) return;

    try {
      dispatch(aumentarContadorPeticiones());
      await eliminarUsuarioApi(u._id);
      setUsuarios((prev) => prev.filter((item) => item._id !== u._id));
      dispatch(notificarCambioMarketplaceSlice());

      if (esPropio) {
        cancelarVencimiento();
        localStorage.clear();
        toast.info("Tu cuenta fue dada de baja.");
        navigate("/login", { replace: true });
      } else {
        toast.success("Usuario dado de baja correctamente");
      }
    } catch (error) {
      toast.error(
        extraerMensajeError(error, "No se pudo dar de baja al usuario"),
      );
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  return (
    <div className="seccion-panel text-start">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h5 className="mb-0">Administración de Usuarios Activos (Admin)</h5>
          <small className="text-muted">
            Consulta, edición y baja lógica de cuentas registradas en la
            plataforma.
          </small>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Badge bg="secondary">{usuarios.length} activos</Badge>
          <Button
            variant={mostrarAlta ? "outline-secondary" : "outline-primary"}
            size="sm"
            onClick={() => setMostrarAlta((prev) => !prev)}
          >
            {mostrarAlta ? "Ocultar formulario" : "+ Nuevo Usuario"}
          </Button>
        </div>
      </div>

      {mostrarAlta && (
        <Form
          onSubmit={handleCrearUsuario}
          className="border rounded p-3 mb-3 bg-light"
        >
          <h6 className="fw-bold mb-2">Crear Nuevo Usuario</h6>
          <Row>
            <Col md={3} className="mb-2">
              <Form.Label className="small mb-1">Nombre</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="3 a 30 caracteres"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />
            </Col>
            <Col md={3} className="mb-2">
              <Form.Label className="small mb-1">Email</Form.Label>
              <Form.Control
                type="email"
                size="sm"
                placeholder="correo@ejemplo.com"
                value={nuevoEmail}
                onChange={(e) => setNuevoEmail(e.target.value)}
              />
            </Col>
            <Col md={2} className="mb-2">
              <Form.Label className="small mb-1">Teléfono</Form.Label>
              <Form.Control
                type="number"
                size="sm"
                placeholder="99123456"
                value={nuevoPhone}
                onChange={(e) => setNuevoPhone(e.target.value)}
              />
            </Col>
            <Col md={2} className="mb-2">
              <Form.Label className="small mb-1">Contraseña</Form.Label>
              <Form.Control
                type="password"
                size="sm"
                placeholder="Mín. 6 caracteres"
                value={nuevoPassword}
                onChange={(e) => setNuevoPassword(e.target.value)}
              />
            </Col>
            <Col md={2} className="mb-2">
              <Form.Label className="small mb-1">Rol</Form.Label>
              <Form.Select
                size="sm"
                value={nuevoRol}
                onChange={(e) => setNuevoRol(e.target.value)}
              >
                <option value="">Rol...</option>
                {rolesDisponibles.map((r) => (
                  <option key={r._id || r.nombre} value={r.nombre}>
                    {r.nombre}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
            <div className="d-flex gap-3 flex-wrap">
              <Form.Check
                type="checkbox"
                id="alta_admin"
                label="Es Admin"
                checked={nuevoEsAdmin}
                onChange={(e) => setNuevoEsAdmin(e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                id="alta_mod"
                label="Puede Moderar"
                checked={nuevoPuedeModerar}
                onChange={(e) => setNuevoPuedeModerar(e.target.checked)}
              />
              <Form.Check
                type="checkbox"
                id="alta_prem"
                label="Plan Premium"
                checked={nuevoEsPremium}
                onChange={(e) => setNuevoEsPremium(e.target.checked)}
              />
            </div>
            <Button variant="primary" size="sm" type="submit">
              Guardar Usuario
            </Button>
          </div>
        </Form>
      )}

      <Row>
        {usuarios.map((u) => {
          const nombreRolActual = obtenerNombreRol(u.role);
          const esPropio = String(u._id) === String(idUsuarioActual);

          return (
            <Col md={6} key={u._id} className="mb-2">
              <div className="border rounded p-3 h-100 d-flex flex-column justify-content-between">
                {idEditando === u._id ? (
                  <div>
                    <Row>
                      <Col sm={6} className="mb-2">
                        <Form.Label className="small mb-1">
                          Nombre (3 a 30 caract.)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={nombreEdit}
                          onChange={(e) => setNombreEdit(e.target.value)}
                        />
                      </Col>
                      <Col sm={6} className="mb-2">
                        <Form.Label className="small mb-1">Rol</Form.Label>
                        <Form.Select
                          size="sm"
                          value={rolEdit}
                          onChange={(e) => setRolEdit(e.target.value)}
                        >
                          <option value="">Mantener rol actual</option>
                          {rolesDisponibles.map((r) => (
                            <option key={r._id || r.nombre} value={r.nombre}>
                              {r.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>

                    <Form.Group className="mb-2">
                      <Form.Label className="small mb-1">
                        Nueva contraseña (opcional, mín. 6 caracteres)
                      </Form.Label>
                      <Form.Control
                        type="password"
                        size="sm"
                        placeholder="Dejar en blanco para no cambiar"
                        value={passwordEdit}
                        onChange={(e) => setPasswordEdit(e.target.value)}
                      />
                    </Form.Group>

                    <div className="d-flex gap-3 flex-wrap mb-2">
                      <Form.Check
                        type="checkbox"
                        id={`edit_admin_${u._id}`}
                        label="Admin"
                        checked={esAdminEdit}
                        onChange={(e) => setEsAdminEdit(e.target.checked)}
                      />
                      <Form.Check
                        type="checkbox"
                        id={`edit_mod_${u._id}`}
                        label="Moderador"
                        checked={puedeModerarEdit}
                        onChange={(e) => setPuedeModerarEdit(e.target.checked)}
                      />
                      <Form.Check
                        type="checkbox"
                        id={`edit_prem_${u._id}`}
                        label="Premium"
                        checked={esPremiumEdit}
                        onChange={(e) => setEsPremiumEdit(e.target.checked)}
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => guardarEdicion(u._id)}
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
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <div>
                      <div className="d-flex align-items-center gap-1 flex-wrap mb-1">
                        <strong>{u.name}</strong>
                        {esPropio && <Badge bg="dark">Vos</Badge>}
                        {nombreRolActual && (
                          <Badge bg="secondary">{nombreRolActual}</Badge>
                        )}
                        <Badge
                          bg={u.esPremium ? "warning" : "info"}
                          text="dark"
                        >
                          {u.esPremium ? "Premium" : "Plus"}
                        </Badge>
                        {u.esAdmin && <Badge bg="danger">Admin</Badge>}
                        {u.puedeModerar && (
                          <Badge bg="secondary">Moderador</Badge>
                        )}
                      </div>
                      <div className="text-muted small">{u.email}</div>
                      <div className="text-muted small">
                        Tel: {u.phone || "-"} · Publicaciones:{" "}
                        {u.publicaciones?.length ?? 0}
                      </div>
                    </div>

                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => iniciarEdicion(u)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleEliminarUsuario(u)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default GestionUsuarios;
