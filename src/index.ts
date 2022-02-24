import express from 'express';
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cors());

app.get('/', (req, res) => {
    res.send(' process.env');
    console.log(process.env.SECRET_KEY);
    
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});