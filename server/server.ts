import express, { type Request, type Response, json} from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/authRoute';
import userRouter from './routes/userRoute';

const app = express(); 

const port = 3000;

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.use('/auth', authRouter);
app.use('/user', userRouter);

app.get('/', (req: Request, res: Response) => {
    res.send("tu dekh, ab tu dekh, esa app bana dunga kisine dekhi ni hogi...");
})

app.listen(port, () => {
    console.log(`Server is listening to ${port}`);
})