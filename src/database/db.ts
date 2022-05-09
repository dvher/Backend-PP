import mysql from 'mysql2';
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT ?? '3306')
});

let escape = mysql.escape;
let format = mysql.format;

connection.connect((err: any) => {
    if(err) {
        console.log(err);
        return;
    }
    console.log('Connected to database');
});

export default connection;
export { escape, format}
