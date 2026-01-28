import { ExecutionStep } from "@/types/execution";
import { CheckCircle2, Circle } from "lucide-react";

type Props = {
  steps: ExecutionStep[];
  activeStepId: string | null;
  onSelect: (id: string) => void;
};

export default function StepList({
  steps,
  activeStepId,
  onSelect,
}: Props) {
  return (
    <div className="surface p-6 h-fit sticky top-8">
      <div className="flex justify-between items-end border-b border-zinc-900 pb-3 mb-4">
        <h2 className="label">Execution Steps</h2>
        <span className="text-[10px] font-mono text-zinc-600">{steps.length} TOTAL</span>
      </div>

      <ul className="space-y-2">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isAcknowledged = step.completed || step.skipped;

          return (
            <li
              key={step.id}
              onClick={() => onSelect(step.id)}
              className={`p-3 border rounded cursor-pointer text-[11px] flex items-center gap-3 transition-all ${isActive
                  ? "border-blue-500/50 bg-blue-500/5 text-blue-400"
                  : isAcknowledged
                    ? "border-zinc-800 text-zinc-500 opacity-50"
                    : "border-transparent text-zinc-700 hover:border-zinc-800 hover:text-zinc-400"
                }`}
            >
              {isAcknowledged ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{step.title}</div>
                <div className="text-[9px] text-zinc-600 uppercase mt-0.5 font-mono">
                  {step.artifactType}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Summary Footer */}
      <div className="mt-6 pt-4 border-t border-zinc-900">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-zinc-600">ACKNOWLEDGED</span>
          <span className="text-blue-500 font-bold">
            {steps.filter(s => s.completed || s.skipped).length} / {steps.length}
          </span>
        </div>
      </div>
    </div>
  );
}
