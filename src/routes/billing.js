import { Router } from 'express';
import {getBillingInfo,getBillingInfoById,createBillingInfo,updateBillingInfo,deleteBillingInfo} from '../controllers/billingController.js';

const router = Router();


router.get('/', getBillingInfo);
router.get('/:id', getBillingInfoById);
router.post('/', createBillingInfo);
router.put('/:id', updateBillingInfo);
router.delete('/:id', deleteBillingInfo);



export default router;