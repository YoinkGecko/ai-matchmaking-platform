import { Router } from "express";
import { getMatches } from "../controllers/match.controller";

const router = Router();

router.get("/requirements/:requirementId/matches", getMatches);

export default router;
