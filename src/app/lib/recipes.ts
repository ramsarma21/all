// src/app/lib/recipes.ts
export type RecipeSearchOptions = {
    number?: number;
    offset?: number;
    cuisine?: string;
    diet?: string;
    intolerances?: string[]; // or CSV
    query?: string;
};

const removeUndefinedValues = (obj: Record<string, unknown>) =>
    Object.fromEntries(
        Object.entries(obj).filter(
            ([, v]) => v !== undefined && v !== null && v !== ""
        )
    );

const toCsv = (vals?: string[] | string) => {
    if (!vals) return undefined;
    const arr = Array.isArray(vals) ? vals : [vals];
    const cleaned = arr
        .map((s) => String(s ?? "").trim())
        .filter(Boolean);
    return cleaned.length ? cleaned.join(",") : undefined;
};

export async function getRecepies(options: RecipeSearchOptions = {}) {
    const { number = 20, offset = 0, cuisine, diet, intolerances, query } =
        options;

    const payload = removeUndefinedValues({
        number,
        offset,
        cuisine,
        diet,
        intolerances: toCsv(intolerances),
        query,
        sort: "random",
        t: Date.now(), // cache buster like before
    });

    const qs = new URLSearchParams(
        payload as Record<string, string>
    ).toString();

    const res = await fetch(`/api/recipes?${qs}`);
    if (!res.ok) throw new Error("Failed to fetch recipes");
    return res.json(); // same shape as Spoonacular complexSearch
}

export async function getRecipeDetail(id: number | string) {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error("Failed to fetch recipe detail");
    return res.json();
}
