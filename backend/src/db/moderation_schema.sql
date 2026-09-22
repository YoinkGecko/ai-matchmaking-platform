ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_account_status_check;

ALTER TABLE users
ADD CONSTRAINT users_account_status_check
CHECK (account_status IN ('ACTIVE', 'SUSPENDED'));

CREATE TABLE IF NOT EXISTS chat_message_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    message_id UUID NOT NULL
        REFERENCES offering_messages(id)
        ON DELETE CASCADE,

    conversation_id UUID NOT NULL
        REFERENCES offering_conversations(id)
        ON DELETE CASCADE,

    reporter_email VARCHAR(255) NOT NULL,
    reporter_role VARCHAR(20) NOT NULL,

    reported_email VARCHAR(255) NOT NULL,
    reported_role VARCHAR(20) NOT NULL,

    message_body TEXT NOT NULL,
    reason TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,

    CONSTRAINT chat_message_reports_reporter_role_check
        CHECK (reporter_role IN ('CLIENT', 'SUPPLIER')),
    CONSTRAINT chat_message_reports_reported_role_check
        CHECK (reported_role IN ('CLIENT', 'SUPPLIER')),
    CONSTRAINT chat_message_reports_status_check
        CHECK (status IN ('OPEN', 'REVIEWED', 'DISMISSED')),

    CONSTRAINT chat_message_reports_unique_reporter
        UNIQUE (message_id, reporter_email)
);

CREATE INDEX IF NOT EXISTS idx_chat_message_reports_status
    ON chat_message_reports(status, created_at DESC);

CREATE TABLE IF NOT EXISTS moderation_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(20) NOT NULL,

    message TEXT NOT NULL,
    related_report_id UUID REFERENCES chat_message_reports(id) ON DELETE SET NULL,

    sent_by_admin_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
