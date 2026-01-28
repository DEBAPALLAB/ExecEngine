import { Check } from "lucide-react";

export default function DoneScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#050505] grid-bg">
      <div className="w-full max-w-2xl text-center space-y-8">

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 surface text-blue-500 font-mono text-[10px] uppercase tracking-wider">
          <Check className="w-3 h-3" /> Verified Complete
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">
          Execution Terminal
        </h1>

        {/* Description */}
        <p className="text-zinc-500 max-w-md mx-auto text-sm">
          Target reached. All artifacts reviewed, checked, and delivered.
        </p>

        {/* Status Grid */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[
            { label: "Terminal State", value: "DONE" },
            { label: "Graph Status", value: "Immutable" },
            { label: "Execution", value: "Complete" }
          ].map((stat, i) => (
            <div key={i} className="surface p-4 text-center">
              <div className="text-[9px] text-zinc-600 mb-1 font-mono uppercase tracking-wider">{stat.label}</div>
              <div className="text-sm font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-xs text-zinc-700 font-mono mt-12">
          This execution has reached its deterministic conclusion.
        </p>
      </div>
    </div>
  );
}
