import {Router} from 'express';
import { createUser, getAllUsers } from '../controllers/index.js';

const appRouter = Router();

appRouter.get("/", getAllUsers);
appRouter.post("/test", createUser);

export default appRouter;
