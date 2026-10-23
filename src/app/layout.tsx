import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://removebg.app"),
  title: "RemoveBG — Remove Image Background Free Online | AI-Powered",
  description:
    "Remove image backgrounds instantly and for free. 100% AI-powered, runs entirely in your browser — your images never leave your device. Best remove.bg alternative.",
  keywords: [
    "remove background",
    "remove.bg alternative",
    "background remover",
    "free background removal",
    "AI background remover",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "RemoveBG — Free AI Background Remover",
    description: "AI-powered background removal. Free, private, instant.",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RemoveBG — Free AI Background Remover",
    description: "Remove image backgrounds in seconds. Free. Private. No signup.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

