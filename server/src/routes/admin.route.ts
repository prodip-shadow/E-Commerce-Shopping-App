import express from 'express';
import { authorize, protect } from '../middlewares/auth.middleware.js';
import { getDashboardStats } from '../controllers/admin.controller.js';

const AdminRouter = express.Router();

AdminRouter.get('/stats', protect,authorize('admin'),getDashboardStats)

export default AdminRouter;