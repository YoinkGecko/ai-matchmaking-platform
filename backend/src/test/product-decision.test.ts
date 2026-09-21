import { decideProductCompatibility } from "../services/product-decision.service";

const tests = [
  {
    name: "Steel pipes",
    semanticScore: 0.5651,
    productSignal: 0,
  },
  {
    name: "Packaged burger",
    semanticScore: 0.6828,
    productSignal: 0.85,
  },
  {
    name: "Burger buns",
    semanticScore: 0.6492,
    productSignal: 0.9,
  },
  {
    name: "Exact burger",
    semanticScore: 0.9,
    productSignal: 1,
  },
];

for (const test of tests) {
  const decision = decideProductCompatibility({
    semanticScore: test.semanticScore,
    productSignal: test.productSignal,
  });

  console.log(`${test.name} → ${decision}`);
}
