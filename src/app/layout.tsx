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
            <body>
                <RecepiesProvider>
                    <Navbar />
                    {children}
                </RecepiesProvider>
            </body>
        </html>
    );
}
