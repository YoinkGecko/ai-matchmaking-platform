import { Request } from "express";

export const validateClientId = (req: Request) => {
  const errors: Record<string, string> = {};

  const { clientId } = req.params;

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(clientId as string)) {
    errors.clientId = "Invalid client ID";
  }

  return errors;
};

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateRequirementId = (req: Request) => {
  const errors: Record<string, string> = {};
  const { requirementId } = req.params;

  if (!uuidRegex.test(requirementId as string)) {
    errors.requirementId = "Invalid requirement ID";
  }

  return errors;
};

export const validateOfferingId = (req: Request) => {
  const errors: Record<string, string> = {};
  const { offeringId } = req.params;

  if (!uuidRegex.test(offeringId as string)) {
    errors.offeringId = "Invalid offering ID";
  }

  return errors;
};