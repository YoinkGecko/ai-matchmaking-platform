import { allocateSuppliers } from "../services/supplier-allocation.service";

console.log("=== Supplier Allocation Tests ===\n");

// Test 1
const test1 = allocateSuppliers(
  {
    requiredQuantity: 10000,
    unit: "pieces",
    allowMultipleSuppliers: true,
  },
  [
    {
      supplierId: "supplier-a",
      offeringId: "offering-a",
      availableQuantity: 7000,
      unit: "pieces",
      semanticScore: 0.91,
    },
    {
      supplierId: "supplier-b",
      offeringId: "offering-b",
      availableQuantity: 9000,
      unit: "pieces",
      semanticScore: 0.72,
    },
  ],
);

console.log("Test 1: 7,000 + 8,000 for 10,000 required");
console.log(test1);

// Test 2
const test2 = allocateSuppliers(
  {
    requiredQuantity: 10000,
    unit: "pieces",
    allowMultipleSuppliers: false,
  },
  [
    {
      supplierId: "supplier-a",
      offeringId: "offering-a",
      availableQuantity: 7000,
      unit: "pieces",
      semanticScore: 0.60,
    },
    {
      supplierId: "supplier-b",
      offeringId: "offering-b",
      availableQuantity: 8000,
      unit: "pieces",
      semanticScore: 0.55,
    },
  ],
);

console.log("\nTest 2: Multiple suppliers NOT allowed");
console.log(test2);

// Test 3
const test3 = allocateSuppliers(
  {
    requiredQuantity: 10000,
    unit: "pieces",
    allowMultipleSuppliers: true,
  },
  [
    {
      supplierId: "supplier-a",
      offeringId: "offering-a",
      availableQuantity: 7000,
      unit: "pieces",
      semanticScore: 0.15,
    },
    {
      supplierId: "supplier-b",
      offeringId: "offering-b",
      availableQuantity: 2000,
      unit: "pieces",
      semanticScore: 0.45,
    },
  ],
);

console.log("\nTest 3: Only 9,000 available");
console.log(test3);
