import express, { type Request, type Response, json} from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/authRoute';
import userRouter from './routes/userRoute';
import messageRouter from './routes/messageRoute';
import chatRouter from './routes/chatRoute';

const app = express(); 

const port = process.env.PORT || 3000;

app.use(cors({
    origin: [
            "http://localhost:5173", 
            "https://sky-ai-server.onrender.com"
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/chat', chatRouter);
app.use('/message', messageRouter);

app.get('/', (req: Request, res: Response) => {
    res.send("tu dekh, ab tu dekh, esa app bana dunga kisine dekhi ni hogi...");
})

app.listen(port, () => {
    console.log(`Server is listening to ${port}`);
})