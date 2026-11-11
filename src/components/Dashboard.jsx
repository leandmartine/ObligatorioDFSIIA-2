import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import App from "../App.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const [estaLogueado, setEstaLogueado] = useState(false);

  const validarLogin = () => {
    const token = window.localStorage.getItem("token");
    const logueado = token ? true : false;
    if (!logueado) {
      navigate("/login");
    } else {
      setEstaLogueado(logueado);
    }
  };

  useEffect(() => {
    validarLogin();
  });

  return (
    <>
      {estaLogueado ? (
        <div>
          <App />
        </div>
      ) : (
        <p>Cargando</p>
      )}
    </>
  );
};

export default Dashboard;
