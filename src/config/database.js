import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectToDatabase = async () => {
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 2000; // 2 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const connection = await pool.getConnection();
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

export { pool, connectToDatabase };