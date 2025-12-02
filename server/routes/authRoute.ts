import { Router, type Request, type Response } from "express";
import { signUp, logIn, logOut } from "../controllers/authController";

const authRouter = Router();

authRouter.post('/sign-up', signUp); 
authRouter.post('/log-in', logIn); 
authRouter.post('/log-out', logOut); 

export default authRouter;

