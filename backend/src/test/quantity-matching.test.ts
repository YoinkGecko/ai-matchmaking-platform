import {
  calculateQuantityCoverage,
  calculateCombinedQuantity,
} from "../services/quantity-matching.service";

console.log("=== Quantity Matching Tests ===\n");

// Test 1: Single supplier covers 70%
const test1 = calculateQuantityCoverage(
  {
    requiredQuantity: 10000,
    unit: "pieces",
  },
  {
    availableQuantity: 7000,
    unit: "pieces",
  },
);

console.log("Test 1: 10,000 required / 7,000 available");
console.log("Expected: 0.7");
console.log("Actual:", test1);
console.log(test1 === 0.7 ? "PASS\n" : "FAIL\n");

// Test 2: Supplier has more than enough
const test2 = calculateQuantityCoverage(
  {
    requiredQuantity: 10000,
    unit: "pieces",
  },
  {
    availableQuantity: 15000,
    unit: "pieces",
  },
);

console.log("Test 2: 10,000 required / 15,000 available");
console.log("Expected: 1");
console.log("Actual:", test2);
console.log(test2 === 1 ? "PASS\n" : "FAIL\n");

// Test 3: Two suppliers fully satisfy requirement
const test3 = calculateCombinedQuantity(
  {
    requiredQuantity: 10000,
    unit: "pieces",
  },
  [
    {
      supplierId: "supplier-a",
      availableQuantity: 7000,
      unit: "pieces",
    },
    {
      supplierId: "supplier-b",
      availableQuantity: 3000,
      unit: "pieces",
    },
  ],
);

console.log("Test 3: Supplier A = 7,000 + Supplier B = 3,000");
console.log("Expected fulfilledQuantity: 10,000");
console.log("Expected coverage: 1");
console.log("Expected fullyFulfilled: true");
console.log("Actual:", test3);

console.log(
  test3.fulfilledQuantity === 10000 &&
    test3.coverage === 1 &&
    test3.fullyFulfilled
    ? "PASS\n"
    : "FAIL\n",
);

// Test 4: Two suppliers only cover 90%
const test4 = calculateCombinedQuantity(
  {
    requiredQuantity: 10000,
    unit: "pieces",
  },
  [
    {
      supplierId: "supplier-a",
      availableQuantity: 7000,
      unit: "pieces",
    },
    {
      supplierId: "supplier-b",
      availableQuantity: 2000,
      unit: "pieces",
    },
  ],
);

console.log("Test 4: Supplier A = 7,000 + Supplier B = 2,000");
console.log("Expected fulfilledQuantity: 9,000");
console.log("Expected coverage: 0.9");
console.log("Expected fullyFulfilled: false");
console.log("Actual:", test4);

console.log(
  test4.fulfilledQuantity === 9000 &&
    test4.coverage === 0.9 &&
    !test4.fullyFulfilled
    ? "PASS\n"
    : "FAIL\n",
);
