import { Router } from "express";
import { getMessagesByChatId } from "../controllers/messageController";

const messageRouter = Router();

messageRouter.get('get-messages', getMessagesByChatId)

export default messageRouter;

