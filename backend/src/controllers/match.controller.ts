import { Request, Response } from "express";
import {
  getMatchDetail,
  getMatchesForRequirement,
  getMatchesForSupplier,
} from "../services/match.service";

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { requirementId } = req.params;

    const matches = await getMatchesForRequirement(requirementId as string);

    res.json({
      requirementId,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch matches",
    });
  }
};

export const getMatchDetailHandler = async (req: Request, res: Response) => {
  try {
    const { requirementId, matchId } = req.params;

    const match = await getMatchDetail(
      requirementId as string,
      matchId as string,
    );

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.json({ match });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch match detail" });
  }
};

export const getSupplierMatches = async (req: Request, res: Response) => {
  try {
    const { supplierId } = req.params;

    const matches = await getMatchesForSupplier(supplierId as string);

    res.json({
      supplierId,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch supplier matches",
    });
  }
};
