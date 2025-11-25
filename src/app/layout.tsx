import "./globals.css";
import type { Metadata } from "next";
import { RecepiesProvider } from "@/app/context/RecepiesContext";
import Navbar from "@/app/components/Navbar";

export const metadata: Metadata = {
    title: "AllergyPatrol",
    description: "Allergen-friendly recipes",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50 text-gray-900">
                <RecepiesProvider>
                    <div className="flex min-h-screen flex-col">
                        <Navbar />
                        <div className="flex-1">{children}</div>
                    </div>
                </RecepiesProvider>
            </body>
        </html>
    );
}
