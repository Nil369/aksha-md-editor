import { useEffect, useMemo, useState } from "react";
import type { ThemeMode } from "../types";

const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined" || !window.matchMedia) {
        return "light";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
};

export function useTheme(initial: ThemeMode = "auto") {
    const [theme, setTheme] = useState<ThemeMode>(initial);
    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
        getSystemTheme()
    );

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handle = (event: MediaQueryListEvent) => {
            setSystemTheme(event.matches ? "dark" : "light");
        };
        media.addEventListener("change", handle);
        return () => media.removeEventListener("change", handle);
    }, []);

    const resolvedTheme = useMemo(() => {
        if (theme === "auto") {
            return systemTheme;
        }
        return theme;
    }, [theme, systemTheme]);

    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme);
    }, [resolvedTheme]);

    return {
        theme,
        resolvedTheme,
        setTheme,
    };
}

