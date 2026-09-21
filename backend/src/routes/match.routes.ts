import { Router } from "express";
import { getMatches } from "../controllers/match.controller";
import { runMatchingController } from "../controllers/run-matching.controller";

const router = Router();

router.get("/requirements/:requirementId/matches", getMatches);
router.post("/requirements/:requirementId/match", runMatchingController);

export default router;
