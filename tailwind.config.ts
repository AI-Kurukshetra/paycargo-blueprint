import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#10233B",
        tide: "#0E7490",
        foam: "#F5F7FA",
        signal: "#F59E0B",
        ember: "#D92D20",
        moss: "#166534"
      },
      boxShadow: {
        card: "0 24px 80px rgba(16, 35, 59, 0.10)"
      },
      backgroundImage: {
        grid: "linear-gradient(to right, rgba(16,35,59,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,35,59,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
