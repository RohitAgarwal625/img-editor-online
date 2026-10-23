"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "How does RemoveBG compare to remove.bg?",
    answer:
      "Remove.bg charges up to $1.99 per high-res download, downsamples free users to tiny 0.25 megapixel previews, and uploads your photos to external servers. RemoveBG is 100% free, processes photos locally in your browser for absolute privacy, and exports in full native resolution with zero watermarks.",
  },
  {
    question: "Is RemoveBG really free? Are there hidden credit limits?",
    answer:
      "Yes, completely free. We do not require credit cards, subscriptions, or login accounts. Because the neural network runs on your device via WebAssembly rather than on expensive cloud GPUs, we don't need to charge subscription fees.",
  },
  {
    question: "Are my uploaded photos private and confidential?",
    answer:
      "Absolute privacy is our core architecture. Your photos never leave your device. The background removal model executes locally within your browser's WebAssembly sandbox. No external server, company, or database ever sees or stores your files.",
  },
  {
    question: "Why does the first image take slightly longer to begin?",
    answer:
      "On your first visit, your browser downloads the pre-trained neural network weights (~40-80MB) and compiles the WebAssembly runtime. Once downloaded, the model is cached permanently in your browser, making all subsequent background removals nearly instantaneous.",
  },
  {
    question: "Can I replace the background with pure white for Amazon or Shopify?",
    answer:
      "Yes. In the results editor, click the 'Pure White' swatch to instantly composite your cutout onto a pure white (#FFFFFF) background compliant with Amazon, Shopify, eBay, and Google Merchant Center specifications.",
  },
  {
    question: "Can I use the cutout images commercially?",
    answer:
      "Yes. You retain 100% copyright and ownership of all output files. There are no watermarks, licensing fees, or attribution requirements.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Common questions about browser-based AI background removal.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 shadow-xs">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.question} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 hover:text-blue-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-50"
                  >
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
