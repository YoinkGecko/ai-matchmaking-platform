/**
 * Idempotent demo dataset for tutorials (all aspects: exact/partial/reject/budget/delivery/workflow).
 *
 * Usage: npm run seed:demo
 * Requires: Postgres with schema applied; Redis not required for seeding.
 */
import "dotenv/config";
import pool from "../src/db";
import { calculateMatchScore } from "../src/services/match-score.service";

const DEMO_DOMAIN = "@wisdommatch.demo";

const IDS = {
  userClient: "11111111-1111-4111-8111-111111111101",
  userAdmin: "11111111-1111-4111-8111-111111111102",
  userSuppliers: [
    "22222222-2222-4222-8222-222222222201",
    "22222222-2222-4222-8222-222222222202",
    "22222222-2222-4222-8222-222222222203",
    "22222222-2222-4222-8222-222222222204",
    "22222222-2222-4222-8222-222222222205",
    "22222222-2222-4222-8222-222222222206",
  ],
  client: "33333333-3333-4333-8333-333333333301",
  suppliers: [
    "44444444-4444-4444-8444-444444444401",
    "44444444-4444-4444-8444-444444444402",
    "44444444-4444-4444-8444-444444444403",
    "44444444-4444-4444-8444-444444444404",
    "44444444-4444-4444-8444-444444444405",
    "44444444-4444-4444-8444-444444444406",
  ],
  offerings: [
    "55555555-5555-4555-8555-555555555501",
    "55555555-5555-4555-8555-555555555502",
    "55555555-5555-4555-8555-555555555503",
    "55555555-5555-4555-8555-555555555504",
    "55555555-5555-4555-8555-555555555505",
    "55555555-5555-4555-8555-555555555506",
  ],
  reqShowcase: "66666666-6666-4666-8666-666666666601",
  reqOpen: "66666666-6666-4666-8666-666666666602",
  reqConfirmed: "66666666-6666-4666-8666-666666666603",
};

function pseudoEmbedding(seed: string): number[] {
  const out = new Array(768).fill(0);
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = 0; i < 768; i++) {
    h = Math.imul(h ^ (i + 1), 2654435761);
    out[i] = ((h >>> 0) % 2000) / 1000 - 1;
  }
  const norm = Math.sqrt(out.reduce((s, v) => s + v * v, 0)) || 1;
  return out.map((v) => v / norm);
}

function vecParam(seed: string) {
  return JSON.stringify(pseudoEmbedding(seed));
}

type MatchSeed = {
  offeringIndex: number;
  semanticScore: number;
  productDecision:
    | "EXACT_MATCH"
    | "CLOSE_MATCH"
    | "RELATED_BUT_DIFFERENT"
    | "INCOMPATIBLE"
    | "CLEAR_REJECT";
  quantityCoverage: number;
  budgetStatus: "WITHIN_BUDGET" | "OVER_BUDGET" | "QUOTE_REQUIRED";
  deliveryStatus: "ON_TIME" | "LATE" | "UNCERTAIN";
  status: "SUGGESTED" | "VIEWED" | "SHORTLISTED" | "REJECTED" | "ACCEPTED";
  productReason: string;
  budgetExplanation: string;
  deliveryExplanation: string;
};

async function wipeDemoData() {
  await pool.query(
    `DELETE FROM matches WHERE requirement_id IN (
       SELECT id FROM requirements WHERE client_id = $1
     )`,
    [IDS.client],
  );
  await pool.query(`DELETE FROM requirements WHERE client_id = $1`, [IDS.client]);
  await pool.query(
    `DELETE FROM offerings WHERE supplier_id = ANY($1::uuid[])`,
    [IDS.suppliers],
  );
  await pool.query(`DELETE FROM clients WHERE id = $1`, [IDS.client]);
  await pool.query(`DELETE FROM suppliers WHERE id = ANY($1::uuid[])`, [
    IDS.suppliers,
  ]);
  await pool.query(
    `DELETE FROM users WHERE email LIKE $1`,
    [`%${DEMO_DOMAIN}`],
  );
}

