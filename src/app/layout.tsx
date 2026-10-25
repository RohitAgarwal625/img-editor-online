import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://removebg-online.vercel.app"),
  title: {
    default: "Free AI Background Remover Online | RemoveBG Online",
    template: "%s | RemoveBG Online",
  },
  description:
    "Remove image backgrounds online with AI. Upload your photo and get a clean transparent background in seconds. Fast, simple and easy to use.",
  applicationName: "RemoveBG Online",
  keywords: [
    "free AI background remover online",
    "remove image background online",
    "remove background transparent",
    "AI background removal",
    "remove bg online free",
    "remove.bg alternative free",
    "ecommerce white background",
    "product photo background remover",
    "in browser background remover",
    "transparent png maker",
  ],
  authors: [{ name: "RemoveBG Online", url: "https://removebg-online.vercel.app" }],
  creator: "RemoveBG Online",
  publisher: "RemoveBG Online",
  alternates: {
    canonical: "https://removebg-online.vercel.app/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  verification: {
    google: "J6hGqVfAWQaOrQIO0Xs-LO0RKQuKkfTrYdeAk2VJ5mE",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://removebg-online.vercel.app/",
    siteName: "RemoveBG Online",
    title: "Free AI Background Remover Online | RemoveBG Online",
    description:
      "Remove image backgrounds online with AI. Upload your photo and get a clean transparent background in seconds. Fast, simple and easy to use.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RemoveBG Online - Free AI Background Remover",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Background Remover Online | RemoveBG Online",
    description:
      "Remove image backgrounds online with AI. Upload your photo and get a clean transparent background in seconds. Fast, simple and easy to use.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="stylesheet" href="/compiled.css" />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
