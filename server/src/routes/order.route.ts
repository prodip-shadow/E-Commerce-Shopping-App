import express from "express";
import { createOrder, getAllOrders, getOrders, updateOrder } from "../controllers/order.controller.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";


const OrderRouter = express.Router();

// Get user orders
OrderRouter.get("/", getOrders);

// Get Single Order
OrderRouter.get("/:id",protect, getOrders);

// create Order
OrderRouter.post("/", protect, createOrder);

// Update Order Status(Admin only)
OrderRouter.put("/:id/status", protect, authorize('admin') ,updateOrder);

// Get all orders (Admin only)
OrderRouter.get("/admin/all", protect, authorize('admin'), getAllOrders);

export default OrderRouter;