import { Request, Response } from "express";
import {
  createClient,
  getClientByEmail,
  getClientById,
  updateClientByEmail,
} from "../services/client.service";
import { AuthPayload } from "../middleware/auth.middleware";

export const createClientController = async (req: Request, res: Response) => {
  try {
    const { companyName, contactPerson, email, phone } = req.body;

    const client = await createClient({
      companyName,
      contactPerson,
      email,
      phone,
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Create client error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create client",
    });
  }
};

export const getClientController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const client = await getClientById(id as string);

    if (!client) {
      res.status(404).json({
        success: false,
        message: "Client not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    console.error("Get client error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get client",
    });
  }
};

export const getMyClientProfileController = async (
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

    res.status(200).json({ success: true, data: client });
  } catch (error) {
    console.error("Get my client profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

export const updateMyClientProfileController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user as AuthPayload;
    const { companyName, contactPerson, phone } = req.body;

    const client = await updateClientByEmail(user.email, {
      companyName,
      contactPerson,
      phone: phone === "" ? null : phone,
    });

    if (!client) {
      res.status(404).json({
        success: false,
        message: "Client profile not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: client,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update my client profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
