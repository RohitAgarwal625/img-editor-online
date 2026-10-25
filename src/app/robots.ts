import type { MetadataRoute } from "next";

/**
 * Dynamic Next.js Robots configuration
 * Endpoint: https://removebg-online.vercel.app/robots.txt
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://removebg-online.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "Googlebot",
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
