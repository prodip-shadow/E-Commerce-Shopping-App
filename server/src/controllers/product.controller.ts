import { Request, Response } from "express";
import Product from "../models/products.model.js";
import cloudinary from "../config/cloudinary.js";

// Get all products
// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query: any = { isActive: true };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Product
// GET /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Product
// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
  try {
    let images = [];
    if (req.files && (req.files as any).length > 0) {
      const uploadPromises = (req.files as any).map((file: any) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "ecom-app/products" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result!.secure_url);
              }
            },
          );

          uploadStream.end(file.buffer);
        });
      });

      images = await Promise.all(uploadPromises);
    }

    let sizes = req.body.sizes || [];
    if (typeof sizes === "string") {
      try {
        sizes = JSON.parse(sizes);
      } catch (error) {
        sizes = sizes
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s !== "");
      }
    }

    // Ensure they are arrays
    if (!Array.isArray(sizes)) sizes = [sizes];

    const productData = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock || 0),
      isFeatured:
        req.body.isFeatured === "true" || req.body.isFeatured === true,
      images: images,
      sizes,
    };

    if (images.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const product = await Product.create(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    const status =
      error.name === "ValidationError" || error.name === "CastError" ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Update Product
// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
  try {
    let images: string[] = [];

    if (req.body.existingImages) {
      if (Array.isArray(req.body.existingImages)) {
        images = [...req.body.existingImages];
      } else {
        images = [req.body.existingImages];
      }
    }

    if (req.files && (req.files as any).length > 0) {
      const uploadPromises = (req.files as any).map((file: any) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "ecom-app/products" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result!.secure_url);
              }
            },
          );

          uploadStream.end(file.buffer);
        });
      });
      const newImages = await Promise.all(uploadPromises);
      images = [...images, ...newImages];
    }

    const updates = { ...req.body };

    if (req.body.sizes) {
      let sizes = req.body.sizes;
      if (typeof sizes === "string") {
        try {
          sizes = JSON.parse(sizes);
        } catch (error) {
          sizes = sizes
            .split(",")
            .map((s: string) => s.trim())
            .filter((s: string) => s !== "");
        }
      }
      if (!Array.isArray(sizes)) sizes = [sizes];
      updates.sizes = sizes;
    }

    if (
      req.body.existingImages ||
      (req.files && (req.files as any).length > 0)
    ) {
      updates.images = images;
    }

    delete updates.existingImages; // Remove existingImages from updates

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: product });

  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};




// Delete Product
// DELETE /api/products/:id

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // delete images from cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        const publicIdmatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
        const publicId = publicIdmatch ? publicIdmatch[1] : null;
        if (publicId) {
          return cloudinary.uploader.destroy(publicId);
        }
        return Promise.resolve(); // If no publicId, resolve immediately
      });
      await Promise.all(deletePromises);
    }     

    await Product.findByIdAndDelete(req.params.id); 
    
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
