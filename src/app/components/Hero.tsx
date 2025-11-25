// src/app/components/Hero.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRecepies } from "@/app/context/RecepiesContext";

/** Local data (you can move these into a data file later) */
const CuisinesData = [
    "African",
    "American",
    "British",
    "Cajun",
    "Caribbean",
    "Chinese",
    "French",
    "Greek",
    "Indian",
    "Italian",
    "Japanese",
    "Korean",
    "Latin American",
    "Mediterranean",
    "Mexican",
    "Middle Eastern",
    "Nordic",
    "Spanish",
    "Thai",
    "Vietnamese",
];

const DietData = [
    "Gluten Free",
    "Ketogenic",
    "Vegetarian",
    "Lacto-Vegetarian",
    "Ovo-Vegetarian",
    "Vegan",
    "Pescetarian",
    "Paleo",
    "Primal",
    "Low FODMAP",
    "Whole30",
];

const IntolerancesData = [
    "Dairy",
    "Egg",
    "Gluten",
    "Grain",
    "Peanut",
    "Seafood",
    "Sesame",
    "Shellfish",
    "Soy",
    "Sulfite",
    "Tree Nut",
    "Wheat",
];

type Cuisine = string | undefined;
type Diet = string | undefined;

/** Close dropdown when clicking outside */
function useOutsideClose(
    ref: React.RefObject<HTMLDivElement | null>,
    onClose?: () => void
) {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) onClose?.();
        };
        document.addEventListener("mousedown", handler, { passive: true });
        return () => document.removeEventListener("mousedown", handler);
    }, [ref, onClose]);
}

