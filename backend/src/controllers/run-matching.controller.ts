import { Request, Response } from "express";
import { runMatching } from "../services/run-matching.service";

export const runMatchingController = async (req: Request, res: Response) => {
  try {
    const { requirementId } = req.params;

    const matches = await runMatching(requirementId as string);

    res.json({
      requirementId,
      count: matches.length,
      matches,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to run matching",
    });
  }
};
