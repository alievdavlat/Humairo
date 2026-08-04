import { Router } from "express";
import { routesData } from "./routers.data";

const Routes = Router();
routesData.forEach((route) => {
  Routes.use(route.path, route.handler);
});

export default Routes;
