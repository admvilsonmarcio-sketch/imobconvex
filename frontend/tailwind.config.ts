import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#10B981",
        accent: {
          red: "#EF4444",
          amber: "#F59E0B"
        },
        surface: {
          100: "#F9FAFB",
          200: "#E5E7EB",
          300: "#D1D5DB",
          800: "#1F2937"
        }
      }
    }
  },
  plugins: []
};

export default config;
