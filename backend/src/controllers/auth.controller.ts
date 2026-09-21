import { Request, Response } from "express";
import { requestOtp, verifyLoginOtp } from "../services/auth.service";

export async function requestOtpController(req: Request, res: Response) {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        message: "email and role are required",
      });
    }

    if (role !== "CLIENT" && role !== "SUPPLIER" && role !== "ADMIN") {
      return res.status(400).json({
        message: "role must be CLIENT, SUPPLIER, or ADMIN",
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

export async function verifyOtpController(req: Request, res: Response) {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp || !role) {
      return res.status(400).json({
        message: "email, otp and role are required",
      });
    }

    if (role !== "CLIENT" && role !== "SUPPLIER" && role !== "ADMIN") {
      return res.status(400).json({
        message: "role must be CLIENT, SUPPLIER, or ADMIN",
      });
    }

    const result = await verifyLoginOtp(email, otp, role);

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error: any) {
    return res.status(401).json({
      message: error.message,
    });
  }
}
