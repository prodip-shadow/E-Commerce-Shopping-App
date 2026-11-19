import express from "express";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const CartRouter = express.Router();

// Get user Cart
CartRouter.get("/", getCart);

// Add Item to Cart
CartRouter.post("/add", protect, addToCart);

// Update cart item quantity
CartRouter.put("/item/:productId", protect, updateCartItem);

// Remove Item from Cart
CartRouter.delete("/item/:productId", protect, removeCartItem);

// Clear Cart
CartRouter.delete("/", protect, clearCart);


export default CartRouter;

