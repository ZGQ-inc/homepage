-- ================================================================
-- Cloudflare D1 Database Schema for ZGQ Homepage Guestbook
-- Database: homepage-db
-- ================================================================

CREATE TABLE IF NOT EXISTS guestbook (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nickname    TEXT NOT NULL,
  contact     TEXT DEFAULT '',
  content     TEXT NOT NULL,
  ip          TEXT DEFAULT '',
  user_agent  TEXT DEFAULT '',
  is_approved INTEGER DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_guestbook_created ON guestbook(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_guestbook_ip ON guestbook(ip, created_at);
