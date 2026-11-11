import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Rutas from "./components/Rutas.jsx";
import SpinnerGlobal from "./components/SpinnerGlobal.jsx";

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SpinnerGlobal />
    <ToastContainer position="top-right" autoClose={3000} />
    <Rutas />
  </Provider>,
);
