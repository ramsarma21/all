"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="w-full bg-white border-b border-blue-100 shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
                    >
                        AllergyPatrol
                    </Link>

                    <div className="flex gap-6">
                        <Link
                            href="/"
                            className={`font-medium transition ${isActive("/")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-700 hover:text-blue-600"
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/about"
                            className={`font-medium transition ${isActive("/about")
                                ? "text-blue-600 border-b-2 border-blue-600"
                                : "text-gray-700 hover:text-blue-600"
                                }`}
                        >
                            About
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
