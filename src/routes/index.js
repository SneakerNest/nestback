import {Router} from 'express';
import { getAllUsers } from '../controllers/index.js';

const appRouter = Router();

appRouter.get("/", getAllUsers);

export default appRouter;

