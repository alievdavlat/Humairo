import type { Router } from "express";
import usersRouter from "./users.routes";
import productsRouter from "./products.routes";
import streamRouter from "./stream.routes";
import checkoutRouter from "./checkout.routes";
import adminRouter from "./admin.routes";

interface RouteItem {
  path: string;
  handler: Router;
}

export const routesData: RouteItem[] = [
  {
    path: "/users",
    handler: usersRouter,
  },
  {
    path: "/products",
    handler: productsRouter,
  },
  {
    path: "/stream",
    handler: streamRouter,
  },
  {
    path: "/checkout",
    handler: checkoutRouter,
  },
  {
    path: "/admin",
    handler: adminRouter,
  },
];
