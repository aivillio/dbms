import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pes: {
          blue: "#002060",
          navy: "#0a192f",
          gold: "#d4af37",
          light: "#f4f6f9"
        }
      }
    },
  },
  plugins: [],
};
export default config;
