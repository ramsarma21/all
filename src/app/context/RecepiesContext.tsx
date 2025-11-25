"use client";

import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    Dispatch,
    SetStateAction,
} from "react";

type RecipeResult = {
    id: number;
    title: string;
    image: string;
};

export type RecepiesState = {
    results?: RecipeResult[];
    totalResults?: number;
    number?: number;
    offset?: number;
    // filters
    cuisine?: string;
    diet?: string;
    intolerances?: string[];
    query?: string;
};

type Ctx = {
    recepies: RecepiesState;
    setRecepies: Dispatch<SetStateAction<RecepiesState>>;
};

const RecepiesContext = createContext<Ctx | undefined>(undefined);

export const RecepiesProvider = ({ children }: { children: ReactNode }) => {
    const [recepies, setRecepies] = useState<RecepiesState>({});
    return (
        <RecepiesContext.Provider value={{ recepies, setRecepies }}>
            {children}
        </RecepiesContext.Provider>
    );
};

export const useRecepies = () => {
    const ctx = useContext(RecepiesContext);
    if (!ctx) {
        throw new Error("useRecepies must be used within RecepiesProvider");
    }
    return ctx;
};
