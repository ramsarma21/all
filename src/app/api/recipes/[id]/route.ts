import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.spoonacular.com";

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing SPOONACULAR_API_KEY" },
            { status: 500 }
        );
    }

    const payload = new URLSearchParams({ apiKey });
    const spoonUrl = `${API_BASE}/recipes/${params.id}/information?${payload.toString()}`;

    const res = await fetch(spoonUrl, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
}
