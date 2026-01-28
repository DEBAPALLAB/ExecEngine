type Props = {
  current: number;
  total: number;
};

export default function ProgressBar({ current, total }: Props) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="surface p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="label mb-1">Execution Progress</h2>
          <p className="text-2xl font-bold text-white font-mono">{percent}%</p>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-zinc-600 mb-1 font-mono">STEPS ACKNOWLEDGED</div>
          <div className="text-lg font-bold text-white font-mono">
            {current} <span className="text-zinc-700">/</span> {total}
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative h-1 bg-black rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Milestone Markers */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i < current
                ? "bg-blue-600"
                : "bg-zinc-800"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
