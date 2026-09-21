import { Router } from "express";
import {
  requestOtpController,
  verifyOtpController,
} from "../controllers/auth.controller";

const router = Router();

router.post("/request-otp", requestOtpController);
router.post("/verify-otp", verifyOtpController);

export default router;
