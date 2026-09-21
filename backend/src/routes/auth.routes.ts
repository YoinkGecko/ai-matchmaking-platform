import { Router } from "express";
import { requestOtpController } from "../controllers/auth.controller";

const router = Router();

router.post("/request-otp", requestOtpController);

export default router;
