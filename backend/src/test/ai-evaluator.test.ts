import {
  evaluateProductCompatibility,
  
} from "../services/ai-evaluator.service";
const test = async () => {
  const result = await evaluateProductCompatibility(
    {
      productRequirement: "Burger",
      category: "Fast food",
      specifications: null,
      qualityGrade: null,
    },
    {
      productOffered: "food",
      category: "packaged burger",
      specifications: "4 tomato and bun",
      qualityGrade: "Food Grade",
    }
  );

  console.log(result);

  process.exit(0);
};

test();