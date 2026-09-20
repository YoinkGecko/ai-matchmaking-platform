CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),

    business_location VARCHAR(255) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE offerings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    supplier_id UUID NOT NULL
        REFERENCES suppliers(id)
        ON DELETE CASCADE,

    product_offered TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,

    available_quantity NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL,

    specifications TEXT,
    quality_grade VARCHAR(100),

    price NUMERIC NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    price_type VARCHAR(20) NOT NULL,
    pricing_notes TEXT,

    fulfillment_location VARCHAR(255) NOT NULL,

    minimum_delivery_days INTEGER NOT NULL,
    maximum_delivery_days INTEGER NOT NULL,

    additional_notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT offerings_quantity_check
        CHECK (available_quantity > 0),

    CONSTRAINT offerings_price_check
        CHECK (price >= 0),

    CONSTRAINT offerings_price_type_check
        CHECK (price_type IN ('TOTAL', 'PER_UNIT')),

    CONSTRAINT offerings_delivery_days_check
        CHECK (
            minimum_delivery_days >= 0
            AND maximum_delivery_days >= minimum_delivery_days
        )
);