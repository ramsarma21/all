"use client";

import React from "react";
import { SimpleFooter } from "@/app/components/SimpleFooter";

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow py-16 px-4">
                {/* Header Section */}
                <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-2xl py-12 px-6 mb-12 text-center">
                    <h1 className="text-5xl font-bold mb-6 text-gray-900">About Me</h1>
                    <p className="text-lg text-gray-700 mb-2">
                        Hey, I'm Ram, the founder of AllergyPatrol.
                    </p>
                    <p className="text-lg text-gray-700">
                        Come join me on this journey of spreading allergy awareness.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-2 text-gray-900">Ram Sarma</h2>
                    <p className="text-lg font-semibold text-gray-600 mb-6">Founder & Developer</p>

                    <p className="text-gray-700 leading-relaxed mb-4">
                        I'm a passionate software engineer and advocate for food allergy awareness. This app combines technology and my personal mission to help those affected by food allergies.
                    </p>

                    <p className="text-gray-700 leading-relaxed mb-6">
                        With the AllergyPatrol app, users can quickly find allergen friendly foods, recipes, and resources.
                    </p>

                    {/* Tags */}
                    <div className="flex gap-3 flex-wrap">
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold border border-blue-300">
                            Allergy Awareness
                        </span>
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold border border-blue-300">
                            Safer Eating
                        </span>
                    </div>
                </div>
            </main>

            <SimpleFooter />
        </div>
    );
}
