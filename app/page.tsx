"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Layers, ArrowRight, Lock, AlertCircle } from "lucide-react";
import { RequirementsResponse } from "@/types/execution";
import CustomSelect from "@/components/CustomSelect";

export default function Home() {
  const [goal, setGoal] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [requirements, setRequirements] = useState<RequirementsResponse | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);
  const router = useRouter();

  async function handleInitialize() {
    if (!goal.trim()) return;

    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-requirements", {
        method: "POST",
        body: JSON.stringify({ goal }),
      });

      const data: RequirementsResponse = await res.json();

      if (data.needsMoreInfo) {
        setRequirements(data);
        setLocked(true);
      } else {
        setLocked(true);
        router.push(`/execute?goal=${encodeURIComponent(goal)}`);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setLocked(true);
      router.push(`/execute?goal=${encodeURIComponent(goal)}`);
    } finally {
      setAnalyzing(false);
    }
  }

  function handleProceedWithDetails() {
    const enrichedGoal = `${goal}\n\nAdditional Context:\n${Object.entries(additionalInfo)
      .map(([key, value]) => {
        const field = requirements?.fields?.find(f => f.id === key);
        return `${field?.label}: ${value}`;
      })
      .join('\n')}`;

    router.push(`/execute?goal=${encodeURIComponent(enrichedGoal)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#050505] grid-bg">
      <div className="w-full max-w-4xl">

        {/* Header */}
        <header className="mb-16 flex items-center justify-between border-b-2 border-zinc-800 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 surface flex items-center justify-center">
              <Layers className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-[0.2em] uppercase text-white">NOT A PROMPT</h1>
              <p className="text-[10px] text-zinc-600 font-medium tracking-wider mt-0.5">EXECUTION ENGINE V2.0</p>
            </div>
          </div>
          <div className="text-[9px] font-mono px-3 py-1.5 surface text-zinc-500 uppercase tracking-wider">
            CHANNEL: DETERMINISTIC
          </div>
        </header>

        {/* Main Content */}
        <main className="surface p-10">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            {/* Title Section */}
            <div className="space-y-3 pb-6 border-b-2 border-zinc-800">
              <h2 className="label text-zinc-400">Define Execution Goal</h2>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
                Specify the objective. The compiler will analyze requirements and generate a deterministic workflow.
              </p>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <textarea
                autoFocus
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                disabled={locked}
                placeholder="What should the engine execute?"
                className="input-field w-full min-h-[240px] text-base leading-relaxed font-light resize-none"
              />

              {locked && !requirements && (
                <div className="flex items-center gap-2 text-xs text-zinc-600 surface p-3 rounded border border-zinc-800">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="font-mono">Input locked — compiling execution graph</span>
                </div>
              )}
            </div>

            {/* Requirements Form */}
            {requirements?.needsMoreInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Alert Box */}
                <div className="surface p-6 border-l-2 border-blue-600">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                        Input Insufficiency Detected
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{requirements.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-5">
                  {requirements.fields?.map((field) => (
                    <CustomSelect
                      key={field.id}
                      label={field.label}
                      options={field.options || []}
                      value={additionalInfo[field.id] || ""}
                      onValueChangeAction={(val: string) => setAdditionalInfo({ ...additionalInfo, [field.id]: val })}
                      required={field.required}
                    />
                  ))}
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleProceedWithDetails}
                    disabled={requirements.fields?.some(f => f.required && !additionalInfo[f.id])}
                    className="btn-primary flex items-center gap-2"
                  >
                    Compile Execution Graph
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Initial Action */}
            {!requirements && !locked && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleInitialize}
                  disabled={!goal.trim() || analyzing}
                  className="btn-primary flex items-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Initialize Engine
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="mt-24 flex justify-between items-center text-[9px] font-mono text-zinc-800 border-t border-zinc-900 pt-8">
          <span className="uppercase tracking-wider">OVERSIGHT: ENABLED</span>
          <span className="uppercase tracking-wider">BUFFER ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
        </footer>

      </div>
    </div>
  );
}
