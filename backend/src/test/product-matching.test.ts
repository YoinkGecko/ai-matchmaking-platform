import { calculateProductSignal } from "../services/product-matching.service";

const requirement = {
  product: "Burger",
  category: "Fast food",
};

const tests = [
  {
    name: "Packaged burger",
    product: "food",
    category: "packaged burger",
  },
  {
    name: "Pizza",
    product: "Pizza",
    category: "Fast food",
  },
  {
    name: "Burger buns",
    product: "Burger buns",
    category: "Bakery",
  },
  {
    name: "Steel pipes",
    product: "Industrial steel pipes",
    category: "Industrial Equipment",
  },
];

for (const test of tests) {
  const score = calculateProductSignal(
    requirement.product,
    requirement.category,
    test.product,
    test.category
  );

  console.log(test.name, "→", score);
}