CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,

    product_requirement TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,

    quantity_required NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL,

    specifications TEXT,
    quality_grade VARCHAR(100),
    additional_notes TEXT,

    budget NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    budget_type VARCHAR(20) NOT NULL,

    delivery_location VARCHAR(255) NOT NULL,
    required_by_date DATE NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT requirements_budget_type_check
        CHECK (budget_type IN ('TOTAL', 'PER_UNIT')),

    CONSTRAINT requirements_status_check
        CHECK (
            status IN (
                'OPEN',
                'MATCHED',
                'CONFIRMED',
                'FULFILLED',
                'CANCELLED'
            )
        ),

    CONSTRAINT requirements_quantity_check
        CHECK (quantity_required > 0),

    CONSTRAINT requirements_budget_check
        CHECK (budget >= 0)
);

ALTER TABLE requirements
ADD COLUMN embedding vector(768);

ALTER TABLE requirements
ADD COLUMN allow_multiple_suppliers BOOLEAN NOT NULL DEFAULT FALSE;