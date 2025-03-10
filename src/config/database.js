import dotenv from 'dotenv';
import {createPool} from 'mysql2/promise';

dotenv.config();
    
console.log(process.env.DB_HOST);
    
const pool = createPool({
        // create an env file make sure its part of the gitignore and put ur db credentials in there
        host: process.env.DB_HOST, 
        user: process.env.DB_USER, 
        password: process.env.DB_PASSWORD,
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