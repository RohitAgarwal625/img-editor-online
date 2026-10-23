"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does RemoveBG compare to remove.bg?",
    answer:
      "Remove.bg charges up to $1.99 per high-res image, restricts free users to tiny 0.25 megapixel previews, and uploads your files to external cloud servers. RemoveBG runs 100% in your browser using local AI, provides full-resolution downloads, leaves zero watermarks, and is completely free with no account required.",
  },
  {
    question: "Is RemoveBG really free? Are there hidden limits?",
    answer:
      "Yes, RemoveBG is completely free for both personal and commercial use. Because our neural network executes locally on your device via WebAssembly rather than on expensive cloud GPUs, we don't need to charge subscription fees or limit your image credits.",
  },
  {
    question: "Are my uploaded photos private and secure?",
    answer:
      "Absolute privacy is our core principle. Your images never leave your computer. The background removal algorithm runs entirely within your browser's local sandbox memory. No third party, server, or cloud service ever sees or stores your photos.",
  },
  {
    question: "Why does the first image take slightly longer to start?",
    answer:
      "On your first visit, your browser downloads the pre-trained neural network weights (~40-80MB) and compiles the WebAssembly runtime. Once downloaded, the AI model is cached locally on your device, making every subsequent background removal nearly instantaneous.",
  },
  {
    question: "Can I replace the background with white for Amazon or Shopify?",
    answer:
      "Yes! In the results editor, simply click the 'Pure White' swatch. You can export directly as a clean white-background JPEG, PNG, or WebP compliant with Amazon, Shopify, eBay, and Google Merchant Center specifications.",
  },
  {
    question: "Can I use the images for commercial client work?",
    answer:
      "Yes. You retain full copyright and ownership of all output files. There are no watermarks, licensing fees, or attribution requirements whatsoever.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-slate-900/40 border-t border-slate-800/80 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Everything you need to know about our in-browser AI background remover.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl bg-slate-950/70 border border-slate-800 overflow-hidden transition-colors hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-white transition-colors"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-indigo-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-slate-900">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
