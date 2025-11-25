import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.spoonacular.com";

export async function GET(req: NextRequest) {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing SPOONACULAR_API_KEY" },
            { status: 500 }
        );
    }

    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // Forward the relevant query params
    const payload = new URLSearchParams();
    payload.set("apiKey", apiKey);
    payload.set("number", searchParams.get("number") ?? "20");
    payload.set("offset", searchParams.get("offset") ?? "0");

    const passthrough = [
        "cuisine",
        "diet",
        "intolerances",
        "query",
        "sort",
    ] as const;
    passthrough.forEach((key) => {
        const val = searchParams.get(key);
        if (val) payload.set(key, val);
    });

    const spoonUrl = `${API_BASE}/recipes/complexSearch?${payload.toString()}`;

    const res = await fetch(spoonUrl, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
}
