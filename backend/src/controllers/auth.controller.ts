import { Request, Response } from "express";
import { requestOtp } from "../services/auth.service";

export async function requestOtpController(req: Request, res: Response) {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        message: "email and role are required",
      });
    }

    if (role !== "CLIENT" && role !== "SUPPLIER") {
      return res.status(400).json({
        message: "role must be CLIENT or SUPPLIER",
      });
    }

    const result = await requestOtp(email, role);

    return res.status(200).json({
      message: "OTP sent successfully",
      ...result,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
}
