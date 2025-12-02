"use client";

import React, { useState } from "react";
import { Camera, AlertTriangle, CheckCircle, Info, Upload, Sparkles } from "lucide-react";

interface PredictionResponse {
    dish_name: string;
    confidence: number;
    allergens: any;
}

interface AllergenFlag {
    name: string;
    risk: string;
}

const ScannerPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<PredictionResponse | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        setFile(selected);
        setResult(null);
        setError(null);

        if (selected) {
            const url = URL.createObjectURL(selected);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Please choose a food image first.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("http://localhost:8000/predict", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Backend error: ${res.status}`);
            }

            const data = (await res.json()) as PredictionResponse;
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError("Something went wrong talking to the allergy model.");
        } finally {
            setLoading(false);
        }
    };

    const confidencePercent = result ? Math.round(result.confidence * 100) : null;

    const allergenFlags: AllergenFlag[] = React.useMemo(() => {
        if (!result || result.allergens == null) return [];

        let raw: any = result.allergens;

        if (Array.isArray(raw)) {
            const last = raw[raw.length - 1];
            if (last && typeof last === "object" && !Array.isArray(last)) {
                raw = last;
            }
        }

        let allergenMap: any = null;

        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
            if (
                "risk" in raw &&
                raw.risk &&
                typeof raw.risk === "object" &&
                !Array.isArray(raw.risk)
            ) {
                allergenMap = raw.risk;
            } else {
                allergenMap = raw;
            }
        }

        if (!allergenMap) return [];

        const normalizeRisk = (value: any): string => {
            const s = String(value).toLowerCase();
            if (s === "true" || s === "1") return "high";
            if (s === "maybe" || s === "medium") return "medium";
            if (s === "low") return "low";
            if (s === "false" || s === "0" || s === "none") return "none";
            return s;
        };

        return Object.entries(allergenMap)
            .map(([name, value]): AllergenFlag => {
                const risk = normalizeRisk(value);
                return { name, risk };
            })
            .filter((flag) => {
                const n = flag.risk.toLowerCase();
                return n !== "none" && n !== "false" && n !== "0" && n !== "";
            });
    }, [result]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 text-slate-900">
            {/* Animated background gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/10 pointer-events-none" />

            <main className="relative flex flex-col items-center px-4 py-12 md:py-16">
                <div className="w-full max-w-5xl space-y-10">
                    {/* Enhanced Header */}
                    <section className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30 mb-4">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                            Allergy Scanner
                        </h1>
                        <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                            Upload a picture of a dish and our AI will identify it and detect possible allergens
                        </p>

                        {/* Warning badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium">Experimental • Not medical advice</span>
                        </div>
                    </section>

                    {/* Upload Card with improved design */}
                    <section className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-900/10">
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left: Upload area */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                                            Upload Food Image
                                        </label>

                                        {/* Custom file upload button */}
                                        <label className="group relative block cursor-pointer">
                                            <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl bg-slate-50 hover:bg-white transition-all duration-300">
                                                <Upload className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 transition-colors mb-3" />
                                                <p className="text-sm font-medium text-slate-600 group-hover:text-slate-800">
                                                    {file ? file.name : "Click to upload or drag and drop"}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    PNG, JPG, WEBP up to 10MB
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {/* Scan button */}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !file}
                                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Analyzing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                <span>Scan for Allergens</span>
                                            </>
                                        )}
                                    </button>

                                    {error && (
                                        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                                            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    {/* Info notice */}
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Never rely on AI alone for allergy safety. Always verify ingredients and consult with healthcare professionals for medical advice.
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Preview */}
                                <div className="flex flex-col">
                                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                                        Preview
                                    </label>
                                    <div className="flex-1 aspect-square rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                                        {previewUrl ? (
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center px-6">
                                                <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                                <p className="text-sm text-slate-500">
                                                    Image preview will appear here
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Enhanced Results */}
                    {result && (
                        <section className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl shadow-slate-900/10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-800">Analysis Complete</h2>
                            </div>

                            {/* Dish identification */}
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                                <p className="text-sm text-slate-600 mb-2 font-medium">Identified Dish</p>
                                <div className="flex items-baseline justify-between flex-wrap gap-3">
                                    <p className="text-2xl md:text-3xl font-bold capitalize text-slate-900">
                                        {result.dish_name.replace(/_/g, " ")}
                                    </p>
                                    {confidencePercent !== null && (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
                                            <span className="text-xs text-slate-600">Confidence</span>
                                            <span className="text-sm font-bold text-emerald-600">
                                                {confidencePercent}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Allergen results */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                    <p className="text-base font-semibold text-slate-800">
                                        Detected Allergens
                                    </p>
                                </div>

                                {allergenFlags.length === 0 ? (
                                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm font-medium text-emerald-800">No major allergens detected</p>
                                                <p className="text-xs text-slate-600 mt-1">Always verify ingredients to be safe</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {allergenFlags.map((a) => {
                                            const normalized = a.risk.toLowerCase();
                                            const isHigh = normalized === "high";
                                            const isMedium = normalized === "medium";

                                            const riskColor = isHigh
                                                ? "bg-red-50 border-red-300 text-red-800"
                                                : isMedium
                                                    ? "bg-amber-50 border-amber-300 text-amber-800"
                                                    : "bg-emerald-50 border-emerald-300 text-emerald-800";

                                            const label =
                                                a.name.toLowerCase() === "milk" ? "Milk" :
                                                    a.name.toLowerCase() === "tree_nut" ? "Tree nuts" :
                                                        a.name.toLowerCase() === "peanut" ? "Peanuts" :
                                                            a.name.toLowerCase() === "wheat" ? "Wheat" :
                                                                a.name.toLowerCase() === "soy" ? "Soy" :
                                                                    a.name.toLowerCase() === "egg" ? "Eggs" :
                                                                        a.name.toLowerCase() === "fish" ? "Fish" :
                                                                            a.name.toLowerCase() === "shellfish" ? "Shellfish" :
                                                                                a.name.toLowerCase() === "sesame" ? "Sesame" :
                                                                                    a.name.replace(/_/g, " ");

                                            return (
                                                <div
                                                    key={a.name}
                                                    className={`flex items-center justify-between p-4 rounded-xl border ${riskColor} transition-all duration-200 hover:scale-[1.02]`}
                                                >
                                                    <span className="font-semibold">{label}</span>
                                                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-black/20">
                                                        {normalized}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative mt-16 border-t border-slate-200 py-8">
                <div className="max-w-5xl mx-auto px-4 text-center text-sm text-slate-500">
                    <p>Allergy Scanner • Powered by AI • Always verify with actual ingredients</p>
                </div>
            </footer>
        </div>
    );
};

export default ScannerPage;