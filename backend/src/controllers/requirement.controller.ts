import { Request, Response } from "express";
import { AuthPayload } from "../middleware/auth.middleware";
import { getClientByEmail } from "../services/client.service";
import {
  diffRequirement,
  notifyRequirementCatalogChange,
} from "../services/catalog-change-notification.service";
import {
  clientExists,
  createRequirement,
  getRequirementsByClientId,
  updateRequirement,
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
      allowMultipleSuppliers,
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
      allowMultipleSuppliers,
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

export const getClientRequirementsController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { clientId } = req.params;

    const exists = await clientExists(clientId as string);

    if (!exists) {
      res.status(404).json({
        success: false,
        message: "Client not found",
      });
      return;
    }

    const requirements = await getRequirementsByClientId(clientId as string);

    res.status(200).json({
      success: true,
      data: requirements,
    });
  } catch (error) {
    console.error("Get client requirements error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get client requirements",
    });
  }
};

export const updateMyRequirementController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const client = await getClientByEmail(user.email);

    if (!client) {
      res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
      return;
    }

    const requirementId = req.params.requirementId as string;

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
      allowMultipleSuppliers,
      requiredByDate,
    } = req.body;

    const result = await updateRequirement(requirementId, client.id, {
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
      allowMultipleSuppliers,
      requiredByDate,
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
      return;
    }

    const changes = diffRequirement(result.before, result.after);
    try {
      await notifyRequirementCatalogChange(requirementId, changes);
    } catch (notifyError) {
      console.error("Requirement change notification error:", notifyError);
    }

    res.status(200).json({
      success: true,
      data: result.after,
      meta: { changesNotified: changes.length },
    });
  } catch (error) {
    console.error("Update requirement error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update requirement",
    });
  }
};
