import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "../../services/apis/authApi";
import { dashboardApi } from "../../services/apis/dashboardApi";
import { usersApi } from "../../services/apis/usersApi";
import { customersApi } from "../../services/apis/customersApi";
import { productsApi } from "../../services/apis/ProductsApi";
import { ordersApi } from "../../services/apis/ordersApi";
import { attendanceApi } from "../../services/apis/attendanceApi";
import { leavesApi } from "../../services/apis/leavesApi";
import { financeApi } from "@/app/services/apis/financeApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
    [leavesApi.reducerPath]: leavesApi.reducer,
    [financeApi.reducerPath]: financeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).concat(
      authApi.middleware,
      dashboardApi.middleware,
      usersApi.middleware,
      customersApi.middleware,
      productsApi.middleware,
      ordersApi.middleware,
      attendanceApi.middleware,
      leavesApi.middleware,
      financeApi.middleware
    ),
});

export default store;
