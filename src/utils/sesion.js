import { jwtDecode } from "jwt-decode";

let temporizadorId = null;

export const programarVencimiento = (token, alVencer) => {
  clearTimeout(temporizadorId);

  try {
    const { exp } = jwtDecode(token);
    if (!exp) {
      console.warn("El token no tiene fecha de vencimiento (exp).");
      return;
    }
    const milisegundosRestantes = exp * 1000 - Date.now();
    if (milisegundosRestantes <= 0) {
      localStorage.removeItem("token");
      alVencer();
      return;
    }
    temporizadorId = setTimeout(() => {
      localStorage.removeItem("token");
      alVencer();
    }, milisegundosRestantes);
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    localStorage.removeItem("token");
    alVencer();
  }
};

export const cancelarVencimiento = () => {
  clearTimeout(temporizadorId);
  temporizadorId = null;
};
