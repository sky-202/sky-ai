import { Router } from "express";
import { getUsers, getUser } from "../controllers/userController";

const userRouter = Router();

userRouter.get('/get-users', getUsers)
userRouter.get('/get-user', getUser)

export default userRouter;
