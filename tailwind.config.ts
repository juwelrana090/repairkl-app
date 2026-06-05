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
        primary: "#fd6b22",
        dark: "#1b1d21",
        success: "#4fbf67",
        danger: "#f15223",
        muted: "#8f92a1",
        border: "#e8e6ea",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      borderRadius: {
        "4xl": "32px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
