import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BookVerse AI",
    short_name: "BookVerse",
    description:
      "An immersive way to understand any book, painted in light.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6EE",
    theme_color: "#FBF6EE",
    icons: [{ src: "/icon", sizes: "any", type: "image/png" }],
  };
}
