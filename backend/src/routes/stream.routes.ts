import { Router } from "express";
import { streamController } from "../controllers/stream.controller";
import { isAuthenticated } from "../middleware";

const streamRouter = Router();
streamRouter.post("/token", isAuthenticated ,streamController.createStreamToken);

export default streamRouter;

