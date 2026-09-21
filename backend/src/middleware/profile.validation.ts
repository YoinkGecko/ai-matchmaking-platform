import { Request } from "express";

export const validateUpdateClientProfile = (req: Request) => {
  const errors: Record<string, string> = {};
  const { companyName, contactPerson, phone, email } = req.body;

  if (email !== undefined) {
    errors.email = "Email cannot be changed";
  }

  if (companyName !== undefined) {
    if (typeof companyName !== "string" || companyName.trim().length === 0) {
      errors.companyName = "Company name is required";
    }
  }

  if (contactPerson !== undefined) {
    if (typeof contactPerson !== "string" || contactPerson.trim().length === 0) {
      errors.contactPerson = "Contact person is required";
    }
  }

  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    errors.phone = "Phone must be a string";
  }

  if (
    companyName === undefined &&
    contactPerson === undefined &&
    phone === undefined
  ) {
    errors.body = "At least one field must be provided to update";
  }

  return errors;
};

export const validateUpdateSupplierProfile = (req: Request) => {
  const errors: Record<string, string> = {};
  const { supplierName, contactPerson, phone, businessLocation, email } =
    req.body;

  if (email !== undefined) {
    errors.email = "Email cannot be changed";
  }

  if (supplierName !== undefined) {
    if (typeof supplierName !== "string" || supplierName.trim().length === 0) {
      errors.supplierName = "Supplier name is required";
    }
  }

  if (contactPerson !== undefined) {
    if (typeof contactPerson !== "string" || contactPerson.trim().length === 0) {
      errors.contactPerson = "Contact person is required";
    }
  }

  if (phone !== undefined && phone !== null && typeof phone !== "string") {
    errors.phone = "Phone must be a string";
  }

  if (businessLocation !== undefined) {
    if (
      typeof businessLocation !== "string" ||
      businessLocation.trim().length === 0
    ) {
      errors.businessLocation = "Business location is required";
    }
  }

  if (
    supplierName === undefined &&
    contactPerson === undefined &&
    phone === undefined &&
    businessLocation === undefined
  ) {
    errors.body = "At least one field must be provided to update";
  }

  return errors;
};
