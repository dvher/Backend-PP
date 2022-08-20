import express from 'express';
import bodyParser from 'body-parser';   
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import csrf from 'csurf';

dotenv.config();
const app = express();
const port = 5000;
import routes from './routes';

const csrfProtection = csrf({ cookie: true });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(csrfProtection);
app.use(cookieParser());
app.use(cors());
app.use(routes);

app.get('/getCSRFToken', (req, res) => {

    res.json({ CSRFToken: req.csrfToken() })

});

app.get('/', (req, res) => {
    res.send(`${process.env.DB_DATABASE}`);
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});