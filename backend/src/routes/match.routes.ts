import { Router } from "express";
import {
  getMatchDetailHandler,
  getMatches,
  getSupplierMatches,
} from "../controllers/match.controller";
import { runMatchingController } from "../controllers/run-matching.controller";

const router = Router();

router.get("/requirements/:requirementId/matches", getMatches);
router.get("/requirements/:requirementId/matches/:matchId", getMatchDetailHandler);
router.post("/requirements/:requirementId/match", runMatchingController);
router.get("/suppliers/:supplierId/matches", getSupplierMatches);

export default router;
