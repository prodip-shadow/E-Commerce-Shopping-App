import express from 'express';
import { addAddress, deleteAddress, getAddresses, updateAddress } from '../controllers/address.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const AddressRouter=express.Router();

AddressRouter.get('/', protect,getAddresses);

AddressRouter.post('/', protect,addAddress);

AddressRouter.put('/:id', protect, updateAddress);
AddressRouter.delete('/:id', protect,deleteAddress);

export default AddressRouter;
 