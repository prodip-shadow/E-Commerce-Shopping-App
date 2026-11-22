import { Request, Response } from "express";
import Address from "../models/address.model.js";

// Get user address
// GET /api/addresses
export const getAddresses = async (req: Request, res: Response) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({
      isDefault: -1,
      createdAt: -1,
    });
    res.json({ success: true, addresses });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// Add a new address
// POST /api/addresses
export const addAddress = async (req: Request, res: Response) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const newAddress = await Address.create({
      user: req.user._id,
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false,
    });

    res.status(201).json({ success: true, address: newAddress });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};

// Update an address
// PUT /api/addresses/:id
export const updateAddress = async (req: Request, res: Response) => {
  try {
    const { type, street, city, state, zipCode, country, isDefault } = req.body;

    let addressItem = await Address.findById(req.params.id);
    if (!addressItem) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // Ensure the address belongs to the user
    if (addressItem.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    addressItem = await Address.findByIdAndUpdate(
      req.params.id,
      { type, street, city, state, zipCode, country, isDefault },
      { new: true },
    );

    res.status(201).json({ success: true, address: addressItem });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};





// Delete an address
// DELETE /api/addresses/:id
export const deleteAddress = async (req: Request, res: Response) => {
  try {

    const address = await Address.findById(req.params.id);
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    // Ensure the address belongs to the user
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await address.deleteOne();

    res.status(201).json({ success: true, message: "Address Removed" });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: error.message || "Server Error" });
  }
};
