import { useState } from "react";
import { ExecutionGraph } from "@/types/execution";
import { Check, ArrowRight, SkipForward, RotateCcw } from "lucide-react";
import ArtifactRenderer from "./ArtifactRenderer";

type Props = {
  graph: ExecutionGraph;
  activeStepId: string | null;
  setGraph: (g: ExecutionGraph) => void;
};

export default function StepViewer({
  graph,
  activeStepId,
  setGraph,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!activeStepId) {
    return (
      <div className="surface p-12 text-center min-h-[600px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 surface flex items-center justify-center mb-4">
          <ArrowRight className="w-6 h-6 text-zinc-700" />
        </div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Select a Step</h3>
        <p className="text-xs text-zinc-600 max-w-sm">
          Choose a step from the execution graph to view details and generate required artifacts.
        </p>
      </div>
    );
  }

  const step = graph.steps?.find((s) => s.id === activeStepId);

  if (!step) {
    return (
      <div className="surface p-12 text-center border-red-900/30">
        <div className="text-red-500 text-sm font-bold uppercase">⚠ Step Not Found</div>
        <p className="text-zinc-600 mt-2 text-xs">The compiled graph structure is invalid.</p>
      </div>
    );
  }

  async function generateArtifact() {
    if (step!.artifact || loading) return;

    console.log(`StepViewer: Generating artifact for step "${step!.title}"...`);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-artifact", {
        method: "POST",
        body: JSON.stringify({ goal: graph.goal, step }),
      });

      console.log(`StepViewer: Received response, status: ${res.status}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Artifact generation failed");
      }

      console.log(`StepViewer: Artifact generated (${data.artifact?.length || 0} chars)`);
      step!.artifact = data.artifact;
      setGraph({ ...graph });
    } catch (err: any) {
      console.error("StepViewer: Generation failed", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function acknowledgeStep(action: 'complete' | 'skip') {
    console.log(`StepViewer: Acknowledging step "${step!.title}" as ${action}`);

    if (action === 'complete') {
      step!.completed = true;
      step!.skipped = false;
    } else {
      step!.skipped = true;
      step!.completed = false;
    }

    setGraph({ ...graph });
  }

  const isAcknowledged = step.completed || step.skipped;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{step.title}</h2>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-mono px-2 py-1 surface text-blue-400 border-blue-900/30 uppercase tracking-wider">
                {step.artifactType}
              </span>
              <span className="text-[9px] font-mono text-zinc-600">
                STEP {step.id}
              </span>
            </div>
          </div>

          {step.completed && (
            <div className="status-badge complete">
              <Check className="w-3 h-3" />
              Completed
            </div>
          )}

          {step.skipped && (
            <div className="status-badge pending">
              <SkipForward className="w-3 h-3" />
              Skipped
            </div>
          )}
        </div>

        <div className="border-t border-zinc-900 pt-4">
          <h3 className="label mb-2">Execution Instruction</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">{step.instruction}</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="surface p-6 bg-red-950/20 border-red-900/30">
          <div className="flex items-start gap-3">
            <div className="w-1 h-12 bg-red-600 rounded-full"></div>
            <div>
              <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Generation Failed</h4>
              <p className="text-xs text-red-300/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Artifact Display */}
      {step.artifact && (
        <div className="surface p-6 bg-black">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-zinc-900">
            <h3 className="label">Generated Artifact</h3>
            <span className="text-[9px] font-mono text-zinc-600">SOURCE: REMOTE</span>
          </div>
          <ArtifactRenderer content={step.artifact} type={step.artifactType} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="surface p-4 flex items-center justify-between bg-zinc-950">
        {!step.artifact && !isAcknowledged && (
          <button
            onClick={generateArtifact}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                Generate Artifact
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {!isAcknowledged && (
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => acknowledgeStep('skip')}
              className="btn-secondary flex items-center gap-2 text-xs"
            >
              <SkipForward className="w-3 h-3" />
              Skip
            </button>
            <button
              onClick={() => acknowledgeStep('complete')}
              className="btn-primary flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Mark Complete
            </button>
          </div>
        )}

        {isAcknowledged && (
          <button
            onClick={() => {
              step!.completed = false;
              step!.skipped = false;
              setGraph({ ...graph });
            }}
            className="btn-secondary flex items-center gap-2 text-xs ml-auto"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Acknowledgment
          </button>
        )}
      </div>
    </div>
  );
}
