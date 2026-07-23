import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4F7DF3",
          violet: "#8B5CF6",
          teal: "#14B8A6",
          amber: "#F59E0B",
          ink: "#12141C",
          muted: "#6B7280",
          faint: "#9AA2B1",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Segoe UI",
          "Inter", "Roboto", "Helvetica Neue", "Arial", "sans-serif",
        ],
      },
      borderRadius: { xl2: "1rem" },
    },
  },
  plugins: [],
};
export default config;
