-- ═══ VYRDICT — Migration V3 : photo véhicule ═══
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS photo_url TEXT;
