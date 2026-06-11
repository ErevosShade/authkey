export type Theme = "dark" | "light";
 
export const DYNAMIC = {
  dark: {
    accentHex: "#ff5555",
    amberHex:  "#f5a623",
    grid:      "#ffffff07",
  },
  light: {
    accentHex: "#d63030",
    amberHex:  "#c47e00",
    grid:      "#00000008",
  },
} as const;
 
export type DynamicTokens = (typeof DYNAMIC)[keyof typeof DYNAMIC];