"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Props = {
    content: string;
    type: "code" | "config" | "schema" | "checklist" | "text" | "comparison";
};

export default function ArtifactRenderer({ content, type }: Props) {
    const cleanJson = (str: string) => {
        return str.replace(/```json\n?|```/g, "").trim();
    };

    if (type === "comparison") {
        try {
            const cleaned = cleanJson(content);
            const parsed = JSON.parse(cleaned);
            return <ComparisonView data={parsed} />;
        } catch (e) {
            console.error("Comparison Parse Error:", e);
            return (
                <div className="space-y-4">
                    <div className="text-red-400 text-xs bg-red-400/10 p-3 border border-red-400/20 rounded-lg font-mono">
                        Error parsing comparison data. Falling back to source view.
                    </div>
                    <CodeView content={content} />
                </div>
            );
        }
    }

    // Try to parse as JSON for schema/config types
    if (type === "schema" || type === "config") {
        try {
            const cleaned = cleanJson(content);
            const parsed = JSON.parse(cleaned);
            return <SchemaView data={parsed} />;
        } catch {
            // Fallback to code view if not valid JSON
        }
    }

    if (type === "checklist") {
        return <ChecklistView content={content} />;
    }

    if (type === "text") {
        return <RichTextView content={content} />;
    }

    return <CodeView content={content} />;
}

