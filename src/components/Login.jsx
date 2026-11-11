import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Alert from "react-bootstrap/Alert";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";

import { loginApi } from "../services/authServices.js";
import { programarVencimiento } from "../utils/sesion.js";
import { extraerMensajeError } from "../utils/utils.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";

const esquemaLogin = Yup.object({
  email: Yup.string()
    .email("El email debe ser una dirección de correo válida")
    .required("El email es obligatorio"),
  password: Yup.string().required("La contraseña es obligatoria"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorInterfaz, setErrorInterfaz] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema: esquemaLogin,

    onSubmit: async (valores) => {
      setErrorInterfaz("");
      try {
        dispatch(aumentarContadorPeticiones());

        const resultado = await loginApi(valores);
        const token = resultado.token;

        const decodificado = jwtDecode(token);

        localStorage.setItem("token", token);
        localStorage.setItem("idUsuario", decodificado.id || "");
        localStorage.setItem("nombreUsuario", decodificado.name || "");
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

        toast.success(resultado.message || "Bienvenido");
        navigate("/dashboard");
      } catch (error) {
        const mensaje = extraerMensajeError(
          error,
          "No se pudo iniciar sesión. Revisá tus datos.",
        );
        setErrorInterfaz(mensaje);
        toast.error(mensaje);
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });

  const deshabilitarIngresar =
    formik.values.email.trim() === "" ||
    formik.values.password.trim() === "" ||
    formik.isSubmitting;

  return (
    <div className="auth-wrapper">
      <Card style={{ width: "24rem" }} className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-3 text-center">Iniciar Sesión</h3>

          {errorInterfaz && (
            <Alert variant="danger" className="py-2 text-start">
              {errorInterfaz}
            </Alert>
          )}

          <Form onSubmit={formik.handleSubmit} noValidate className="text-start">
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formik.values.email}
                placeholder="Ingresá tu email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={
                  formik.touched.email && Boolean(formik.errors.email)
                }
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formik.values.password}
                placeholder="Ingresá tu contraseña"
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

            <div className="d-grid gap-2 mt-4">
              <Button
                variant="primary"
                type="submit"
                disabled={deshabilitarIngresar}
              >
                {formik.isSubmitting ? "Ingresando..." : "Iniciar sesión"}
              </Button>
            </div>
          </Form>

          <div className="mt-3 text-center">
            <span>¿No tenés cuenta? </span>
            <Link to="/registro">Registrate acá</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
