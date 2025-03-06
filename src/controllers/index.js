import {find} from '../../DB/queries.js';

export const getAllUsers = async (req, res) => {
    try{
        const users = await find();
        return res.status(200).json({users});
    } catch(error){
        res.status(500).json({error: error});
    }
};