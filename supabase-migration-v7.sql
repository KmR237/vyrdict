-- ═══ VYRDICT — Migration V7 : frais enchères + TVA + marge minimum ═══
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS tva_sur_marge BOOLEAN DEFAULT true;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS marge_minimum NUMERIC DEFAULT 500;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS frais_enchere_pct NUMERIC;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS frais_enchere_fixes NUMERIC;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mode_enchere TEXT DEFAULT 'en_ligne';
