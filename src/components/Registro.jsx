import { useState, useEffect } from "react";
import { Button, Form, Card, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

import { registerApi, obtenerRolesApi } from "../services/authServices.js";
import { programarVencimiento } from "../utils/sesion.js";
import { extraerMensajeError } from "../utils/utils.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";

const esquemaRegistro = Yup.object({
  name: Yup.string()
    .trim()
    .required("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(30, "El nombre no puede tener más de 30 caracteres"),
  email: Yup.string()
    .email("El email debe ser una dirección de correo válida")
    .required("El email es obligatorio"),
  phone: Yup.number()
    .typeError("El teléfono debe ser un número")
    .required("El teléfono es obligatorio"),
  role: Yup.string()
    .trim()
    .required("El rol es obligatorio")
    .min(2, "El rol debe tener al menos 2 caracteres"),
  password: Yup.string()
    .required("La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  repetirPassword: Yup.string()
    .required("Debe repetir la contraseña")
    .oneOf([Yup.ref("password")], "Las contraseñas deben coincidir"),
});

const Registro = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [errorInterfaz, setErrorInterfaz] = useState("");

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

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      repetirPassword: "",
    },
    validationSchema: esquemaRegistro,
    validateOnMount: true,

    onSubmit: async (valores) => {
      setErrorInterfaz("");
      try {
        dispatch(aumentarContadorPeticiones());

        const datosEnvio = {
          name: valores.name.trim(),
          email: valores.email.trim(),
          phone: Number(valores.phone),
          role: valores.role.trim(),
          password: valores.password,
          esAdmin: false,
          puedeModerar: false,
        };

        const resultado = await registerApi(datosEnvio);
        const token = resultado.token;

        const decodificado = jwtDecode(token);

        localStorage.setItem("token", token);
        localStorage.setItem("idUsuario", decodificado.id || "");
        localStorage.setItem("nombreUsuario", decodificado.name || valores.name);
        localStorage.setItem("emailUsuario", decodificado.email || valores.email);
        localStorage.setItem("esPremium", String(Boolean(decodificado.esPremium)));
        localStorage.setItem("esAdmin", String(Boolean(decodificado.esAdmin)));
        localStorage.setItem(
          "puedeModerar",
          String(Boolean(decodificado.puedeModerar)),
        );

        programarVencimiento(token, () => {
          localStorage.clear();
          toast.info("Tu sesión venció. Iniciá sesión nuevamente.");
          navigate("/login", { replace: true });
        });

        toast.success(resultado.message || "Usuario registrado exitosamente");
        navigate("/dashboard");
      } catch (error) {
        const mensaje = extraerMensajeError(
          error,
          "No se pudo completar el registro. Revisá los datos ingresados.",
        );
        setErrorInterfaz(mensaje);
        toast.error(mensaje);
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });

  const hayCamposVaciosOInvalidos =
    !formik.isValid ||
    formik.values.name.trim() === "" ||
    formik.values.email.trim() === "" ||
    String(formik.values.phone).trim() === "" ||
    formik.values.role.trim() === "" ||
    formik.values.password === "" ||
    formik.values.repetirPassword === "" ||
    formik.values.password !== formik.values.repetirPassword ||
    formik.isSubmitting;

  return (
    <div className="auth-wrapper">
      <Card style={{ width: "30rem" }} className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-3 text-center">Registro de Usuario</h3>

          {errorInterfaz && (
            <Alert variant="danger" className="py-2 text-start">
              {errorInterfaz}
            </Alert>
          )}

          <Form onSubmit={formik.handleSubmit} noValidate className="text-start">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formik.values.name}
                    placeholder="Tu nombre"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.name && Boolean(formik.errors.name)
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="phone">
                  <Form.Label>Teléfono</Form.Label>
                  <Form.Control
                    type="number"
                    name="phone"
                    value={formik.values.phone}
                    placeholder="Ej: 99123456"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.phone && Boolean(formik.errors.phone)
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formik.values.email}
                placeholder="correo@ejemplo.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.email && Boolean(formik.errors.email)}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="role">
              <Form.Label>Rol</Form.Label>
              {rolesDisponibles.length > 0 ? (
                <Form.Select
                  name="role"
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.role && Boolean(formik.errors.role)}
                >
                  <option value="">Seleccioná un rol...</option>
                  {rolesDisponibles.map((rol) => (
                    <option key={rol._id || rol.nombre} value={rol.nombre}>
                      {rol.nombre}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  name="role"
                  value={formik.values.role}
                  placeholder="Ingresá el nombre del rol"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.role && Boolean(formik.errors.role)}
                />
              )}
              <Form.Control.Feedback type="invalid">
                {formik.errors.role}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formik.values.password}
                    placeholder="Mínimo 6 caracteres"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="repetirPassword">
                  <Form.Label>Repetir Contraseña</Form.Label>
                  <Form.Control
                    type="password"
                    name="repetirPassword"
                    value={formik.values.repetirPassword}
                    placeholder="Repetí tu contraseña"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.repetirPassword &&
                      Boolean(formik.errors.repetirPassword)
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.repetirPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid gap-2 mt-3">
              <Button
                variant="success"
                type="submit"
                disabled={hayCamposVaciosOInvalidos}
              >
                {formik.isSubmitting ? "Registrando..." : "Registrar"}
              </Button>
            </div>
          </Form>

          <div className="mt-3 text-center">
            <span>¿Ya tenés cuenta? </span>
            <Link to="/login">Iniciá sesión</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Registro;
