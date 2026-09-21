CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    requirement_id UUID NOT NULL
        REFERENCES requirements(id)
        ON DELETE CASCADE,

    offering_id UUID NOT NULL
        REFERENCES offerings(id)
        ON DELETE CASCADE,

    supplier_id UUID NOT NULL
        REFERENCES suppliers(id)
        ON DELETE CASCADE,

    match_score NUMERIC(5,4) NOT NULL,
    match_percentage INTEGER NOT NULL,

    semantic_score NUMERIC(6,5) NOT NULL,

    product_decision VARCHAR(30) NOT NULL,

    quantity_coverage NUMERIC(6,5) NOT NULL,

    budget_status VARCHAR(30) NOT NULL,

    delivery_status VARCHAR(30) NOT NULL,

    product_reason TEXT,

    budget_explanation TEXT,

    delivery_explanation TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'SUGGESTED',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT matches_score_check
        CHECK (match_score >= 0 AND match_score <= 1),

    CONSTRAINT matches_percentage_check
        CHECK (match_percentage >= 0 AND match_percentage <= 100),

    CONSTRAINT matches_quantity_check
        CHECK (quantity_coverage >= 0 AND quantity_coverage <= 1),

    CONSTRAINT matches_status_check
        CHECK (
            status IN (
                'SUGGESTED',
                'VIEWED',
                'SHORTLISTED',
                'REJECTED',
                'ACCEPTED'
            )
        )
);