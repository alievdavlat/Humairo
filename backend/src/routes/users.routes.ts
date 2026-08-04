import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { isAuthenticated } from "../middleware";

const usersRouter = Router();
usersRouter.get("/me", isAuthenticated, usersController.me);

export default usersRouter;
