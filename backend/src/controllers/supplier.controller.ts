import { Request, Response } from "express";
import { createSupplier, getSupplierById } from "../services/supplier.service";

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
