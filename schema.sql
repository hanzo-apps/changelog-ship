-- Shipwright — Hanzo Base schema (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so those columns are never
-- re-declared here; every row is stamped with the verified IAM `owner`+`org`.
--
-- Org isolation is enforced by the collection access rule
--   @request.auth.org_id = org
-- so a member of your org reads/writes these rows and other orgs cannot see
-- them. Keep this file in lockstep with what the app reads/writes
-- (src/views/feed.tsx · detail.tsx · compose.tsx).

-- A dated release note or a longer-form post (kind = 'post').
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'feature',   -- feature | fix | breaking | post
  version TEXT NOT NULL DEFAULT '',
  published_at TEXT NOT NULL DEFAULT '',   -- ISO 8601; empty while a draft
  draft INTEGER NOT NULL DEFAULT 0
);

-- A reusable label with a chip color, deduped by label per org.
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b93a3'
);

-- The many-to-many join between entries and tags.
CREATE TABLE IF NOT EXISTS entry_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id TEXT NOT NULL,
  tag_id TEXT NOT NULL
);
