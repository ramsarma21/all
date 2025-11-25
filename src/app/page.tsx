// src/app/page.tsx
"use client";

import Hero from "@/app/components/Hero";
import SearchResult from "@/app/components/SearchResult";
import { SimpleFooter } from "@/app/components/SimpleFooter";

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Hero />

            <main className="flex-grow">
                <SearchResult />
            </main>

            <SimpleFooter />
        </div>
    );
}
