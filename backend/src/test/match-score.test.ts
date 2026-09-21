import { calculateMatchScore } from "../services/match-score.service";

const excellent = calculateMatchScore({
  semanticScore: 0.92,
  productDecision: "EXACT_MATCH",
  quantityCoverage: 1,
  budgetStatus: "WITHIN_BUDGET",
  deliveryStatus: "ON_TIME",
});

console.log("Excellent match:");
console.log(excellent);

const partial = calculateMatchScore({
  semanticScore: 0.87,
  productDecision: "CLOSE_MATCH",
  quantityCoverage: 0.7,
  budgetStatus: "WITHIN_BUDGET",
  deliveryStatus: "ON_TIME",
});

console.log("\nPartial quantity match:");
console.log(partial);

const quoteRequired = calculateMatchScore({
  semanticScore: 0.85,
  productDecision: "EXACT_MATCH",
  quantityCoverage: 1,
  budgetStatus: "QUOTE_REQUIRED",
  deliveryStatus: "ON_TIME",
});

console.log("\nQuote required:");
console.log(quoteRequired);

const rejected = calculateMatchScore({
  semanticScore: 0.95,
  productDecision: "INCOMPATIBLE",
  quantityCoverage: 1,
  budgetStatus: "WITHIN_BUDGET",
  deliveryStatus: "ON_TIME",
});

console.log("\nIncompatible:");
console.log(rejected);
