CREATE TABLE IF NOT EXISTS "accounts"
(
  id                   SERIAL,
  compound_id          VARCHAR(255), -- removed not null
  user_id              INTEGER NOT NULL,
  provider_type        VARCHAR(255) NOT NULL,
  provider_id          VARCHAR(255) NOT NULL,
  provider_account_id  VARCHAR(255) NOT NULL,
  refresh_token        TEXT,
  access_token         TEXT,
  access_token_expires TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "sessions"
(
  id            SERIAL,
  user_id       INTEGER NOT NULL,
  expires       TIMESTAMPTZ NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  access_token  VARCHAR(255), -- removed not null
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "users"
(
  id             SERIAL,
  name           VARCHAR(255),
  email          VARCHAR(255),
  email_verified TIMESTAMPTZ,
  image          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "verification_requests" 
(
  id             SERIAL,
  identifier     VARCHAR(255),
  token          VARCHAR(255),
  expires        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP + interval '1' day,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS "chats" 
(
  id              text PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email      VARCHAR(255),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "messages" 
(
  id              text PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id         TEXT,
  user_email      VARCHAR(255),
  content         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS compound_id ON accounts(compound_id);

CREATE INDEX IF NOT EXISTS provider_account_id ON accounts(provider_account_id);

CREATE INDEX IF NOT EXISTS provider_id ON accounts(provider_id);

CREATE INDEX IF NOT EXISTS user_id ON accounts(user_id);

CREATE INDEX IF NOT EXISTS chats_id ON accounts(provider_id);

CREATE INDEX IF NOT EXISTS messages_id ON accounts(user_id);

CREATE INDEX IF NOT EXISTS chats_user_email ON chats(user_email);

CREATE INDEX IF NOT EXISTS message_chat_id ON messages(chat_id);

CREATE UNIQUE INDEX IF NOT EXISTS session_token ON sessions(session_token);

CREATE UNIQUE INDEX IF NOT EXISTS access_token ON sessions(access_token);

CREATE UNIQUE INDEX IF NOT EXISTS users_email ON users(email);