import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#1B2430", paper: "#F6F7FB", brand: "#2F3E9E", saffron: "#E8890C" } } },
  plugins: [],
} satisfies Config;
