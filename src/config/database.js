import mysql from 'mysql2'; // Ensure you are importing mysql2 correctly
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'db', 
    user: process.env.MYSQLDB_USER,  
    password: process.env.MYSQLDB_ROOT_PASSWORD,  
    database: process.env.MYSQLDB_DATABASE,  
    port: process.env.MYSQLDB_DOCKER_PORT || 3306,  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Make sure you are using the promise-based API
const promisePool = pool.promise();

const connectToDatabase = async () => {
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 5000; 
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const connection = await promisePool.getConnection();
            console.log('✅ Connected to MySQL in Docker');
            connection.release();
            return; // Success, exit the function
        } catch (error) {
            console.error(`❌ Database connection attempt ${attempt} failed:`, error.message);
            if (attempt === MAX_RETRIES) {
                console.error('❌ Max retries reached. Exiting...');
                process.exit(1);
            }
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
};

export { promisePool as pool, connectToDatabase };