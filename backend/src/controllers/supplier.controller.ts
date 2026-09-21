import { Request, Response } from "express";
import {
  createSupplier,
  getSupplierByEmail,
  getSupplierById,
  updateSupplierByEmail,
} from "../services/supplier.service";
import { AuthPayload } from "../middleware/auth.middleware";

export const createSupplierController = async (req: Request, res: Response) => {
  try {
    const { supplierName, contactPerson, email, phone, businessLocation } =
      req.body;

    const supplier = await createSupplier({
      supplierName,
      contactPerson,
      email,
      phone,
      businessLocation,
    });

    res.status(201).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("Create supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create supplier",
    });
  }
};

export const getSupplierController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const supplier = await getSupplierById(id as string);

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("Get supplier error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get supplier",
    });
  }
};

export const getMySupplierProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const supplier = await getSupplierByEmail(user.email);

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
      return;
    }

    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    console.error("Get my supplier profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

export const updateMySupplierProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const { supplierName, contactPerson, phone, businessLocation } = req.body;

    const supplier = await updateSupplierByEmail(user.email, {
      supplierName,
      contactPerson,
      phone: phone === "" ? null : phone,
      businessLocation,
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier profile not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update my supplier profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
