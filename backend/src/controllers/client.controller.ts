import { Request, Response } from "express";
import { createClient, getClientById } from "../services/client.service";

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
