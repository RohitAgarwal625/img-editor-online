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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
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
          <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="max-w-md w-full rounded-3xl bg-slate-900/90 border border-red-500/30 p-8 text-center space-y-5 shadow-2xl backdrop-blur-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">Removal Unsuccessful</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {appState.message}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetToIdle}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold py-3 px-4 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Another Image</span>
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
