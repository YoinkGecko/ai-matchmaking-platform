import express from "express";
import cors from "cors";

import clientRoutes from "./routes/client.routes";
import requirementRoutes from "./routes/requirement.routes";
import supplierRoutes from "./routes/supplier.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/clients", clientRoutes);
app.use("/api", requirementRoutes);
app.use("/api/suppliers", supplierRoutes);

export default app;
