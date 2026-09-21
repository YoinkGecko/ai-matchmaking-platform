const OLLAMA_URL = "http://localhost:11434";

export interface ProductCompatibilityResult {
  productMatch: number;
  categoryMatch: number;
  specificationMatch: number;
  reason: string;
}

export const evaluateProductCompatibility = async (
  requirement: {
    productRequirement: string;
    category: string;
    specifications?: string | null;
    qualityGrade?: string | null;
  },
  offering: {
    productOffered: string;
    category: string;
    specifications?: string | null;
    qualityGrade?: string | null;
  },
): Promise<ProductCompatibilityResult> => {
  const prompt = `
You are evaluating whether a supplier offering matches a client's product requirement.

Evaluate ONLY product compatibility.

Do NOT consider:
- price
- quantity
- delivery time
- location
- supplier reputation

CLIENT REQUIREMENT:
Product: ${requirement.productRequirement}
Category: ${requirement.category}
Specifications: ${requirement.specifications ?? "Not specified"}
Quality Grade: ${requirement.qualityGrade ?? "Not specified"}

SUPPLIER OFFERING:
Product: ${offering.productOffered}
Category: ${offering.category}
Specifications: ${offering.specifications ?? "Not specified"}
Quality Grade: ${offering.qualityGrade ?? "Not specified"}

Return ONLY valid JSON in this exact format:

{
  "productMatch": 0.0,
  "categoryMatch": 0.0,
  "specificationMatch": 0.0,
  "reason": "short explanation"
}

Scores must be between 0 and 1.
`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3.2",
      prompt,
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed: ${response.status}`);
  }

  const data = await response.json();

  return JSON.parse(data.response);
};
