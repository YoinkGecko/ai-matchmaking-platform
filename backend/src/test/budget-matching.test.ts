import { evaluateBudget } from "../services/budget-matching.service";

console.log("=== Budget Matching Tests ===\n");

// Test 1
const test1 = evaluateBudget(
  {
    budget: 500000,
    budgetType: "TOTAL",
  },
  {
    price: 400000,
    priceType: "TOTAL",
    availableQuantity: 10000,
  },
  4000,
);

console.log("Test 1: Total price within budget");
console.log(test1);

// Test 2
const test2 = evaluateBudget(
  {
    budget: 500000,
    budgetType: "TOTAL",
  },
  {
    price: 600000,
    priceType: "TOTAL",
    availableQuantity: 10000,
  },
  4000,
);

console.log("\nTest 2: Total price over budget");
console.log(test2);

// Test 3
const test3 = evaluateBudget(
  {
    budget: 500000,
    budgetType: "TOTAL",
  },
  {
    price: 50,
    priceType: "PER_UNIT",
    availableQuantity: 10000,
  },
  4000,
);

console.log("\nTest 3: Per-unit pricing");
console.log(test3);

// Test 4
const test4 = evaluateBudget(
  {
    budget: 500000,
    budgetType: "TOTAL",
  },
  {
    price: 500000,
    priceType: "TOTAL",
    availableQuantity: 10000,
  },
  4000,
);

console.log("\nTest 4: Total price, but quantity is smaller");
console.log(test4);

// Test 5
const test5 = evaluateBudget(
  {
    budget: 50,
    budgetType: "PER_UNIT",
  },
  {
    price: 500000,
    priceType: "TOTAL",
    availableQuantity: 10000,
  },
  4000,
);

console.log("\nTest 5: Client has per-unit budget, supplier has total price");
console.log(test5);
