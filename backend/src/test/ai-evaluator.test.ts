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
      productOffered: "chips",
      category: "fast food",
      specifications: null,
      qualityGrade: null,
    }
  );

  console.log(result);

  process.exit(0);
};

test();