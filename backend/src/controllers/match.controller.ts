import { Request, Response } from "express";
import { getMatchesForRequirement } from "../services/match.service";

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
