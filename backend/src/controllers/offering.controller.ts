import { Request, Response } from "express";

import { AuthPayload } from "../middleware/auth.middleware";
import {
  diffOffering,
  notifyOfferingCatalogChange,
} from "../services/catalog-change-notification.service";
import { getSupplierByEmail } from "../services/supplier.service";
import {
  createOffering,
  getOfferingsBySupplierId,
  supplierExists,
  updateOffering,
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

export const updateMyOfferingController = async (req: Request, res: Response) => {
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

    const offeringId = req.params.offeringId as string;

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

    const result = await updateOffering(offeringId, supplier.id, {
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
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Offering not found",
      });
      return;
    }

    const { lines, priceDropPercent } = diffOffering(result.before, result.after);
    try {
      await notifyOfferingCatalogChange(offeringId, lines, priceDropPercent);
    } catch (notifyError) {
      console.error("Offering change notification error:", notifyError);
    }

    res.status(200).json({
      success: true,
      data: result.after,
      meta: {
        changesNotified: lines.length,
        priceDropPercent,
      },
    });
  } catch (error) {
    console.error("Update offering error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update offering",
    });
  }
};
