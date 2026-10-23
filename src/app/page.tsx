"use client";

import React, { useState, useCallback, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { BeforeAfterDemo } from "@/components/sections/BeforeAfterDemo";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { FormatsSection } from "@/components/sections/FormatsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { ProcessingView } from "@/components/processing/ProcessingView";
import { ResultsWorkspace } from "@/components/results/ResultsWorkspace";
import { removeImageBackground, RemovalProgress, RemovalResult } from "@/lib/background-removal";
import { AlertCircle, RotateCcw } from "lucide-react";

type AppState =
  | { phase: "idle" }
  | { phase: "processing"; file: File; originalUrl: string; progress: RemovalProgress }
  | { phase: "result"; file: File; originalUrl: string; result: RemovalResult }
  | { phase: "error"; file?: File; originalUrl?: string; message: string };

export default function Home() {
  const [appState, setAppState] = useState<AppState>({ phase: "idle" });
  const abortControllerRef = useRef<boolean>(false);

  const handleStartRemoval = useCallback(async (file: File) => {
    abortControllerRef.current = false;
    const originalUrl = URL.createObjectURL(file);

    setAppState({
      phase: "processing",
      file,
      originalUrl,
      progress: {
        stage: "init",
        percent: 5,
        message: "Initializing background remover...",
      },
    });

    try {
      const result = await removeImageBackground(file, (progress) => {
        if (abortControllerRef.current) return;
        setAppState((prev) => {
          if (prev.phase === "processing") {
            return {
              ...prev,
              progress,
            };
          }
          return prev;
        });
      });

      if (abortControllerRef.current) {
        URL.revokeObjectURL(result.url);
        return;
      }

      setAppState({
        phase: "result",
        file,
        originalUrl,
        result,
      });
    } catch (err: unknown) {
      if (abortControllerRef.current) return;
      console.error("Background removal error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during background removal. Please try again with another image.";
      setAppState({
        phase: "error",
        file,
        originalUrl,
        message,
      });
    }
  }, []);

  const handleCancelProcessing = useCallback(() => {
    abortControllerRef.current = true;
    if (appState.phase === "processing" && appState.originalUrl) {
      URL.revokeObjectURL(appState.originalUrl);
    }
    setAppState({ phase: "idle" });
  }, [appState]);

  const handleResetToIdle = useCallback(() => {
    if (appState.phase === "result") {
      URL.revokeObjectURL(appState.originalUrl);
      URL.revokeObjectURL(appState.result.url);
    } else if (appState.phase === "error" && appState.originalUrl) {
      URL.revokeObjectURL(appState.originalUrl);
    }
    setAppState({ phase: "idle" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [appState]);

  // Handler for demo section sample selection
  const handleSelectDemoSample = useCallback(
    async (sampleUrl: string, sampleName: string) => {
      try {
        const res = await fetch(sampleUrl);
        const blob = await res.blob();
        const file = new File([blob], sampleName, { type: "image/jpeg" });
        handleStartRemoval(file);
      } catch (err) {
        console.error("Failed to load demo sample", err);
      }
    },
    [handleStartRemoval]
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
      {/* Navbar with dynamic action based on state */}
      <Navbar
        showReset={appState.phase === "result" || appState.phase === "error"}
        onReset={handleResetToIdle}
      />

      <main className="flex-1">
        {/* Processing State */}
        {appState.phase === "processing" && (
          <ProcessingView
            progress={appState.progress}
            originalUrl={appState.originalUrl}
            onCancel={handleCancelProcessing}
          />
        )}

        {/* Results Workspace State */}
        {appState.phase === "result" && (
          <ResultsWorkspace
            originalFile={appState.file}
            originalUrl={appState.originalUrl}
            resultBlob={appState.result.blob}
            resultUrl={appState.result.url}
            dimensions={{
              width: appState.result.width,
              height: appState.result.height,
            }}
            onReset={handleResetToIdle}
          />
        )}

        {/* Error State */}
        {appState.phase === "error" && (
          <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-xl bg-zinc-900 border border-zinc-800 p-6 text-center space-y-4 shadow-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-zinc-100">Processing Failed</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {appState.message}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToIdle}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Upload Another Image</span>
              </button>
            </div>
          </div>
        )}

        {/* Idle Landing Page State */}
        {appState.phase === "idle" && (
          <>
            <HeroSection onFileSelected={handleStartRemoval} />
            <BeforeAfterDemo onSelectSample={handleSelectDemoSample} />
            <HowItWorksSection />
            <FeaturesSection />
            <FormatsSection />
            <FAQSection />
          </>
        )}
      </main>

      {/* Footer is visible on landing page or results */}
      {appState.phase !== "processing" && <Footer />}
    </div>
  );
}
