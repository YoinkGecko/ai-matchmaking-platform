import { Request, Response } from "express";

import {
  createOffering,
  getOfferingsBySupplierId,
  supplierExists,
} from "../services/offering.service";
import { offeringPhotoPublicPaths } from "../middleware/upload.middleware";

export const createOfferingController = async (req: Request, res: Response) => {
  try {
    const supplierId = req.params.supplierId as string;

    const exists = await supplierExists(supplierId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
      return;
    }

    const {
      productOffered,
      category,
      availableQuantity,
      unit,
      specifications,
      qualityGrade,
      price,
      currency,
      priceType,
      pricingNotes,
      fulfillmentLocation,
      minimumDeliveryDays,
      maximumDeliveryDays,
      additionalNotes,
    } = req.body;

    const photoUrls = offeringPhotoPublicPaths(
      req.files as Express.Multer.File[] | undefined,
    );

    const offering = await createOffering({
      supplierId,
      productOffered,
      category,
      availableQuantity,
      unit,
      specifications,
      qualityGrade,
      price,
      currency,
      priceType,
      pricingNotes,
      fulfillmentLocation,
      minimumDeliveryDays,
      maximumDeliveryDays,
      additionalNotes,
      photoUrls,
    });

    res.status(201).json({
      success: true,
      data: offering,
    });
  } catch (error) {
    console.error("Create offering error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create offering",
    });
  }
};

export const getSupplierOfferingsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const supplierId = req.params.supplierId as string;

    const exists = await supplierExists(supplierId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
      return;
    }

    const offerings = await getOfferingsBySupplierId(supplierId);

    res.status(200).json({
      success: true,
      data: offerings,
    });
  } catch (error) {
    console.error("Get supplier offerings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get supplier offerings",
    });
  }
};
