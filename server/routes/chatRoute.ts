import { Router } from "express";
import { 
    createChat, 
    getChatsByUserId, 
    deleteChatById, 
    updateChatById 
} from "../controllers/chatController";
import { createMessage } from "../controllers/messageController";
import { authorize } from "../middlewares/authMiddleware";

const chatRouter = Router();


// 1. Create a new Chat (Start conversation)
chatRouter.post('/create', authorize, createChat);

// 2. Get all Chats for the logged-in user
chatRouter.get('/all', authorize, getChatsByUserId);

// 3. Update Chat Title
chatRouter.put('/:id', authorize, updateChatById);

// 4. Delete a Chat
chatRouter.delete('/:id', authorize, deleteChatById);

// 5. Send a Message to a specific Chat
// URL example: POST /api/chat/101/message
chatRouter.post('/:id/message', authorize, createMessage);

export default chatRouter;