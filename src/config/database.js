import mysql from 'mysql2'; // Ensure you are importing mysql2 correctly
import dotenv from 'dotenv';

dotenv.config();

// For testing, use in-memory or mock DB
const isTest = process.env.NODE_ENV === 'test';

const pool = mysql.createPool({
    host: isTest ? 'localhost' : (process.env.DB_HOST || 'db'), 
    user: isTest ? 'root' : process.env.MYSQLDB_USER,  
    password: isTest ? 'yourpassword' : process.env.MYSQLDB_ROOT_PASSWORD,  
    database: isTest ? 'sneaker_nest_test' : process.env.MYSQLDB_DATABASE,
    port: process.env.MYSQLDB_DOCKER_PORT || 3306,  
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Make sure you are using the promise-based API
const promisePool = pool.promise();

const connectToDatabase = async () => {
    // Skip actual connection during tests
    if (isTest) {
        console.log('⏩ Skipping real database connection in test mode');
        return;
    }
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