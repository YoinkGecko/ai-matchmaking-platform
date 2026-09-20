import { Router } from "express";

import {
  createSupplierController,
  getSupplierController,
} from "../controllers/supplier.controller";

const router = Router();

router.post("/", createSupplierController);
router.get("/:id", getSupplierController);

export default router;
