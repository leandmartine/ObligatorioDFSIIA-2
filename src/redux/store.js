import { configureStore } from "@reduxjs/toolkit";
import publicacionesSlice from "./features/publicacionesSlice.js";
import categoriasSlice from "./features/categoriasSlice.js";
import loadingSlice from "./features/loadingSlice.js";

export const store = configureStore({
  reducer: {
    publicacionesSlice,
    categoriasSlice,
    loadingSlice,
  },
});
