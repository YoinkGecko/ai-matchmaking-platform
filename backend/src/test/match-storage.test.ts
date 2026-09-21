import { saveMatch } from "../services/match.service";

async function main() {
  const match = await saveMatch({
  requirementId: "1a6e967a-1d16-4cad-ad60-a84b0b8ba533",

  offeringId: "142c1071-9130-4333-978d-cf233f132894",

  supplierId: "643f3fa0-7a0a-4765-bc90-9624ac9c4a71",

  score: 0.8745,
  percentage: 87,

  semanticScore: 0.8745,

  productDecision: "EXACT_MATCH",

  quantityCoverage: 1,

  budgetStatus: "WITHIN_BUDGET",

  deliveryStatus: "ON_TIME",

  productReason: "Supplier directly offers the requested product.",

  budgetExplanation: "Supplier price is within the client's budget.",

  deliveryExplanation: "Supplier can deliver before the deadline.",
  });

  console.log("Saved match:");
  console.dir(match, {
    depth: null,
  });
}

void main();
