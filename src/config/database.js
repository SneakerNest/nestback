// importing mysql library (database) and dotenv library (environment variables)
import mysql from 'mysql2';
import dotenv from 'dotenv';

// Loading environment variables from a .env 
dotenv.config();

// Abdullah return to know what to do with this!!!!
// creating a connection to the SneakerNest database in the setup.sql file
const db = mysql.createConnection({
    // create an env file make sure its part of the gitignore and put ur db credentials in there
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD,
    database: process.env.NAME 
});

// checking connection to the database
db.connect((err) => {
    if (err) {
        console.error('error connecting: ' + err);
        return;   // if there is an error stop execution
}
    console.log('Successful Connection to the database');
});

// exporting the database connection
export default db;

    