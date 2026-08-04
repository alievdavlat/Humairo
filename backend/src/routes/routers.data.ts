import type { Router } from "express";
import usersRouter from "./users.routes";
import productsRouter from "./products.routes";
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
];
