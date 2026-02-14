import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArahBelajarAI - Temukan Arah Belajarmu",
    short_name: "ArahBelajar",
    description:
      "Identifikasi skill gap dan persiapkan karir impianmu dengan AI",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3B5EDB",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
