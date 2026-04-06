-- ═══ VYRDICT — Migration V6 : stockage fichiers + cascade ═══

-- URL du CT original dans Storage
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS ct_file_url TEXT;

-- Changer la FK pour cascade delete (supprimer analyse quand véhicule supprimé)
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_analyse_id_fkey;
ALTER TABLE vehicles ADD CONSTRAINT vehicles_analyse_id_fkey
  FOREIGN KEY (analyse_id) REFERENCES analyses(id) ON DELETE CASCADE;

-- Policy Storage : autoriser uploads/reads pour service_role
-- (les policies storage se gèrent dans le dashboard Supabase → Storage → Policies)
