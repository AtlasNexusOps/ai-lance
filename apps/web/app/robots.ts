import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai2work.onrender.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/style-guide/",
          "/settings/",
          "/worker/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
