import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import db from './database/db';
const app = express();
const port = 5000;
import routes from './routes'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());
app.use(routes);

app.get('/', (req, res) => {
    res.send(`${process.env.DB_DATABASE}`);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});