import { Request, Response } from "express";
import Wishlist from "../models/wishlist.model.js";
import Product from "../models/products.model.js";

// Get user wishlist
// GET /api/wishlist
export const getWishlist = async (req: Request, res: Response) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products",
    );

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const activeProducts = (wishlist.products || []).filter(Boolean);
    res.json({
      success: true,
      data: {
        ...wishlist.toObject(),
        products: activeProducts,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// Toggle product in wishlist
// POST /api/wishlist/toggle
export const toggleWishlist = async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, products: [] });
    }

    const exists = wishlist.products.some(
      (id) => id.toString() === productId.toString(),
    );

    if (exists) {
      wishlist.products = wishlist.products.filter(
        (id) => id.toString() !== productId.toString(),
      );
    } else {
      wishlist.products.push(product._id);
    }

    await wishlist.save();
    await wishlist.populate("products");

    res.json({
      success: true,
      added: !exists,
      data: {
        ...wishlist.toObject(),
        products: (wishlist.products || []).filter(Boolean),
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};
