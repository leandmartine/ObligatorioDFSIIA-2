import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const categoriasSlice = createSlice({
  name: "categoriasSlice",
  initialState,
  reducers: {
    cargaInicialCategoriasSlice: (state, action) => {
      const listaCategorias = action.payload;
      return listaCategorias;
    },
    crearCategoriaSlice: (state, action) => {
      const categoria = action.payload;
      state.push(categoria);
    },
    actualizarCategoriaSlice: (state, action) => {
      const categoriaActualizada = action.payload;
      const indice = state.findIndex(
        (cat) => cat._id === categoriaActualizada._id,
      );
      if (indice !== -1) {
        state[indice] = categoriaActualizada;
      }
    },
    borrarCategoriaSlice: (state, action) => {
      const id = action.payload;
      return state.filter((cat) => cat._id !== id);
    },
  },
});

export const {
  cargaInicialCategoriasSlice,
  crearCategoriaSlice,
  actualizarCategoriaSlice,
  borrarCategoriaSlice,
} = categoriasSlice.actions;

export default categoriasSlice.reducer;
