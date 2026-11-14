import React from "react";
import { Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { altaUsuarioPremiumApi } from "../services/usuariosServices.js";
import { programarVencimiento } from "../utils/sesion.js";
import { extraerMensajeError } from "../utils/utils.js";
import {
  aumentarContadorPeticiones,
  disminuirContadorPeticiones,
} from "../redux/features/loadingSlice.js";

const CambioPlan = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useSelector((state) => state.loadingSlice.contadorPeticiones);

  const esPremium = localStorage.getItem("esPremium") === "true";
  const idUsuario = localStorage.getItem("idUsuario");

  const handlerCambiarPlan = async () => {
    if (!idUsuario) {
      toast.error("No se encontró el identificador del usuario en la sesión.");
      return;
    }

    try {
      dispatch(aumentarContadorPeticiones());
      const resultado = await altaUsuarioPremiumApi(idUsuario);

      if (resultado?.token) {
        localStorage.setItem("token", resultado.token);
        programarVencimiento(resultado.token, () => {
          localStorage.clear();
          toast.info("Tu sesión venció. Iniciá sesión nuevamente.");
          navigate("/login", { replace: true });
        });
      }

      localStorage.setItem("esPremium", "true");
      toast.success("Tu cuenta fue actualizada al Plan Premium exitosamente.");
    } catch (error) {
      const mensaje = extraerMensajeError(
        error,
        "No se pudo realizar el cambio de plan.",
      );
      toast.error(mensaje);
    } finally {
      dispatch(disminuirContadorPeticiones());
    }
  };

  return (
    <div className="seccion-panel text-start h-100 d-flex flex-column justify-content-between">
      <div>
        <h5 className="mb-2">Plan de Suscripción</h5>
        {esPremium ? (
          <p className="text-muted mb-0">
            Ya contás con el <strong>Plan Premium</strong> activo. Podés crear
            publicaciones sin límite de cantidad y se publican directamente sin
            espera de moderación.
          </p>
        ) : (
          <p className="text-muted mb-3">
            Estás en el <strong>Plan Plus</strong> (hasta 4 publicaciones). Pasate
            a <strong>Plan Premium</strong> para publicar sin límites.
          </p>
        )}
      </div>

      {!esPremium && (
        <div className="mt-2">
          <Button variant="warning" onClick={handlerCambiarPlan}>
            Cambiar a Plan Premium
          </Button>
        </div>
      )}
    </div>
  );
};

export default CambioPlan;
