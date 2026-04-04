import { z } from "zod";

export const VehiculeSchema = z.object({
  marque: z.string().min(1),
  modele: z.string().min(1),
  immatriculation: z.string(),
  annee: z.string(),
  kilometrage: z.number().min(0),
});

export const DefaillanceSchema = z.object({
  code: z.string(),
  libelle: z.string().min(1),
  description: z.string(),
  gravite: z.enum(["critique", "majeur", "mineur"]),
  localisation: z.string(),
  cout_min: z.number().min(0),
  cout_max: z.number().min(0),
  cout_moyen: z.number().min(0).optional(),
  cout_piece: z.string().optional(),
  cout_main_oeuvre: z.string().optional(),
  priorite: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  reparation: z.string(),
  peut_faire_soi_meme: z.boolean().optional().default(false),
});

export const AnalyseResultSchema = z.object({
  vehicule: VehiculeSchema,
  score_sante: z.number().min(0).max(100),
  defaillances: z.array(DefaillanceSchema),
  cout_total_min: z.number().min(0),
  cout_total_max: z.number().min(0),
  cote_argus_estimee: z.number().nullable(),
  verdict: z.enum(["reparer", "vendre", "arbitrage"]),
  conseil_verdict: z.string(),
  contre_visite_deadline: z.string().nullable(),
  conseils: z.array(z.string()),
});

export type Vehicule = z.infer<typeof VehiculeSchema>;
export type Defaillance = z.infer<typeof DefaillanceSchema>;
export type AnalyseResult = z.infer<typeof AnalyseResultSchema>;
