CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    match_id UUID NOT NULL UNIQUE
        REFERENCES matches(id)
        ON DELETE CASCADE,

    requirement_id UUID NOT NULL
        REFERENCES requirements(id)
        ON DELETE CASCADE,

    client_id UUID NOT NULL
        REFERENCES clients(id)
        ON DELETE CASCADE,

    supplier_id UUID NOT NULL
        REFERENCES suppliers(id)
        ON DELETE CASCADE,

    offering_id UUID NOT NULL
        REFERENCES offerings(id)
        ON DELETE CASCADE,

    quantity_ordered NUMERIC NOT NULL,
    unit VARCHAR(50) NOT NULL,

    client_notes TEXT,
    supplier_response_notes TEXT,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT orders_quantity_check
        CHECK (quantity_ordered > 0),

    CONSTRAINT orders_status_check
        CHECK (
            status IN (
                'PENDING',
                'ACCEPTED',
                'REJECTED',
                'CANCELLED'
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_supplier ON orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
