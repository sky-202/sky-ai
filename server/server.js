import express from 'express';

const app = express();

const port = 3000;

app.get('/', (req, res) => {
    res.send("tu dekh, ab tu dekh, esa app bana dunga kisine dekhi ni hogi...");
})

app.listen(port, () => {
    console.log(`Server is listening to ${port}`);
})