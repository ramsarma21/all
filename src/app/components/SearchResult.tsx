// src/app/components/SearchResult.tsx
"use client";

import React, { useContext, useEffect } from "react";
import { useRecepies } from "@/app/context/RecepiesContext";

export default function SearchResult() {
    const { recepies } = useRecepies();

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
        </section>
    );
}
