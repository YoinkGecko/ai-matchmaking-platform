import { evaluateDelivery } from "../services/delivery-matching.service";

console.log("=== Delivery Matching Tests ===\n");

const fromDate = new Date("2026-09-21T00:00:00Z");

// Test 1
const test1 = evaluateDelivery(
  {
    requiredByDate: "2026-10-15",
  },
  {
    minimumDeliveryDays: 5,
    maximumDeliveryDays: 10,
  },
  fromDate,
);

console.log("Test 1: Supplier delivers well before deadline");
console.log(test1);

// Test 2
const test2 = evaluateDelivery(
  {
    requiredByDate: "2026-10-15",
  },
  {
    minimumDeliveryDays: 30,
    maximumDeliveryDays: 35,
  },
  fromDate,
);

console.log("\nTest 2: Supplier is definitely late");
console.log(test2);

// Test 3
const test3 = evaluateDelivery(
  {
    requiredByDate: "2026-10-15",
  },
  {
    minimumDeliveryDays: 15,
    maximumDeliveryDays: 30,
  },
  fromDate,
);

console.log("\nTest 3: Delivery window crosses deadline");
console.log(test3);
