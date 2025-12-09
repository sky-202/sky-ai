import { Router } from "express";
import { 
    getMessagesByChatId, 
    updateMsg, 
    deleteMessage 
} from "../controllers/messageController";
import { authorize } from "../middlewares/authMiddleware";

const messageRouter = Router();

// 1. Get all messages for a specific Chat
// URL example: GET /api/message/chat/101
messageRouter.get('/chat/:id', authorize, getMessagesByChatId);

// 2. Update a specific Message (Edit prompt)
// URL example: PUT /api/message/500
messageRouter.put('/:id', authorize, updateMsg);

// 3. Delete a specific Message
// URL example: DELETE /api/message/500
messageRouter.delete('/:id', authorize, deleteMessage);

export default messageRouter;