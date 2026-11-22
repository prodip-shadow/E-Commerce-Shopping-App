import express from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import upload from "../middlewares/upload.middleware.js";
import { authorize, protect } from "../middlewares/auth.middleware.js";

const ProductsRouter = express.Router();

// Get all products
ProductsRouter.get("/", getProducts);

// Get single product
ProductsRouter.get("/:id", getProduct);

// Create product (Admin Only)
ProductsRouter.post(
  "/",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  createProduct,
);

// Update product (Admin Only)
ProductsRouter.put(
  "/:id",
  protect,
  authorize("admin"),
  upload.array("images", 5),
  updateProduct,
);

// Delete product (Admin Only)
ProductsRouter.delete(
  "/:id",
  protect,
  authorize("admin"),
  deleteProduct,
);



export default ProductsRouter;