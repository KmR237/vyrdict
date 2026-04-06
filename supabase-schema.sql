-- ═══ VYRDICT — Schema de base de données ═══

-- Table des analyses CT (toutes les analyses, publiques et pro)
CREATE TABLE IF NOT EXISTS analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Véhicule
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  immatriculation TEXT,
  annee TEXT,
  kilometrage INTEGER DEFAULT 0,
  code_postal TEXT,

  -- Résultats
  score_sante INTEGER NOT NULL,
  cout_total_min INTEGER NOT NULL,
  cout_total_max INTEGER NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('reparer', 'vendre', 'arbitrage')),
  defaillances_count INTEGER DEFAULT 0,

  -- JSON complet du résultat (pour affichage)
  resultat JSONB NOT NULL,

  -- Hash du fichier (pour éviter les doublons)
  file_hash TEXT
);

-- Table des véhicules du dashboard pro
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Lien vers l'analyse
  analyse_id UUID REFERENCES analyses(id) ON DELETE SET NULL,

  -- Statut pipeline
  statut TEXT DEFAULT 'a_etudier' CHECK (statut IN (
    'a_etudier', 'a_negocier', 'offre_faite', 'achete', 'en_reparation', 'en_vente', 'vendu', 'passe'
  )),

  -- Rentabilité
  prix_achat NUMERIC,
  prix_revente NUMERIC,
  frais_annexes NUMERIC DEFAULT 350,
  devis_garage NUMERIC,

  -- Sélection des réparations
  reparations_selectionnees TEXT[] DEFAULT '{}',
  mode_reparation TEXT DEFAULT 'minimum_ct' CHECK (mode_reparation IN ('minimum_ct', 'complet', 'personnalise')),

  -- Notes
  notes TEXT DEFAULT '',

  -- Calibration (paire estimation/devis réel)
  estimation_vyrdict NUMERIC,
  devis_reel NUMERIC
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_file_hash ON analyses(file_hash);
CREATE INDEX IF NOT EXISTS idx_vehicles_statut ON vehicles(statut);
CREATE INDEX IF NOT EXISTS idx_vehicles_created ON vehicles(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS désactivé (accès via service_role uniquement côté serveur)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Policy : pas d'accès direct via anon key (tout passe par les API routes)
-- Le service_role bypass automatiquement le RLS
