-- ═══ VYRDICT — Migration V8 : date enchère ═══
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS date_enchere TIMESTAMPTZ;
