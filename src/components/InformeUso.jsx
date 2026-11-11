import React from "react";
import { useSelector } from "react-redux";
import ProgressBar from "react-bootstrap/ProgressBar";
import Badge from "react-bootstrap/Badge";

const LIMITE_PLUS = 4;

const InformeUso = () => {
  const listaPublicaciones = useSelector(
    (state) => state.publicacionesSlice.listaPublicaciones,
  );
  useSelector((state) => state.loadingSlice.contadorPeticiones);

  const esPremium = localStorage.getItem("esPremium") === "true";

  const cantidadDocumentos = listaPublicaciones ? listaPublicaciones.length : 0;
  const porcentajeUso = Math.min(
    100,
    Math.round((cantidadDocumentos / LIMITE_PLUS) * 100),
  );

  return (
    <div className="seccion-panel text-start h-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0">Informe de Uso</h5>
        <Badge bg={esPremium ? "warning" : "info"} text="dark">
          {esPremium ? "Usuario Premium" : "Usuario Plus"}
        </Badge>
      </div>

      {esPremium ? (
        <div className="mt-3">
          <p className="mb-1 text-muted">
            Cantidad total de publicaciones registradas:
          </p>
          <h3 className="fw-bold text-primary mb-1">{cantidadDocumentos}</h3>
          <small className="text-success">
            Tenés plan Premium: publicaciones ilimitadas y activación inmediata.
          </small>
        </div>
      ) : (
        <div className="mt-3">
          <div className="d-flex justify-content-between mb-1">
            <span>Porcentaje de documentos usados (límite {LIMITE_PLUS}):</span>
            <strong>
              {porcentajeUso}% ({cantidadDocumentos}/{LIMITE_PLUS})
            </strong>
          </div>
          <ProgressBar
            now={porcentajeUso}
            label={`${porcentajeUso}%`}
            variant={
              porcentajeUso >= 100
                ? "danger"
                : porcentajeUso >= 75
                  ? "warning"
                  : "success"
            }
            className="mb-2"
            style={{ height: "20px" }}
          />
          <small className="text-muted">
            {cantidadDocumentos >= LIMITE_PLUS
              ? "Alcanzaste el límite de 4 publicaciones del plan Plus."
              : `Te quedan ${LIMITE_PLUS - cantidadDocumentos} publicaciones disponibles en tu plan Plus.`}
          </small>
        </div>
      )}
    </div>
  );
};

export default InformeUso;
