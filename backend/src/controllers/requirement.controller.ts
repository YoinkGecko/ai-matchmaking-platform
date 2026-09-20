import { Request, Response } from "express";
import {
  clientExists,
  createRequirement,
} from "../services/requirement.service";

export const createRequirementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const clientId = req.params.clientId as string;

    const exists = await clientExists(clientId);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Client not found",
      });
      return;
    }

    const {
      productRequirement,
      category,
      quantityRequired,
      unit,
      specifications,
      qualityGrade,
      additionalNotes,
      budget,
      currency,
      budgetType,
      deliveryLocation,
      requiredByDate,
    } = req.body;

    const requirement = await createRequirement({
      clientId,
      productRequirement,
      category,
      quantityRequired,
      unit,
      specifications,
      qualityGrade,
      additionalNotes,
      budget,
      currency,
      budgetType,
      deliveryLocation,
      requiredByDate,
    });

    res.status(201).json({
      success: true,
      data: requirement,
    });
  } catch (error) {
    console.error("Create requirement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create requirement",
    });
  }
};
