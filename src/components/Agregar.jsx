import { useState, useEffect, useId, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import { toast } from "react-toastify";

import { agregarPublicacionSlice } from "../redux/features/publicacionesSlice.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";
import { crearPublicacionApi } from "../services/publicacionesServices.js";
import { obtenerRolesApi } from "../services/authServices.js";
import { extraerMensajeError } from "../utils/utils.js";

const LIMITE_PLUS = 4;

const esquemaPublicacion = Yup.object({
  titulo: Yup.string()
    .trim()
    .required("El título es obligatorio")
    .min(5, "El título debe tener al menos 5 caracteres")
    .max(100, "El título no puede superar los 100 caracteres"),
  usoIA: Yup.boolean(),
  descripcion: Yup.string().when("usoIA", ([usoIA], schema) =>
    usoIA
      ? schema.optional()
      : schema
          .trim()
          .required("La descripción es obligatoria (o activá generación con IA)")
          .min(10, "La descripción debe tener al menos 10 caracteres")
          .max(2000, "La descripción no puede superar los 2000 caracteres"),
  ),
  categoria: Yup.string().when("usoIA", ([usoIA], schema) =>
    usoIA
      ? schema.optional()
      : schema.trim().required("La categoría es obligatoria"),
  ),
  precio: Yup.number()
    .typeError("El precio debe ser un número")
    .required("El precio es obligatorio")
    .min(0, "El precio no puede ser negativo"),
  cantidad: Yup.number()
    .typeError("La cantidad debe ser un número")
    .integer("La cantidad debe ser un número entero")
    .required("La cantidad es obligatoria")
    .min(1, "La cantidad debe ser al menos 1"),
  pesosUy: Yup.boolean().required(),
  aceptaPermuta: Yup.boolean().required(),
  nuevo: Yup.boolean().required(),
  alcance: Yup.array()
    .of(Yup.string())
    .min(1, "Seleccioná al menos un rol de alcance")
    .required("El alcance es obligatorio"),
});

const Agregar = () => {
  const dispatch = useDispatch();
  const inputImagenId = useId();
  const inputFileRef = useRef(null);

  const listaPublicaciones = useSelector(
    (state) => state.publicacionesSlice.listaPublicaciones,
  );
  const listaCategorias = useSelector((state) => state.categoriasSlice);
  useSelector((state) => state.loadingSlice.contadorPeticiones);

  const [rolesDisponibles, setRolesDisponibles] = useState([]);
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState("");
  const [errorImagen, setErrorImagen] = useState("");

  const esPremium = localStorage.getItem("esPremium") === "true";
  const cantidadActual = listaPublicaciones ? listaPublicaciones.length : 0;
  const cupoAlcanzado = !esPremium && cantidadActual >= LIMITE_PLUS;

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

  useEffect(() => {
    if (!previewImagen) return;
    return () => {
      URL.revokeObjectURL(previewImagen);
    };
  }, [previewImagen]);

  const limpiarImagen = () => {
    setArchivoImagen(null);
    setPreviewImagen("");
    setErrorImagen("");
    if (inputFileRef.current) {
      inputFileRef.current.value = "";
    }
  };

  const handleFileChange = (evento) => {
    const seleccionado = evento.target.files?.[0];
    if (!seleccionado) return;
    setArchivoImagen(seleccionado);
    setPreviewImagen(URL.createObjectURL(seleccionado));
    setErrorImagen("");
  };

  const formik = useFormik({
    initialValues: {
      titulo: "",
      usoIA: false,
      descripcion: "",
      categoria: "",
      precio: "",
      cantidad: 1,
      pesosUy: true,
      aceptaPermuta: false,
      nuevo: true,
      alcance: [],
    },
    validationSchema: esquemaPublicacion,

    onSubmit: async (valores, { resetForm }) => {
      if (cupoAlcanzado) {
        toast.warning(
          "Alcanzaste el límite de 4 publicaciones del Plan Plus.",
        );
        return;
      }

      if (!archivoImagen) {
        setErrorImagen("La imagen de la publicación es obligatoria");
        toast.error("Seleccioná una imagen para la publicación");
        return;
      }

      try {
        dispatch(aumentarContadorPeticiones());

        const formData = new FormData();
        formData.append("titulo", valores.titulo.trim());
        formData.append("usoIA", String(Boolean(valores.usoIA)));

        if (!valores.usoIA) {
          formData.append("descripcion", valores.descripcion.trim());
          formData.append("categoria", valores.categoria.trim());
        } else if (valores.categoria) {
          formData.append("categoria", valores.categoria.trim());
        }

        formData.append("precio", String(Number(valores.precio)));
        formData.append("cantidad", String(Number(valores.cantidad)));
        formData.append("pesosUy", String(Boolean(valores.pesosUy)));
        formData.append("aceptaPermuta", String(Boolean(valores.aceptaPermuta)));
        formData.append("nuevo", String(Boolean(valores.nuevo)));

        valores.alcance.forEach((nombreRol) => {
          formData.append("alcance", nombreRol);
        });

        formData.append("imagen", archivoImagen);

        const respuesta = await crearPublicacionApi(formData);
        if (respuesta?.nuevaPublicacion) {
          const nuevaPublicacion = respuesta.nuevaPublicacion;
          dispatch(agregarPublicacionSlice(nuevaPublicacion));
          resetForm();
          limpiarImagen();
          toast.success("Publicación agregada correctamente");
        }
      } catch (error) {
        const mensaje = extraerMensajeError(
          error,
          "No se pudo agregar la publicación",
        );
        toast.error(mensaje);
      } finally {
        dispatch(disminuirContadorPeticiones());
      }
    },
  });

  const handleToggleAlcance = (nombreRol) => {
    const actuales = formik.values.alcance;
    if (actuales.includes(nombreRol)) {
      formik.setFieldValue(
        "alcance",
        actuales.filter((r) => r !== nombreRol),
      );
    } else {
      formik.setFieldValue("alcance", [...actuales, nombreRol]);
    }
  };

  return (
    <div className="agregar text-start">
      <h5 className="mb-3">Agregar Nueva Publicación</h5>

      {cupoAlcanzado && (
        <Alert variant="warning">
          Alcanzaste el máximo de <strong>{LIMITE_PLUS} publicaciones</strong>{" "}
          permitidas en el Plan Plus. Eliminá alguna publicación existente o
          cambiate al <strong>Plan Premium</strong> para seguir publicando.
        </Alert>
      )}

      <Form onSubmit={formik.handleSubmit} noValidate>
        <fieldset disabled={cupoAlcanzado || formik.isSubmitting}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="titulo">
                <Form.Label>Título</Form.Label>
                <Form.Control
                  type="text"
                  name="titulo"
                  placeholder="Ej: Notebook Dell Inspiron 15"
                  value={formik.values.titulo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.titulo && Boolean(formik.errors.titulo)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.titulo}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3" controlId="precio">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  name="precio"
                  placeholder="0"
                  value={formik.values.precio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.precio && Boolean(formik.errors.precio)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.precio}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group className="mb-3" controlId="cantidad">
                <Form.Label>Cantidad</Form.Label>
                <Form.Control
                  type="number"
                  name="cantidad"
                  value={formik.values.cantidad}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={
                    formik.touched.cantidad && Boolean(formik.errors.cantidad)
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.cantidad}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="usoIA"
              name="usoIA"
              label="Generar descripción y clasificar categoría automáticamente con IA"
              checked={formik.values.usoIA}
              onChange={formik.handleChange}
            />
          </Form.Group>

          {!formik.values.usoIA && (
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="descripcion">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="descripcion"
                    placeholder="Describí los detalles del artículo (mínimo 10 caracteres)"
                    value={formik.values.descripcion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.descripcion &&
                      Boolean(formik.errors.descripcion)
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.descripcion}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3" controlId="categoria">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select
                    name="categoria"
                    value={formik.values.categoria}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.categoria &&
                      Boolean(formik.errors.categoria)
                    }
                  >
                    <option value="">Seleccioná categoría...</option>
                    {listaCategorias?.map((cat) => (
                      <option key={cat._id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.categoria}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row className="mb-3 align-items-center">
            <Col md={4}>
              <div className="d-flex gap-3 flex-wrap">
                <Form.Check
                  type="checkbox"
                  id="pesosUy"
                  name="pesosUy"
                  label="Precio en Pesos (UYU)"
                  checked={formik.values.pesosUy}
                  onChange={formik.handleChange}
                />
                <Form.Check
                  type="checkbox"
                  id="aceptaPermuta"
                  name="aceptaPermuta"
                  label="Acepta Permuta"
                  checked={formik.values.aceptaPermuta}
                  onChange={formik.handleChange}
                />
                <Form.Check
                  type="checkbox"
                  id="nuevo"
                  name="nuevo"
                  label="Es Nuevo"
                  checked={formik.values.nuevo}
                  onChange={formik.handleChange}
                />
              </div>
            </Col>

            <Col md={4}>
              <Form.Label className="d-block mb-1">
                Alcance (Roles destinatarios):
              </Form.Label>
              <div className="d-flex gap-3 flex-wrap">
                {rolesDisponibles.map((rol) => (
                  <Form.Check
                    key={rol._id || rol.nombre}
                    type="checkbox"
                    id={`alcance_${rol.nombre}`}
                    label={rol.nombre}
                    checked={formik.values.alcance.includes(rol.nombre)}
                    onChange={() => handleToggleAlcance(rol.nombre)}
                  />
                ))}
              </div>
              {formik.touched.alcance && formik.errors.alcance && (
                <div className="text-danger small mt-1">
                  {formik.errors.alcance}
                </div>
              )}
            </Col>

            <Col md={4}>
              <Form.Label className="d-block mb-1">
                Imagen de la publicación:
              </Form.Label>
              <input
                id={inputImagenId}
                ref={inputFileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                hidden
              />
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <label
                  htmlFor={inputImagenId}
                  className="btn btn-outline-primary btn-sm mb-0"
                  style={{ cursor: "pointer" }}
                >
                  Seleccionar archivo
                </label>
                {archivoImagen && (
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    type="button"
                    onClick={limpiarImagen}
                  >
                    Quitar
                  </Button>
                )}
              </div>
              {errorImagen && (
                <div className="text-danger small mt-1">{errorImagen}</div>
              )}
              {previewImagen && (
                <div className="mt-2">
                  <img
                    src={previewImagen}
                    alt="Vista previa"
                    style={{
                      maxHeight: "80px",
                      borderRadius: "6px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}
            </Col>
          </Row>

          <Button variant="primary" type="submit">
            {formik.isSubmitting ? "Agregando..." : "Agregar Publicación"}
          </Button>
        </fieldset>
      </Form>
    </div>
  );
};

export default Agregar;
