import type { AnalyseResult } from "./types";

export const DEMO_RESULT: AnalyseResult = {
  vehicule: {
    marque: "Renault",
    modele: "Clio IV",
    immatriculation: "FG-123-AB",
    annee: "2017",
    kilometrage: 98450,
  },
  score_sante: 62,
  defaillances: [
    {
      code: "1.1.13.a.2",
      libelle: "Plaquettes de frein arrière usées",
      description:
        "Les plaquettes qui servent a ralentir vos roues arrières sont trop fines. Votre freinage est moins efficace, surtout en cas d'urgence.",
      gravite: "majeur",
      localisation: "ARG, ARD",
      cout_min: 40,
      cout_max: 200,
      priorite: 1,
      reparation: "Remplacement des plaquettes + verification des disques",
      peut_faire_soi_meme: true,
    },
    {
      code: "4.3.2.b.1",
      libelle: "Fuite légère d'échappement",
      description:
        "Un petit trou ou une jointure défaillante laisse passer les gaz d'échappement. Vous avez peut-etre remarque un bruit plus fort au démarrage.",
      gravite: "majeur",
      localisation: "AR",
      cout_min: 80,
      cout_max: 250,
      priorite: 1,
      reparation: "Remplacement du joint ou soudure de la ligne d'échappement",
      peut_faire_soi_meme: false,
    },
    {
      code: "7.1.2.a.1",
      libelle: "Phare avant droit mal réglé",
      description:
        "Le faisceau lumineux de votre phare droit est trop haut, ce qui peut éblouir les conducteurs en face la nuit.",
      gravite: "mineur",
      localisation: "AVD",
      cout_min: 25,
      cout_max: 60,
      priorite: 3,
      reparation: "Reglage de la hauteur du phare en atelier",
      peut_faire_soi_meme: false,
    },
    {
      code: "5.1.1.a.2",
      libelle: "Pneu avant gauche use",
      description:
        "Le pneu a atteint la limite légale d'usure (1.6mm). Il n'assure plus un freinage correct sur sol mouillé.",
      gravite: "majeur",
      localisation: "AVG",
      cout_min: 45,
      cout_max: 150,
      priorite: 1,
      reparation: "Remplacement du pneu + verification du parallélisme",
      peut_faire_soi_meme: false,
    },
    {
      code: "6.2.3.a.1",
      libelle: "Corrosion légère sur berceau",
      description:
        "De la rouille superficielle est apparue sur la piece metallique qui soutient le moteur. Ce n'est pas dangereux pour l'instant mais a surveiller.",
      gravite: "mineur",
      localisation: "AV",
      cout_min: 150,
      cout_max: 300,
      priorite: 3,
      reparation: "Traitement anti-corrosion + peinture de protection",
      peut_faire_soi_meme: false,
    },
  ],
  cout_total_min: 340,
  cout_total_max: 960,
  cote_argus_estimee: null,
  verdict: "reparer",
  conseil_verdict:
    "Le cout total reste raisonnable pour une Clio de 2017. Les reparations obligatoires (frein, échappement, pneu) sont prioritaires pour passer la contre-visite.",
  contre_visite_deadline: "15/05/2026",
  conseils: [
    "Faites faire les freins et le pneu en priorite : ce sont les defaillances qui bloquent la contre-visite.",
    "Demandez 2-3 devis a des garages independants plutot qu'en concession — vous économiserez 20 a 30%.",
    "La corrosion sur le berceau n'est pas bloquante mais traitez-la avant l'hiver prochain pour eviter qu'elle s'aggrave.",
  ],
};
