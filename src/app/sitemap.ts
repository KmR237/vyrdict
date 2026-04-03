import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://vyrdict.fr", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://vyrdict.fr/guide-controle-technique", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://vyrdict.fr/contre-visite", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://vyrdict.fr/mentions-legales", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
