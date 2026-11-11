import { configureStore } from "@reduxjs/toolkit";
import loadingSlice from "./features/loadingSlice.js";

export const store = configureStore({
  reducer: {
    loadingSlice,
  },
});
