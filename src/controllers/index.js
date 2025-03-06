import {find, create} from '../../DB/queries.js';

export const getAllUsers = async (req, res) => {
    try{
        const users = await find();
        return res.status(200).json({users});
    } catch(error){
        res.status(500).json({error: error});
    }
};

export const createUser = async (req,res) =>{
    const {userName,name, email, password} = req.body;

    if(!userName || !name || !email || !password){
        return res.status(400).json({message:"Input Parameters were not provided"});
    }
    try{
        const user = await create(userName, name, email, password);
        return res.status(201).json({user});
    } catch (error){
        console.log("error occurred during user creation", error);
        res.status(500).json({error: error});
    }

};