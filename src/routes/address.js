import { Router } from 'express';
import { getAddress, getUserAddress,getPersonalAddress, createAddress, updateAddress,deleteAddress} from '../controllers/addressController.js';
const router = Router();


router.get('/:addressid', getAddress);
router.get('/user/:username', getUserAddress);
router.get('/personal/me', getPersonalAddress);
router.post('/', createAddress);
router.put('/:addressid', updateAddress);
router.delete('/:addressid', deleteAddress);



export default router;