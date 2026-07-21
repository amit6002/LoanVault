-- ============================================================
-- LOANVAULT DATABASE MIGRATION & SCHEMA INITIALIZATION
-- Executed on Spring Boot startup to ensure tables & columns exist
-- ============================================================

-- 1. Ensure table 'users' exists
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    google_id VARCHAR(255),
    servicing_branch_id BIGINT,
    branch VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    on_leave BOOLEAN NOT NULL DEFAULT FALSE,
    phone VARCHAR(255),
    date_of_birth VARCHAR(255),
    pan_number VARCHAR(255),
    aadhaar_number VARCHAR(255),
    address_line1 VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    pincode VARCHAR(255),
    employment_type VARCHAR(255),
    employer_name VARCHAR(255),
    monthly_income NUMERIC(12,2),
    profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- 2. Safely add columns if the table already existed without them
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS on_leave BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS servicing_branch_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS branch VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS pincode VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_type VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS employer_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_income NUMERIC(12,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
