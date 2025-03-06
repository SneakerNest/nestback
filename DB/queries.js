import { pool } from './index.js';

export const find = async () => {
    const QUERY = "SELECT * FROM USER";
    try {
        const client = await pool.getConnection();
        const result = await client.query(QUERY);
        return result[0];
    } catch (error) {
        console.log('error occurred while finding all records: ' + error);
        throw error;
    }
};

export const findByUserName = async (userName) => {
    const QUERY = "SELECT * FROM USER WHERE userName = ?";
    try {
        const client = await pool.getConnection();
        const result = await client.query(QUERY,[userName]);
        return result;
    } catch (error) {
        console.log('error occurred while finding by username ' + error);
        throw error;
    }
};

export const create = async (userName,name,email,password) => {
    const QUERY = `INSERT INTO USER 
            (userName,name,email,password)
            VALUES(?,?,?,?)`;
    try {
        const client = await pool.getConnection();
        const result = await client.query(QUERY,[userName,name,email,password]);
        return result;
    } catch (error) {
        console.log('error occurred while creating a new user' + error);
        throw error;
    }
};

