"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

type Props = {
    label: string;
    options: string[];
    value: string;
    onValueChangeAction: (value: string) => void;
    placeholder?: string;
    required?: boolean;
};

export default function CustomSelect({
    label,
    options,
    value,
    onValueChangeAction,
    placeholder = "Select an option...",
    required = false
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="w-full space-y-3" ref={containerRef}>
            <label className="label flex items-center gap-2">
                {label}
                {required && <span className="text-blue-500 text-[10px]">*</span>}
            </label>

            <div className="relative">
                {/* Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className={`
                        w-full flex items-center justify-between px-5 py-4
                        surface border transition-all duration-200 text-left
                        ${isOpen ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-zinc-800 hover:border-zinc-700"}
                    `}
                >
                    <span className={`text-sm tracking-tight ${value ? "text-white font-medium" : "text-zinc-600"}`}>
                        {value || placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute z-50 w-full mt-2 surface border border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-xl"
                        >
                            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                                {options.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                            onValueChangeAction(option);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full flex items-center justify-between px-5 py-3.5
                                            text-sm text-left transition-colors group
                                            ${value === option ? "bg-blue-600/10 text-blue-400" : "text-zinc-400 hover:bg-white/5 hover:text-white"}
                                        `}
                                    >
                                        <span className="truncate">{option}</span>
                                        {value === option && (
                                            <Check className="w-3.5 h-3.5 text-blue-500" />
                                        )}
                                        {value !== option && (
                                            <div className="w-3.5 h-3.5 border border-zinc-800 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

