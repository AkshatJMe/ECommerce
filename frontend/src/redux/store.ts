import { configureStore } from "@reduxjs/toolkit";
import { userAPI } from "../services/userAPI";
import { productAPI } from "../services/productAPI";
import { orderApi } from "../services/orderAPI";
import { dashboardApi } from "../services/dashboardAPI";
import { userReducer } from "./reducer/userReducer";
import { cartReducer } from "./reducer/cartReducer";

export const server = import.meta.env.VITE_SERVER;

export const store = configureStore({
  reducer: {
    [userAPI.reducerPath]: userAPI.reducer,
    [productAPI.reducerPath]: productAPI.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [userReducer.name]: userReducer.reducer,
    [cartReducer.name]: cartReducer.reducer,
  },
  middleware: (mid) => [
    ...mid(),
    userAPI.middleware,
    productAPI.middleware,
    orderApi.middleware,
    dashboardApi.middleware,
  ],
});

export type RootState = ReturnType<typeof store.getState>;
