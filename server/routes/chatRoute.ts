import { Router } from "express";
import { createChat } from "../controllers/chatController";
import { authorize } from "../middlewares/authMiddleware";
import { createMessage } from "../controllers/messageController";

const chatRouter = Router();


chatRouter.post('/create-chat', authorize, createChat);
chatRouter.post('/create-chat/:id/message', createMessage)

export default chatRouter;

