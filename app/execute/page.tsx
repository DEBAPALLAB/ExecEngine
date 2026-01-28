"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Layers, Home } from "lucide-react";
import { ExecutionGraph } from "@/types/execution";
import StepList from "@/components/StepList";
import StepViewer from "@/components/StepViewer";
import ProgressBar from "@/components/ProgressBar";
import DoneScreen from "@/components/DoneScreen";

function ExecutionContent() {
    const params = useSearchParams();
    const goal = params.get("goal")!;
    const [graph, setGraph] = useState<ExecutionGraph | null>(null);
    const [activeStepId, setActiveStepId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log("Client: Initializing engine for goal:", goal);
        fetch("/api/generate-graph", {
            method: "POST",
            body: JSON.stringify({ goal }),
        })
            .then(async (res) => {
                console.log("Client: API response received for graph, status:", res.status);
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to generate graph");
                }
                return res.json();
            })
            .then(data => {
                console.log("Client: Graph data loaded successfully", data);
                if (!data.steps || !Array.isArray(data.steps)) {
                    console.error("Client: Invalid graph data received (empty or missing steps)", data);
                    throw new Error("Invalid response format from AI. No steps were generated.");
                }
                setGraph(data);
            })
            .catch((err) => {
                console.error("Client: Engine initialization failed", err);
                setError(err.message);
            });
    }, [goal]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] grid-bg">
                <div className="w-full max-w-2xl text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 surface text-red-500 font-mono text-[10px] uppercase tracking-wider border-red-900/30">
                        ⚠ Compilation Failed
                    </div>

                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">
                        Execution Failed
                    </h1>

                    <div className="surface p-6 max-w-md mx-auto">
                        <p className="text-sm text-zinc-400 leading-relaxed">{error}</p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            New Compilation
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!graph || !graph.steps) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] grid-bg">
                <div className="w-full max-w-2xl text-center space-y-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 surface mb-4">
                        <div className="w-8 h-8 border-2 border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>

                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">
                        Compiling Graph
                    </h1>

                    <p className="text-sm text-zinc-500 max-w-md mx-auto">
                        The engine is architecting the optimal execution path for:
                    </p>

                    <div className="surface p-6 max-w-md mx-auto">
                        <p className="text-sm text-zinc-400 leading-relaxed italic">"{goal}"</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-700">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                        <span>Mapping execution graph...</span>
                    </div>

                    <p className="text-xs text-zinc-800 font-mono">
                        This usually takes 10-20 seconds
                    </p>
                </div>
            </div>
        );
    }

    const acknowledged = graph.steps.filter(s => s.completed || s.skipped).length;

    if (acknowledged === graph.steps.length && graph.steps.length > 0) {
        return <DoneScreen />;
    }

    return (
        <div className="min-h-screen bg-[#050505] grid-bg">
            <div className="max-w-[1800px] mx-auto p-6">
                {/* Header */}
                <header className="mb-8 flex items-center justify-between border-b border-zinc-900 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 surface flex items-center justify-center">
                            <Layers className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold tracking-widest uppercase text-white">Execution Runtime</h1>
                            <p className="text-xs text-zinc-600 font-medium tracking-tight">
                                Compiled Graph: <span className="text-zinc-500 italic">{goal}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-[10px] font-mono px-2 py-1 surface text-zinc-600 hover:text-zinc-400 transition-colors flex items-center gap-2"
                    >
                        <Home className="w-3 h-3" />
                        NEW COMPILATION
                    </button>
                </header>

                <ProgressBar current={acknowledged} total={graph.steps.length} />

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    <StepList
                        steps={graph.steps}
                        activeStepId={activeStepId}
                        onSelect={setActiveStepId}
                    />
                    <StepViewer
                        graph={graph}
                        activeStepId={activeStepId}
                        setGraph={setGraph}
                    />
                </div>
            </div>
        </div>
    );
}

export default function ExecutePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-zinc-800 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        }>
            <ExecutionContent />
        </Suspense>
    );
}
