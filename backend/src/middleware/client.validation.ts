import { Request } from "express";

export const validateCreateClient = (req: Request) => {
  const errors: Record<string, string> = {};

  const { companyName, contactPerson, email, phone } = req.body;

  if (typeof companyName !== "string" || companyName.trim().length === 0) {
    errors.companyName = "Company name is required";
  }

  if (typeof contactPerson !== "string" || contactPerson.trim().length === 0) {
    errors.contactPerson = "Contact person is required";
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Valid email is required";
  }

  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    errors.phone = "Phone must be a string";
  }

  return errors;
};
