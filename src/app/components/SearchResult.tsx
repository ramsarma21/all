// src/app/components/SearchResult.tsx
"use client";

import React, { useState } from "react";
import { useRecepies } from "@/app/context/RecepiesContext";
import { getRecepies } from "@/app/lib/recipes";

export default function SearchResult() {
    const { recepies, setRecepies } = useRecepies();
    const [loading, setLoading] = useState(false);

    // If nothing yet, show a “load something” prompt
    if (!recepies.results) {
        return (
            <section className="py-20 px-4 text-center text-slate-700">
                No recipes yet — try searching above.
            </section>
        );
    }

    return (
        <section className="py-8 px-4 max-w-screen-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Recipes for you</h2>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {recepies.results.map(({ id, title, image }) => (
                    <div key={id} className="rounded-lg overflow-hidden shadow-lg bg-white">
                        <img src={image} alt={title} className="w-full h-40 object-cover" />
                        <div className="p-4">
                            <h3 className="text-lg font-semibold">{title}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-12 flex flex-col items-center justify-center gap-6">
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const newOffset = Math.max(0, (recepies.offset || 0) - (recepies.number || 20));
                                const data = await getRecepies({
                                    number: recepies.number || 20,
                                    offset: newOffset,
                                    cuisine: recepies.cuisine,
                                    diet: recepies.diet,
                                    intolerances: recepies.intolerances,
                                    query: recepies.query,
                                });
                                setRecepies({ ...data, ...recepies, ...data });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            } catch (err) {
                                console.error("Failed to load previous page:", err);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={((recepies.offset || 0) === 0) || loading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    >
                        ← Previous
                    </button>
                    <div className="bg-gray-100 rounded-xl px-6 py-3">
                        <span className="text-gray-700 font-semibold">
                            Page {Math.floor((recepies.offset || 0) / (recepies.number || 20)) + 1} of {Math.ceil((recepies.totalResults || 0) / (recepies.number || 20))}
                        </span>
                    </div>
                    <button
                        onClick={async () => {
                            try {
                                setLoading(true);
                                const newOffset = (recepies.offset || 0) + (recepies.number || 20);
                                const data = await getRecepies({
                                    number: recepies.number || 20,
                                    offset: newOffset,
                                    cuisine: recepies.cuisine,
                                    diet: recepies.diet,
                                    intolerances: recepies.intolerances,
                                    query: recepies.query,
                                });
                                setRecepies({ ...data, ...recepies, ...data });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            } catch (err) {
                                console.error("Failed to load next page:", err);
                            } finally {
                                setLoading(false);
                            }
                        }}
                        disabled={((recepies.offset || 0) + (recepies.number || 20) >= (recepies.totalResults || 0)) || loading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
                    >
                        Next →
                    </button>
                </div>

                {/* Numbered Page Buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap max-w-2xl">
                    {(() => {
                        const currentPage = Math.floor((recepies.offset || 0) / (recepies.number || 20)) + 1;
                        const totalPages = Math.ceil((recepies.totalResults || 0) / (recepies.number || 20));
                        const pagesToShow: (number | string)[] = [];

                        // Add "1" if current page is not 1
                        if (currentPage > 1) {
                            pagesToShow.push(1);
                            pagesToShow.push("ellipsis-start");
                        }

                        // Add current page and next 4 pages
                        for (let i = currentPage; i < currentPage + 5 && i <= totalPages; i++) {
                            pagesToShow.push(i);
                        }

                        // Add last page if not already included
                        if (totalPages > 0 && !pagesToShow.includes(totalPages)) {
                            pagesToShow.push("ellipsis-end");
                            pagesToShow.push(totalPages);
                        }

                        return pagesToShow.map((pageNum, idx) => {
                            if (pageNum === "ellipsis-start" || pageNum === "ellipsis-end") {
                                return (
                                    <span key={pageNum} className="text-gray-400 font-bold text-lg px-2">
                                        …
                                    </span>
                                );
                            }

                            const pageOffset = ((pageNum as number) - 1) * (recepies.number || 20);
                            const isActive = pageNum === currentPage;

                            return (
                                <button
                                    key={`page-${pageNum}`}
                                    onClick={async () => {
                                        try {
                                            setLoading(true);
                                            const data = await getRecepies({
                                                number: recepies.number || 20,
                                                offset: pageOffset,
                                                cuisine: recepies.cuisine,
                                                diet: recepies.diet,
                                                intolerances: recepies.intolerances,
                                                query: recepies.query,
                                            });
                                            setRecepies({ ...data, ...recepies, ...data });
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        } catch (err) {
                                            console.error("Failed to load page:", err);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className={`w-11 h-11 rounded-lg font-semibold transition-all ${isActive
                                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {pageNum}
                                </button>
                            );
                        });
                    })()}
                </div>
            </div>
        </section>
    );
}
