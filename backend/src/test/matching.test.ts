import { buildRequirementText } from "../services/matching-text.service";

import { generateEmbedding } from "../services/embedding.service";

const test = async () => {
  const requirement = {
    productRequirement:
      "Food grade stainless steel containers for industrial packaging",
    category: "Industrial Packaging",
    specifications: "SS304, leak-proof, stackable",
    qualityGrade: "Food Grade",
    additionalNotes: "Required for pharmaceutical packaging",
  };

  const text = buildRequirementText(requirement);

  console.log("\n--- Text sent to embedding model ---");
  console.log(text);

  const embedding = await generateEmbedding(text);

  console.log("\n--- Embedding ---");
  console.log("Dimensions:", embedding.length);
  console.log("First 5 values:", embedding.slice(0, 5));
};

test();
