import { Router } from "express";
import { createChat } from "../controllers/chatController";
import { authorize } from "../middlewares/authMiddleware";

const chatRouter = Router();


chatRouter.post('/create-chat', authorize, createChat);

export default chatRouter;