async function seed() {
  const clientEmail = `demo.client${DEMO_DOMAIN}`;
  const adminEmail = `admin${DEMO_DOMAIN}`;

  const supplierDefs = [
    {
      email: `apex.grain${DEMO_DOMAIN}`,
      name: "Apex Grain Traders",
      person: "Priya Sharma",
      location: "Amritsar, Punjab",
    },
    {
      email: `partial.mills${DEMO_DOMAIN}`,
      name: "Partial Mills Co-op",
      person: "Rahul Mehta",
      location: "Nagpur, Maharashtra",
    },
    {
      email: `coastal.staples${DEMO_DOMAIN}`,
      name: "Coastal Staples Ltd",
      person: "Anita Desai",
      location: "Chennai, Tamil Nadu",
    },
    {
      email: `premium.imports${DEMO_DOMAIN}`,
      name: "Premium Imports Pvt Ltd",
      person: "Vikram Singh",
      location: "Mumbai, Maharashtra",
    },
    {
      email: `quote.coop${DEMO_DOMAIN}`,
      name: "Bharat Quote Cooperative",
      person: "Sneha Iyer",
      location: "Bengaluru, Karnataka",
    },
    {
      email: `forge.metals${DEMO_DOMAIN}`,
      name: "Forge Metals Industrial",
      person: "Karan Patel",
      location: "Ahmedabad, Gujarat",
    },
  ];

  const offeringDefs = [
    {
      product: "Premium Basmati Rice Grade A — 1121 variety, export quality",
      category: "Food & Agriculture",
      qty: 1200,
      unit: "kg",
      price: 450,
      priceType: "PER_UNIT",
      minDays: 3,
      maxDays: 7,
      notes: "Full batch available; standard B2B invoicing.",
      embedKey: "basmati grade a premium rice 1121",
    },
    {
      product: "Basmati Rice Grade A — limited harvest lot",
      category: "Food & Agriculture",
      qty: 480,
      unit: "kg",
      price: 430,
      priceType: "PER_UNIT",
      minDays: 5,
      maxDays: 10,
      notes: "Can supply up to 480 kg this month (partial fulfillment).",
      embedKey: "basmati grade a rice partial lot",
    },
    {
      product: "Sona Masoori raw rice — food-service pack",
      category: "Food & Agriculture",
      qty: 2000,
      unit: "kg",
      price: 380,
      priceType: "PER_UNIT",
      minDays: 4,
      maxDays: 8,
      notes: "Related staple; not Basmati but suitable for blended menus.",
      embedKey: "sona masoori rice staple",
    },
    {
      product: "Super-premium aged Basmati Rice Grade A",
      category: "Food & Agriculture",
      qty: 1000,
      unit: "kg",
      price: 620,
      priceType: "PER_UNIT",
      minDays: 14,
      maxDays: 21,
      notes: "Higher landed cost; longer lead time.",
      embedKey: "aged basmati premium expensive",
    },
    {
      product: "Basmati Rice Grade A — contract pricing",
      category: "Food & Agriculture",
      qty: 900,
      unit: "kg",
      price: 0,
      priceType: "PER_UNIT",
      minDays: 7,
      maxDays: 14,
      notes: "Price confirmed after sample approval (quote required).",
      embedKey: "basmati grade a contract quote",
    },
    {
      product: "Structural steel I-beams H-section",
      category: "Industrial",
      qty: 50,
      unit: "tons",
      price: 85000,
      priceType: "PER_UNIT",
      minDays: 10,
      maxDays: 20,
      notes: "Not a food product — incompatible category.",
      embedKey: "steel i-beams structural industrial",
    },
  ];

  const requiredBy = new Date();
  requiredBy.setDate(requiredBy.getDate() + 30);
  const requiredByStr = requiredBy.toISOString().slice(0, 10);

  const reqEmbedKey =
    "800 kg premium basmati rice grade a procurement hospitality";

  await pool.query("BEGIN");
  try {
    await wipeDemoData();

    await pool.query(
      `INSERT INTO users (id, email, role) VALUES ($1, $2, 'CLIENT')`,
      [IDS.userClient, clientEmail],
    );
    await pool.query(
      `INSERT INTO users (id, email, role) VALUES ($1, $2, 'ADMIN')`,
      [IDS.userAdmin, adminEmail],
    );

    for (let i = 0; i < supplierDefs.length; i++) {
      await pool.query(
        `INSERT INTO users (id, email, role) VALUES ($1, $2, 'SUPPLIER')`,
        [IDS.userSuppliers[i], supplierDefs[i].email],
      );
    }

    await pool.query(
      `INSERT INTO clients (id, company_name, contact_person, email, phone, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        IDS.client,
        "Horizon Hospitality Group",
        "Meera Nair",
        clientEmail,
        "+91-98765-43210",
        IDS.userClient,
      ],
    );

    for (let i = 0; i < supplierDefs.length; i++) {
      const s = supplierDefs[i];
      await pool.query(
        `INSERT INTO suppliers (id, supplier_name, contact_person, email, phone, business_location, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          IDS.suppliers[i],
          s.name,
          s.person,
          s.email,
          "+91-90000-0000" + String(i + 1),
          s.location,
          IDS.userSuppliers[i],
        ],
      );
    }

    for (let i = 0; i < offeringDefs.length; i++) {
      const o = offeringDefs[i];
      await pool.query(
        `INSERT INTO offerings (
          id, supplier_id, product_offered, category,
          available_quantity, unit, specifications, quality_grade,
          price, currency, price_type, pricing_notes,
          fulfillment_location, minimum_delivery_days, maximum_delivery_days,
          additional_notes, embedding
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'INR', $10, $11,
          $12, $13, $14, $15, $16::vector
        )`,
        [
          IDS.offerings[i],
          IDS.suppliers[i],
          o.product,
          o.category,
          o.qty,
          o.unit,
          "As per buyer RFQ",
          i === 5 ? "Industrial" : "Grade A",
          o.price,
          o.priceType,
          o.price === 0 ? "Submit quote after sample" : null,
          supplierDefs[i].location,
          o.minDays,
          o.maxDays,
          o.notes,
          vecParam(o.embedKey),
        ],
      );
    }

    await pool.query(
      `INSERT INTO requirements (
        id, client_id, product_requirement, category,
        quantity_required, unit, specifications, quality_grade, additional_notes,
        budget, currency, budget_type, delivery_location, required_by_date,
        status, allow_multiple_suppliers, embedding
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, 'INR', 'TOTAL', $11, $12,
        'MATCHED', true, $13::vector
      )`,
      [
        IDS.reqShowcase,
        IDS.client,
        "800 kg Premium Basmati Rice Grade A for hotel chain central kitchen",
        "Food & Agriculture",
        800,
        "kg",
        "1121 variety, max 5% broken, food-grade packaging",
        "Grade A",
        "Tutorial requirement — pre-loaded matches for every scoring dimension.",
        400000,
        "Mumbai, Maharashtra",
        requiredByStr,
        vecParam(reqEmbedKey),
      ],
    );

    await pool.query(
      `INSERT INTO requirements (
        id, client_id, product_requirement, category,
        quantity_required, unit, budget, currency, budget_type,
        delivery_location, required_by_date, status, allow_multiple_suppliers, embedding
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 'INR', 'TOTAL', $8, $9, 'OPEN', false, $10::vector
      )`,
      [
        IDS.reqOpen,
        IDS.client,
        "200 kg organic turmeric powder — food grade",
        "Food & Agriculture",
        200,
        "kg",
        120000,
        "Pune, Maharashtra",
        requiredByStr,
        vecParam("organic turmeric powder food grade"),
      ],
    );

    await pool.query(
      `INSERT INTO requirements (
        id, client_id, product_requirement, category,
        quantity_required, unit, budget, currency, budget_type,
        delivery_location, required_by_date, status, allow_multiple_suppliers, embedding
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, 'INR', 'TOTAL', $8, $9, 'CONFIRMED', false, $10::vector
      )`,
      [
        IDS.reqConfirmed,
        IDS.client,
        "100 kg cashew kernels W320",
        "Food & Agriculture",
        100,
        "kg",
        95000,
        "Mumbai, Maharashtra",
        requiredByStr,
        vecParam("cashew kernels w320"),
      ],
    );

    const matchSeeds: MatchSeed[] = [
      {
        offeringIndex: 0,
        semanticScore: 0.93,
        productDecision: "EXACT_MATCH",
        quantityCoverage: 1,
        budgetStatus: "WITHIN_BUDGET",
        deliveryStatus: "ON_TIME",
        status: "ACCEPTED",
        productReason:
          "Offering matches Basmati Grade A spec and category; semantic alignment is very high.",
        budgetExplanation:
          "Estimated total at ₹450/kg for 800 kg is within the ₹4,00,000 total budget.",
        deliveryExplanation: "Supplier lead time fits before the required-by date.",
      },
      {
        offeringIndex: 1,
        semanticScore: 0.86,
        productDecision: "CLOSE_MATCH",
        quantityCoverage: 0.6,
        budgetStatus: "WITHIN_BUDGET",
        deliveryStatus: "ON_TIME",
        status: "SHORTLISTED",
        productReason:
          "Product fit is close, but available quantity covers only 60% of the requirement (partial fulfillment).",
        budgetExplanation: "Unit price is within budget for the quantity they can supply.",
        deliveryExplanation: "Delivery window is acceptable.",
      },
      {
        offeringIndex: 2,
        semanticScore: 0.72,
        productDecision: "RELATED_BUT_DIFFERENT",
        quantityCoverage: 1,
        budgetStatus: "WITHIN_BUDGET",
        deliveryStatus: "UNCERTAIN",
        status: "VIEWED",
        productReason:
          "Sona Masoori is a related staple but not the requested Basmati Grade A — partial product fit.",
        budgetExplanation: "Price per kg is below budget envelope.",
        deliveryExplanation:
          "Delivery date depends on monsoon logistics — marked uncertain.",
      },
      {
        offeringIndex: 3,
        semanticScore: 0.81,
        productDecision: "CLOSE_MATCH",
        quantityCoverage: 1,
        budgetStatus: "OVER_BUDGET",
        deliveryStatus: "LATE",
        status: "SUGGESTED",
        productReason:
          "Product is Basmati Grade A, but landed cost and lead time weaken the overall match.",
        budgetExplanation:
          "At ₹620/kg the estimated total exceeds the ₹4,00,000 budget (over budget).",
        deliveryExplanation:
          "Minimum 14-day lead time misses the preferred delivery window (late).",
      },
      {
        offeringIndex: 4,
        semanticScore: 0.78,
        productDecision: "EXACT_MATCH",
        quantityCoverage: 0.55,
        budgetStatus: "QUOTE_REQUIRED",
        deliveryStatus: "UNCERTAIN",
        status: "SUGGESTED",
        productReason:
          "Spec match is good; pricing is not published — buyer must request a formal quote.",
        budgetExplanation:
          "Cannot score budget until quote is received (quote required).",
        deliveryExplanation:
          "Fulfillment date will be confirmed with the quote (uncertain).",
      },
      {
        offeringIndex: 5,
        semanticScore: 0.15,
        productDecision: "CLEAR_REJECT",
        quantityCoverage: 0,
        budgetStatus: "OVER_BUDGET",
        deliveryStatus: "LATE",
        status: "REJECTED",
        productReason:
          "Industrial steel is incompatible with a rice procurement — hard reject (0% match score).",
        budgetExplanation: "Not applicable — product rejected before budget scoring.",
        deliveryExplanation: "Not applicable — product rejected.",
      },
    ];

    for (const m of matchSeeds) {
      const score = calculateMatchScore({
        semanticScore: m.semanticScore,
        productDecision: m.productDecision,
        quantityCoverage: m.quantityCoverage,
        budgetStatus: m.budgetStatus,
        deliveryStatus: m.deliveryStatus,
      });

      await pool.query(
        `INSERT INTO matches (
          requirement_id, offering_id, supplier_id,
          match_score, match_percentage, semantic_score,
          product_decision, quantity_coverage,
          budget_status, delivery_status,
          product_reason, budget_explanation, delivery_explanation,
          status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )`,
        [
          IDS.reqShowcase,
          IDS.offerings[m.offeringIndex],
          IDS.suppliers[m.offeringIndex],
          score.score,
          score.percentage,
          m.semanticScore,
          m.productDecision,
          m.quantityCoverage,
          m.budgetStatus,
          m.deliveryStatus,
          m.productReason,
          m.budgetExplanation,
          m.deliveryExplanation,
          m.status,
        ],
      );
    }

    const confirmedScore = calculateMatchScore({
      semanticScore: 0.88,
      productDecision: "EXACT_MATCH",
      quantityCoverage: 1,
      budgetStatus: "WITHIN_BUDGET",
      deliveryStatus: "ON_TIME",
    });

    await pool.query(
      `INSERT INTO matches (
        requirement_id, offering_id, supplier_id,
        match_score, match_percentage, semantic_score,
        product_decision, quantity_coverage,
        budget_status, delivery_status,
        product_reason, budget_explanation, delivery_explanation,
        status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'EXACT_MATCH', 1, 'WITHIN_BUDGET', 'ON_TIME',
        $7, $8, $9, 'ACCEPTED'
      )`,
      [
        IDS.reqConfirmed,
        IDS.offerings[0],
        IDS.suppliers[0],
        confirmedScore.score,
        confirmedScore.percentage,
        0.88,
        "Accepted supplier for fulfilled cashew requirement (demo).",
        "Within budget.",
        "On time.",
      ],
    );

    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }

  console.log("\n=== Wisdom Match demo data loaded ===\n");
  console.log("Add to backend .env:");
  console.log(`  ADMIN_EMAILS=${adminEmail}\n`);
  console.log("Log in (OTP via email / Redis):");
  console.log(`  Client:   ${clientEmail}`);
  console.log(`  Admin:    ${adminEmail}`);
  console.log("  Suppliers:");
  supplierDefs.forEach((s) => console.log(`    - ${s.email}`));
  console.log("\nClient profile ID (if linking manually):", IDS.client);
  console.log("\nRequirements:");
  console.log(`  Showcase (6 matches — all scenarios): ${IDS.reqShowcase}`);
  console.log(`  Open (run live AI matching):          ${IDS.reqOpen}`);
  console.log(`  Confirmed (accepted match):           ${IDS.reqConfirmed}`);
  console.log("\nSee docs/TUTORIAL_DEMO.md for the walkthrough.\n");
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
