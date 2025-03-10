import { pool } from '../src/config/database.js';

// Find all users
export const find = async () => {
    const QUERY = "SELECT * FROM USERS";
    try {
        const client = await pool.getConnection();
        const [result] = await client.query(QUERY); // Destructure to get the result array
        return result;
    } catch (error) {
        console.log('Error occurred while finding all records: ' + error);
        throw error;
    }
};

// Find user by username
export const findByUsername = async (username) => {
    const QUERY = "SELECT * FROM USERS WHERE username = ?";
    try {
        const client = await pool.getConnection();
        const [result] = await client.query(QUERY, [username]);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.log('Error occurred while finding by username: ' + error);
        throw error;
    }
};
// Find user by email
export const findByEmail = async (email) => {
    const QUERY = "SELECT * FROM USERS WHERE email = ?";
    try {
        const client = await pool.getConnection();
        const [result] = await client.query(QUERY, [email]);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        console.log('Error occurred while finding by email: ' + error);
        throw error;
    }
};
//Create username
export const create = async (name, username, email, password) => {
    const QUERY = `INSERT INTO USERS (name, username, email, password) VALUES (?, ?, ?, ?)`;
    try {
        const client = await pool.getConnection();
        const [result] = await client.query(QUERY, [name, username, email, password]);

        console.log("Insert Result: ", result);

        if (result && result.affectedRows > 0) {
            return {
                name,
                username,
                email,
            };
        } else {
            throw new Error("Insert operation failed.");
        }
    } catch (error) {
        console.log('Error occurred while creating a new user: ' + error);
        throw error;
    }
};


