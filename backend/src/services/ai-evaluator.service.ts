const OLLAMA_URL = "http://localhost:11434";

export type ProductMatchType =
  | "EXACT_MATCH"
  | "CLOSE_MATCH"
  | "RELATED_BUT_DIFFERENT"
  | "INCOMPATIBLE";

export interface ProductCompatibilityResult {
  matchType: ProductMatchType;
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
You are evaluating whether a supplier's product offering can satisfy a client's requested product.

Your ONLY task is to determine PRODUCT COMPATIBILITY.

Do NOT evaluate:
- quantity
- price
- budget
- delivery time
- location
- supplier quality/reputation

Important rules:
- If the client does not specify a specification or quality requirement, do NOT penalize the supplier for having different or additional information.
- Product descriptors such as packaged, frozen, fresh, ready-to-eat,
  bulk, premium, or similar descriptors do NOT automatically make
  a product different from the requested product.
- A product can still be an exact or close match when the supplier
  adds descriptive words around the requested product.
- Ingredients, components, accessories, and substantially different
  products are not matches.

Examples:

Client: Burger
Supplier: Packaged Burger
→ CLOSE_MATCH

Client: Burger
Supplier: Frozen Burger
→ CLOSE_MATCH

Client: Burger
Supplier: Burger Buns
→ RELATED_BUT_DIFFERENT

Client: Burger
Supplier: Pizza
→ RELATED_BUT_DIFFERENT

Client: Burger
Supplier: Steel Pipes
→ INCOMPATIBLE


- Focus on whether the supplier is offering the product the client actually requested.

CLIENT:
Product: ${requirement.productRequirement}
Category: ${requirement.category}
Specifications: ${requirement.specifications ?? "Not specified"}
Quality Grade: ${requirement.qualityGrade ?? "Not specified"}

SUPPLIER:
Product: ${offering.productOffered}
Category: ${offering.category}
Specifications: ${offering.specifications ?? "Not specified"}
Quality Grade: ${offering.qualityGrade ?? "Not specified"}

Classify the relationship as exactly ONE of:

EXACT_MATCH
The supplier directly offers the requested product, including
reasonable descriptive variations of that product.

CLOSE_MATCH
The supplier offers essentially the requested product with a reasonable naming, packaging, or formulation difference.

RELATED_BUT_DIFFERENT
The supplier offers something related to the requested product, but it is not the requested product itself.

INCOMPATIBLE
The supplier offering does not satisfy the requested product.

The value MUST be exactly one of:
"EXACT_MATCH"
"CLOSE_MATCH"
"RELATED_BUT_DIFFERENT"
"INCOMPATIBLE"

Return ONLY valid JSON:

{
  "matchType": "EXACT_MATCH",
  "reason": "Short explanation"
}
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

  const result = JSON.parse(data.response);

  return result;
};
