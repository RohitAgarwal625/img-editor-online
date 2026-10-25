import type { Metadata } from "next";
import { HomeApp } from "@/components/home/HomeApp";

export const metadata: Metadata = {
  title: "Free AI Background Remover Online | RemoveBG Online",
  description:
    "Remove image backgrounds online with AI. Upload your photo and get a clean transparent background in seconds. Fast, simple and easy to use.",
  alternates: {
    canonical: "https://removebg-online.vercel.app/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://removebg-online.vercel.app/#website",
      "url": "https://removebg-online.vercel.app/",
      "name": "RemoveBG Online",
      "description":
        "Remove image backgrounds online with AI. Upload your photo and get a clean transparent background in seconds. Fast, simple and easy to use.",
      "inLanguage": "en-US",
    },
    {
      "@type": "WebApplication",
      "@id": "https://removebg-online.vercel.app/#webapp",
      "name": "RemoveBG Online",
      "url": "https://removebg-online.vercel.app/",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All",
      "browserRequirements":
        "Requires WebAssembly and modern web browser support (Chrome, Edge, Firefox, Safari)",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "featureList": [
        "In-browser AI background removal via WebAssembly",
        "100% private client-side processing with zero server uploads",
        "Transparent alpha PNG and WebP exports",
        "One-click pure white e-commerce background replacement",
        "Sub-pixel hair and fur edge matting",
        "Full original resolution export with no watermarks",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://removebg-online.vercel.app/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How does RemoveBG compare to remove.bg?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Remove.bg charges up to $1.99 per high-res download, downsamples free users to tiny 0.25 megapixel previews, and uploads your photos to external servers. RemoveBG is 100% free, processes photos locally in your browser for absolute privacy, and exports in full native resolution with zero watermarks.",
          },
        },
        {
          "@type": "Question",
          "name": "Is RemoveBG really free? Are there hidden credit limits?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes, completely free. We do not require credit cards, subscriptions, or login accounts. Because the neural network runs on your device via WebAssembly rather than on expensive cloud GPUs, we don't need to charge subscription fees.",
          },
        },
        {
          "@type": "Question",
          "name": "Are my uploaded photos private and confidential?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Absolute privacy is our core architecture. Your photos never leave your device. The background removal model executes locally within your browser's WebAssembly sandbox. No external server, company, or database ever sees or stores your files.",
          },
        },
        {
          "@type": "Question",
          "name": "Why does the first image take slightly longer to begin?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "On your first visit, your browser downloads the pre-trained neural network weights (~40-80MB) and compiles the WebAssembly runtime. Once downloaded, the model is cached permanently in your browser, making all subsequent background removals nearly instantaneous.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I replace the background with pure white for Amazon or Shopify?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes. In the results editor, click the 'Pure White' swatch to instantly composite your cutout onto a pure white (#FFFFFF) background compliant with Amazon, Shopify, eBay, and Google Merchant Center specifications.",
          },
        },
        {
          "@type": "Question",
          "name": "Can I use the cutout images commercially?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Yes. You retain 100% copyright and ownership of all output files. There are no watermarks, licensing fees, or attribution requirements.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeApp />
    </>
  );
}
