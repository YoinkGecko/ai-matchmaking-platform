import { Request, Response } from "express";
import { listMarketplaceOfferings } from "../services/marketplace.service";

export const marketplaceOfferingsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const data = await listMarketplaceOfferings();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load marketplace offerings",
    });
  }
};
