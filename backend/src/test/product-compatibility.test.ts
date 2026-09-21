import { evaluateProduct } from "../services/product-compatibility.service";

const requirement = {
  productRequirement: "Burger",
  category: "Fast food",
  specifications: null,
  qualityGrade: null,
};

const tests = [
  {
    name: "Packaged burger",
    semanticScore: 0.6828,
    productSignal: 0.85,
    offering: {
      productOffered: "food",
      category: "packaged burger",
      specifications: "4 tomato and bun",
      qualityGrade: "Food Grade",
    },
  },

  {
    name: "Burger buns",
    semanticScore: 0.6492,
    productSignal: 0.9,
    offering: {
      productOffered: "Burger buns",
      category: "Bakery",
      specifications: "Soft wheat buns",
      qualityGrade: "Food Grade",
    },
  },

  {
    name: "Pizza",
    semanticScore: 0.7805,
    productSignal: 0,
    offering: {
      productOffered: "Pizza",
      category: "Fast food",
      specifications: "Cheese, tomato, vegetables",
      qualityGrade: "Food Grade",
    },
  },

  {
    name: "Steel pipes",
    semanticScore: 0.5651,
    productSignal: 0,
    offering: {
      productOffered: "Industrial steel pipes",
      category: "Industrial Equipment",
      specifications: "Stainless steel",
      qualityGrade: "Industrial Grade",
    },
  },

  {
    name: "Exact burger",
    semanticScore: 0.9,
    productSignal: 1,
    offering: {
      productOffered: "Burger",
      category: "Fast food",
      specifications: "Fresh burger",
      qualityGrade: "Food Grade",
    },
  },
];

const test = async () => {
  for (const item of tests) {
    console.log(`\n--- ${item.name} ---`);

    const result = await evaluateProduct({
      semanticScore: item.semanticScore,
      productSignal: item.productSignal,
      requirement,
      offering: item.offering,
    });

    console.log(result);
  }

  process.exit(0);
};

test();