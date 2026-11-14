import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  listaPublicaciones: [],
  search: "",
  categoriaFiltro: "",
  versionMarketplace: 0,
};

const publicacionesSlice = createSlice({
  name: "publicacionesSlice",
  initialState,
  reducers: {
    cargarPublicacionesInicialesSlice: (state, action) => {
      const listaPublicaciones = action.payload;
      state.listaPublicaciones = listaPublicaciones;
    },
    cambiarTituloPublicacionSlice: (state, action) => {
      const { id, titulo, precio } = action.payload;
      const publicacionEncontrada = state.listaPublicaciones.find(
        (pub) => pub._id === id,
      );
      if (publicacionEncontrada) {
        publicacionEncontrada.titulo = titulo;
        if (precio !== undefined) {
          publicacionEncontrada.precio = precio;
        }
      }
      state.versionMarketplace += 1;
    },
    modificarPublicacionSlice: (state, action) => {
      const publicacionActualizada = action.payload;
      const indice = state.listaPublicaciones.findIndex(
        (pub) => pub._id === publicacionActualizada._id,
      );
      if (indice !== -1) {
        state.listaPublicaciones[indice] = publicacionActualizada;
      }
      state.versionMarketplace += 1;
    },
    agregarPublicacionSlice: (state, action) => {
      const publicacion = action.payload;
      state.listaPublicaciones.push(publicacion);
      state.versionMarketplace += 1;
    },
    borrarPublicacionSlice: (state, action) => {
      const id = action.payload;
      state.listaPublicaciones = state.listaPublicaciones.filter(
        (pub) => pub._id !== id,
      );
      state.versionMarketplace += 1;
    },
    notificarCambioMarketplaceSlice: (state) => {
      state.versionMarketplace += 1;
    },
    modificarSearchSlice: (state, action) => {
      const searchAux = action.payload;
      state.search = searchAux;
    },
    modificarCategoriaFiltroSlice: (state, action) => {
      const categoriaAux = action.payload;
      state.categoriaFiltro = categoriaAux;
    },
  },
});

export const {
  cargarPublicacionesInicialesSlice,
  cambiarTituloPublicacionSlice,
  modificarPublicacionSlice,
  agregarPublicacionSlice,
  borrarPublicacionSlice,
  notificarCambioMarketplaceSlice,
  modificarSearchSlice,
  modificarCategoriaFiltroSlice,
} = publicacionesSlice.actions;

export default publicacionesSlice.reducer;

export const filtrarPublicacionesPorSearch = (state) => {
  const search = state.publicacionesSlice.search;
  const categoriaFiltro = state.publicacionesSlice.categoriaFiltro;
  const listaPublicaciones = state.publicacionesSlice.listaPublicaciones;

  return listaPublicaciones?.filter((p) => {
    const coincideTexto =
      search.trim() === "" ||
      p.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      p.descripcion?.toLowerCase().includes(search.toLowerCase());

    const coincideCategoria =
      categoriaFiltro === "" || String(p.categoria) === String(categoriaFiltro);

    return coincideTexto && coincideCategoria;
  });
};
