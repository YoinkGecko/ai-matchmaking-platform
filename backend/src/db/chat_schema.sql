CREATE TABLE IF NOT EXISTS offering_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    offering_id UUID NOT NULL
        REFERENCES offerings(id)
        ON DELETE CASCADE,

    client_id UUID NOT NULL
        REFERENCES clients(id)
        ON DELETE CASCADE,

    supplier_id UUID NOT NULL
        REFERENCES suppliers(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT offering_conversations_unique
        UNIQUE (offering_id, client_id)
);

CREATE TABLE IF NOT EXISTS offering_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    conversation_id UUID NOT NULL
        REFERENCES offering_conversations(id)
        ON DELETE CASCADE,

    sender_role VARCHAR(20) NOT NULL,

    body TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT offering_messages_sender_check
        CHECK (sender_role IN ('CLIENT', 'SUPPLIER'))
);

CREATE INDEX IF NOT EXISTS idx_offering_messages_conversation
    ON offering_messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_offering_conversations_client
    ON offering_conversations(client_id);

CREATE INDEX IF NOT EXISTS idx_offering_conversations_supplier
    ON offering_conversations(supplier_id);
