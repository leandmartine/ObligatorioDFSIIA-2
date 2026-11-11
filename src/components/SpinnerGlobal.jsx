import { useSelector } from "react-redux";
import Spinner from "react-bootstrap/Spinner";

const obtenerContadorPeticiones = (state) => {
  return state.loadingSlice.contadorPeticiones;
};

const SpinnerGlobal = () => {
  const cargando = useSelector(obtenerContadorPeticiones) > 0;

  if (!cargando) return null;

  return (
    <div className="spinner-global">
      <Spinner animation="border" variant="primary" />
      <span>Cargando...</span>
    </div>
  );
};

export default SpinnerGlobal;
