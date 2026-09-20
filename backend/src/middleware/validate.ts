import { Request, Response, NextFunction } from "express";

type Validator = (req: Request) => Record<string, string>;

export const validate = (validator: Validator) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validator(req);

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
      return;
    }

    next();
  };
};
