-- ═══ VYRDICT — Migration V4 : prix custom + cookie secret ═══
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS custom_prices JSONB DEFAULT '{}';