function SchemaView({ data }: { data: any }) {
    return (
        <div className="space-y-3">
            {renderObject(data)}
        </div>
    );

    function renderObject(obj: any, depth = 0): React.ReactNode {
        if (obj === null || obj === undefined) {
            return <span className="text-gray-500 italic">null</span>;
        }

        if (typeof obj !== "object") {
            return renderPrimitive(obj);
        }

        if (Array.isArray(obj)) {
            return (
                <div className="space-y-2">
                    {obj.map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-300">
                                {i + 1}
                            </div>
                            <div className="flex-1">
                                {typeof item === "object" ? renderObject(item, depth + 1) : renderPrimitive(item)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {Object.entries(obj).map(([key, value]) => (
                    <div
                        key={key}
                        className={`rounded-lg border border-white/5 overflow-hidden ${depth === 0 ? "bg-black/40" : "bg-black/20"
                            }`}
                    >
                        <div className="px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                </svg>
                                <span className="font-mono text-sm font-semibold text-indigo-300">{key}</span>
                                <span className="text-xs text-gray-600 ml-auto">{getType(value)}</span>
                            </div>
                        </div>
                        <div className="px-4 py-3">
                            {typeof value === "object" ? renderObject(value, depth + 1) : renderPrimitive(value)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    function renderPrimitive(value: any): React.ReactNode {
        if (typeof value === "boolean") {
            return (
                <span className={`px-2 py-1 rounded text-xs font-bold ${value ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                    {value.toString()}
                </span>
            );
        }

        if (typeof value === "number") {
            return <span className="text-purple-400 font-mono">{value}</span>;
        }

        if (typeof value === "string") {
            // Check if it's a URL
            if (value.startsWith("http://") || value.startsWith("https://")) {
                return (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                        {value}
                    </a>
                );
            }
            return <span className="text-gray-300">{value}</span>;
        }

        return <span className="text-gray-500 italic">{String(value)}</span>;
    }

    function getType(value: any): string {
        if (value === null) return "null";
        if (Array.isArray(value)) return `array[${value.length}]`;
        if (typeof value === "object") return "object";
        return typeof value;
    }
}

function ChecklistView({ content }: { content: string }) {
    const lines = content.split("\n").filter(line => line.trim());
    const [checkedItems, setCheckedItems] = useState<Set<number>>(
        new Set(
            lines
                .map((line, i) => ({ line, i }))
                .filter(({ line }) => line.trim().startsWith("- [x]") || line.trim().startsWith("* [x]"))
                .map(({ i }) => i)
        )
    );

    const toggleItem = (index: number) => {
        const newChecked = new Set(checkedItems);
        if (newChecked.has(index)) {
            newChecked.delete(index);
        } else {
            newChecked.add(index);
        }
        setCheckedItems(newChecked);
    };

    return (
        <div className="space-y-2">
            {lines.map((line, i) => {
                const isChecked = checkedItems.has(i);
                const text = line.replace(/^[-*]\s*\[[ x]\]\s*/, "").trim();

                return (
                    <div
                        key={i}
                        onClick={() => toggleItem(i)}
                        className="flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
                    >
                        <div
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isChecked
                                ? "bg-blue-600 border-blue-600"
                                : "border-zinc-600 group-hover:border-zinc-500"
                                }`}
                        >
                            {isChecked && (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>
                        <span className={`flex-1 text-sm transition-all ${isChecked ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-white"
                            }`}>
                            {text || line}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function ComparisonView({ data }: { data: any }) {
    if (!data || !data.options || !Array.isArray(data.options)) {
        return <div className="text-red-400 text-xs">Invalid comparison data format. Expected {`{ options: [...] }`}</div>;
    }

    const { title, options, features } = data;

    return (
        <div className="space-y-6">
            {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}

            <div className="overflow-x-auto custom-scrollbar -mx-6 px-6">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 text-left border-b-2 border-white/5 bg-white/5 first:rounded-tl-xl font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                                {data.featureLabel || "Feature"}
                            </th>
                            {options.map((opt: any, i: number) => (
                                <th key={i} className="p-4 text-center border-b-2 border-white/5 bg-white/5 last:rounded-tr-xl font-bold text-white min-w-[150px]">
                                    {opt.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(features || Object.keys(options[0].features || {})).map((feature: string, i: number) => (
                            <tr key={feature} className="group border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="p-4 text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                                    {feature}
                                </td>
                                {options.map((opt: any, j: number) => (
                                    <td key={j} className="p-4 text-center text-sm font-mono text-zinc-300">
                                        {renderValue(opt.features?.[feature] ?? opt[feature])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    function renderValue(val: any) {
        if (val === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
        if (val === false) return <span className="text-red-500 text-lg">×</span>;
        if (typeof val === "string") return val;
        return String(val);
    }
}

function RichTextView({ content }: { content: string }) {
    // Simple markdown-style parsing for bold, italic, and headers
    const parseContent = (text: string) => {
        return text.split("\n").map((line, i) => {
            if (line.startsWith("### ")) {
                return <h3 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace("### ", "")}</h3>;
            }
            if (line.startsWith("## ")) {
                return <h2 key={i} className="text-xl font-bold text-white mt-5 mb-3">{line.replace("## ", "")}</h2>;
            }
            if (line.startsWith("# ")) {
                return <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-4">{line.replace("# ", "")}</h1>;
            }

            // Handle bold **text**
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <p key={i} className="text-gray-300 leading-relaxed mb-2 text-sm">
                    {parts.map((part, j) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={j} className="text-indigo-400 font-semibold">{part.slice(2, -2)}</strong>;
                        }
                        return part;
                    })}
                </p>
            );
        });
    };

    return (
        <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-8 overflow-auto max-h-[600px] shadow-inner">
            <div className="prose prose-invert prose-zinc max-w-none">
                {parseContent(content)}
            </div>
        </div>
    );
}

function CodeView({ content }: { content: string }) {
    return (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0D1117] shadow-2xl transition-all hover:border-indigo-500/30">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40"></div>
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Source Code</div>
                <button
                    onClick={() => navigator.clipboard.writeText(content)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-medium text-zinc-400 hover:text-white transition-all"
                >
                    Copy
                </button>
            </div>
            <pre className="p-6 text-sm overflow-auto max-h-[500px] text-indigo-100 font-mono leading-relaxed custom-scrollbar">
                {content}
            </pre>
            <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex justify-between items-center">
                <div className="text-[10px] text-zinc-600 font-mono uppercase">Length: {content.length} chars</div>
                <div className="text-[10px] text-zinc-600 font-mono uppercase">{content.split('\n').length} lines</div>
            </div>
        </div>
    );
}
