"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <header className="bg-white shadow-sm">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                <Link href="/" className="text-xl font-semibold text-blue-700">
                    AllergyPatrol
                </Link>
                <ul className="flex items-center gap-6 text-sm font-medium text-gray-700">
                    {navItems.map(({ href, label }) => {
                        const isActive = pathname === href;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={
                                        "transition-colors hover:text-blue-700 " +
                                        (isActive ? "text-blue-700" : "text-gray-700")
                                    }
                                >
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}
