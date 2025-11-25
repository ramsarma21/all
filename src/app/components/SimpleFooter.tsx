"use client";
import React from "react";

export const SimpleFooter: React.FC = () => {
    return (
        <footer className="w-full flex flex-col md:flex-row justify-between items-center gap-4 border-t border-blue-100 py-6 px-5 bg-white">
            <span className="text-gray-600 text-sm">
                © {new Date().getFullYear()} AllergyPatrol. All rights reserved.
            </span>

            <a
                href="https://spoonacular.com/food-api"
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-2 opacity-70 hover:opacity-100 transition"
                aria-label="Powered by the Spoonacular API"
            >
                <img
                    src="https://spoonacular.com/application/frontend/images/logo-simple-framed-green-gradient.svg"
                    alt="Spoonacular"
                    className="h-5 w-5 rounded-full"
                    loading="lazy"
                />
                <span className="text-sm text-gray-600">Powered by Spoonacular API</span>
            </a>
        </footer>
    );
};
