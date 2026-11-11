import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  contadorPeticiones: 0,
};

const loadingSlice = createSlice({
  name: "loadingSlice",
  initialState,
  reducers: {
    aumentarContadorPeticiones: (state) => {
      const nuevoContador = state.contadorPeticiones + 1;
      state.contadorPeticiones = nuevoContador;
    },
    disminuirContadorPeticiones: (state) => {
      let nuevoContador = state.contadorPeticiones;
      if (state.contadorPeticiones > 0) {
        nuevoContador = state.contadorPeticiones - 1;
      }
      state.contadorPeticiones = nuevoContador;
    },
  },
});

export const { aumentarContadorPeticiones, disminuirContadorPeticiones } =
  loadingSlice.actions;
export default loadingSlice.reducer;
