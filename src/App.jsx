import "./App.css";
import "./styles/estilos.css";
import Contenido from "./components/Contenido.jsx";
import Menu from "./components/Menu.jsx";

const App = () => {
  return (
    <>
      <Menu />
      <Contenido></Contenido>
    </>
  );
};

export default App;
