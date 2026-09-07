import type { MetadataRoute } from "next";
import { NAME_AR, NAME_EN } from "@/lib/company";

/**
 * No square icon asset exists yet at a PWA-friendly size (elwaha-mark.png
 * is 382x553, a vertical lockup) — this references the generated
 * apple-icon route (src/app/apple-icon.tsx, 180x180) and favicon.ico
 * rather than stretching a non-square mark.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${NAME_EN} — ${NAME_AR}`,
    short_name: NAME_EN,
    description:
      "Deep-well pumps, motors, cables and control panels — supplied, installed and maintained across Egypt.",
    start_url: "/ar",
    display: "standalone",
    background_color: "#f6f5ef",
    theme_color: "#0e3b2e",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
