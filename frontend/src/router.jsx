import { createBrowserRouter } from "react-router";
import App from "./App.jsx";
import RequireAuth from "./components/require-auth.jsx";
import RouteError from "./components/route-error.jsx";
import PageLoader from "./components/page-loader.jsx";

const page = (load) => async () => ({ Component: (await load()).default });

export const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    ErrorBoundary: RouteError,
    HydrateFallback: PageLoader,
    children: [
      {
        ErrorBoundary: RouteError,
        children: [
          { index: true, lazy: page(() => import("./pages/home.jsx")) },
          {
            path: "products/:slug",
            lazy: page(() => import("./pages/product.jsx")),
          },
          { path: "cart", lazy: page(() => import("./pages/cart.jsx")) },
          {
            path: "checkout/return",
            lazy: page(() => import("./pages/checkout-return.jsx")),
          },
          {
            Component: RequireAuth,
            children: [
              {
                path: "orders",
                lazy: page(() => import("./pages/orders.jsx")),
              },
              {
                path: "orders/:id",
                lazy: page(() => import("./pages/order.jsx")),
              },
              {
                path: "orders/:id/call",
                lazy: page(() => import("./pages/order-call.jsx")),
              },
            ],
          },
          { path: "*", lazy: page(() => import("./pages/not-found.jsx")) },
        ],
      },
    ],
  },
]);
