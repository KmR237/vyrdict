-- ═══ VYRDICT — Migration V2 : champs pro ═══

-- Nouveaux champs analyses
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS puissance_fiscale TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS energie TEXT;

-- Nouveaux champs vehicles
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS source_achat TEXT DEFAULT '' CHECK (source_achat IN ('', 'alcopa', 'bca', 'vpauto', 'particulier', 'mandataire', 'autre'));
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS date_achat DATE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS cout_stockage_jour NUMERIC DEFAULT 12;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS prix_vente_reel NUMERIC;