export default function Hero() {
    const { setRecepies } = useRecepies();
    const [loading, setLoading] = useState(false);

    // filter state
    const [cuisine, setCuisine] = useState<Cuisine>(undefined);
    const [diet, setDiet] = useState<Diet>(undefined);
    const [ints, setInts] = useState<string[]>([]);

    // dropdown state
    const [open, setOpen] = useState<"cuisine" | "diet" | "ints" | null>(null);
    const barRef = useRef<HTMLDivElement | null>(null);
    useOutsideClose(barRef, () => setOpen(null));

    // intolerance search
    const [intsQuery, setIntsQuery] = useState("");
    const intsCount = ints.length;

    /** Initial load – grab some random recipes */
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const res = await fetch("/api/recipes?number=20");
                const data = await res.json();
                setRecepies(data);
            } catch (err) {
                console.error("Initial recipes load failed:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [setRecepies]);

    /** Build query string with filters */
    const buildQueryString = () => {
        const params = new URLSearchParams();
        if (cuisine) params.set("cuisine", cuisine);
        if (diet) params.set("diet", diet);
        if (ints.length) params.set("intolerances", ints.join(","));
        params.set("number", "20");
        params.set("offset", "0");
        return params.toString();
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const qs = buildQueryString();
            const res = await fetch(`/api/recipes?${qs}`);
            const data = await res.json();
            setRecepies({ ...data, cuisine, diet, intolerances: ints });
            // if you later add a focusSearch() util, call it here
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        setCuisine(undefined);
        setDiet(undefined);
        setInts([]);
        setIntsQuery("");
    };

    const pill =
        "inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white/90 hover:bg-white/15 hover:border-white/50 transition-colors";
    const badge =
        "ml-1 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-white/90 px-1.5 text-xs font-semibold text-blue-700";

    return (
        <section className="relative pt-20">
            <div className="relative flex min-h-[520px] h-[calc(85vh-80px)] items-center justify-center overflow-hidden">
                {/* Background gradient */}
                <div
                    className="absolute inset-0 -z-10"
                    style={{
                        backgroundImage: `
              radial-gradient(1200px 600px at 10% -10%, rgba(191,219,254,0.55), transparent 60%),
              radial-gradient(1200px 600px at 90% 0%, rgba(147,197,253,0.45), transparent 60%),
              linear-gradient(135deg, #0b5bd3 0%, #0f6ce8 35%, #1e88ff 65%, #2ea6ff 100%)
            `,
                    }}
                />

                {/* Card */}
                <div className="mx-4 w-full max-w-3xl rounded-2xl border border-white/20 bg-white/12 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                    <h1 className="mb-1 text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Find Recipes
                    </h1>
                    <p className="mb-6 text-center text-white">
                        Filter by cuisine, diet, and intolerances.
                    </p>

                    {/* FILTER BAR */}
                    <div
                        ref={barRef}
                        className="relative mb-6 flex flex-col gap-3 rounded-xl border border-white/25 bg-white/10 p-3 sm:flex-row sm:items-center sm:gap-3"
                    >
                        {/* Cuisine */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpen(open === "cuisine" ? null : "cuisine")}
                                className={pill}
                            >
                                <span className="opacity-80">Cuisine</span>
                                {cuisine ? (
                                    <span className="font-semibold">{cuisine}</span>
                                ) : (
                                    <span className="text-white/60">Any</span>
                                )}
                                <svg
                                    className="ml-1 h-4 w-4 opacity-80"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {open === "cuisine" && (
                                <div className="absolute left-0 z-[300] mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                                    <div className="max-h-60 overflow-auto">
                                        {CuisinesData.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => {
                                                    setCuisine(c);
                                                    setOpen(null);
                                                }}
                                                className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 ${cuisine === c
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "text-gray-800"
                                                    }`}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                    {cuisine && (
                                        <div className="mt-2 text-right">
                                            <button
                                                className="text-xs font-semibold text-blue-700 hover:underline"
                                                onClick={() => setCuisine(undefined)}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Diet */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setOpen(open === "diet" ? null : "diet")}
                                className={pill}
                            >
                                <span className="opacity-80">Diet</span>
                                {diet ? (
                                    <span className="font-semibold">{diet}</span>
                                ) : (
                                    <span className="text-white/60">Any</span>
                                )}
                                <svg
                                    className="ml-1 h-4 w-4 opacity-80"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>

                            {open === "diet" && (
                                <div className="absolute left-0 z-[300] mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                                    <div className="max-h-60 overflow-auto">
                                        {DietData.map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => {
                                                    setDiet(d);
                                                    setOpen(null);
                                                }}
                                                className={`block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 ${diet === d
                                                        ? "bg-blue-50 text-blue-700"
                                                        : "text-gray-800"
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                    {diet && (
                                        <div className="mt-2 text-right">
                                            <button
                                                className="text-xs font-semibold text-blue-700 hover:underline"
                                                onClick={() => setDiet(undefined)}
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Intolerances (custom multi-select) */}
                        <div className="relative flex-1">
                            <button
                                type="button"
                                onClick={() => setOpen(open === "ints" ? null : "ints")}
                                className={`${pill} w-full justify-between`}
                            >
                                <span className="opacity-80">Intolerances</span>
                                <span className="flex items-center">
                                    {intsCount > 0 ? (
                                        <span className={badge}>{intsCount}</span>
                                    ) : (
                                        <span className="text-white/60">Any</span>
                                    )}
                                    <svg
                                        className="ml-2 h-4 w-4 opacity-80"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path d="M6 9l6 6 6-6" />
                                    </svg>
                                </span>
                            </button>

                            {open === "ints" && (
                                <div className="absolute left-0 right-0 z-[350] mt-2 rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
                                    {/* Search box */}
                                    <input
                                        type="text"
                                        value={intsQuery}
                                        onChange={(e) => setIntsQuery(e.target.value)}
                                        placeholder="Search intolerances…"
                                        className="mb-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                    />

                                    {/* 2-column compact list with checkboxes */}
                                    <div className="grid max-h-56 grid-cols-1 gap-1 overflow-auto px-1 sm:grid-cols-2">
                                        {IntolerancesData.filter((i) =>
                                            i.toLowerCase().includes(intsQuery.trim().toLowerCase())
                                        ).map((i) => {
                                            const checked = ints.includes(i);
                                            return (
                                                <label
                                                    key={i}
                                                    className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm ${checked
                                                            ? "bg-blue-50 text-blue-700"
                                                            : "hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 accent-blue-600"
                                                        checked={checked}
                                                        onChange={(e) => {
                                                            if (e.target.checked)
                                                                setInts((prev) => [...prev, i]);
                                                            else
                                                                setInts((prev) =>
                                                                    prev.filter((x) => x !== i)
                                                                );
                                                        }}
                                                    />
                                                    <span>{i}</span>
                                                </label>
                                            );
                                        })}
                                    </div>

                                    {/* Footer row */}
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-xs text-gray-600">
                                            {intsCount} selected
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                className="text-xs font-semibold text-blue-700 hover:underline"
                                                onClick={() => setInts([])}
                                            >
                                                Clear
                                            </button>
                                            <button
                                                className="text-xs font-semibold text-blue-700 hover:underline"
                                                onClick={() => setOpen(null)}
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-white py-2 text-sm font-semibold text-blue-700 shadow-md transition hover:bg-white/90 disabled:cursor-not-allowed"
                        >
                            {loading ? "Searching…" : "Search"}
                        </button>
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
