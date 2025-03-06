import { pool } from './index.js';

export const find = async () => {
    const QUERY = "SELECT * FROM USER";
    try {
        const client = await pool.getConnection();
        const result = await client.query(QUERY);
        console.log(result);
        return result;
    } catch (error) {
        console.log('error occurred while finding all records: ' + error);
        throw error;
    }
};