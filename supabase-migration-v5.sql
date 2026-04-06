-- ═══ VYRDICT — Migration V5 : lien annonce ═══
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS lien_annonce TEXT DEFAULT '';
