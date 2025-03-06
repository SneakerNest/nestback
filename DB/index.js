import {createPool} from 'mysql2/promise';
import {config} from 'dotenv';
config();

const pool = createPool({
    port: process.env.DB_PORT,
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const connectToDatabase = async () => {
    try{
        await pool.getConnection();
        console.log('Successful Connection to the database');
    } catch(error){
        console.log('error connecting: ' + error);
        throw error;
    }
};

export{connectToDatabase, pool};