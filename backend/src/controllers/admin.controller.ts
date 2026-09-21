import { Request, Response } from "express";
import {
  getOverview,
  listClients,
  listMatches,
  listOfferings,
  listRequirements,
  listSuppliers,
  listUsers,
} from "../services/admin.service";

export const adminOverviewController = async (_req: Request, res: Response) => {
  try {
    const data = await getOverview();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load overview" });
  }
};

export const adminUsersController = async (_req: Request, res: Response) => {
  try {
    const data = await listUsers();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
};

export const adminClientsController = async (_req: Request, res: Response) => {
  try {
    const data = await listClients();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load clients" });
  }
};

export const adminSuppliersController = async (_req: Request, res: Response) => {
  try {
    const data = await listSuppliers();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load suppliers" });
  }
};

export const adminRequirementsController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const data = await listRequirements();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load requirements",
    });
  }
};

export const adminOfferingsController = async (_req: Request, res: Response) => {
  try {
    const data = await listOfferings();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load offerings" });
  }
};

export const adminMatchesController = async (_req: Request, res: Response) => {
  try {
    const data = await listMatches();
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load matches" });
  }
};
