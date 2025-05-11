import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Using Tailwind's default color palette
        background: {
          DEFAULT: "rgb(15 23 42)", // slate-900
          secondary: "rgb(30 41 59)", // slate-800
          tertiary: "rgb(51 65 85)", // slate-700
        },
        foreground: {
          DEFAULT: "rgb(248 250 252)", // slate-50
          secondary: "rgb(226 232 240)", // slate-200
          muted: "rgb(148 163 184)", // slate-400
        },
        card: {
          DEFAULT: "rgb(30 41 59)", // slate-800
          foreground: "rgb(248 250 252)", // slate-50
          secondary: "rgb(51 65 85)", // slate-700
        },
        popover: {
          DEFAULT: "rgb(30 41 59)", // slate-800
          foreground: "rgb(248 250 252)", // slate-50
        },
        primary: {
          DEFAULT: "rgb(59 130 246)", // blue-500
          foreground: "rgb(248 250 252)", // slate-50
          secondary: "rgb(96 165 250)", // blue-400
        },
        secondary: {
          DEFAULT: "rgb(236 72 153)", // pink-500
          foreground: "rgb(248 250 252)", // slate-50
        },
        muted: {
          DEFAULT: "rgb(148 163 184)", // slate-400
          foreground: "rgb(248 250 252)", // slate-50
        },
        accent: {
          DEFAULT: "rgb(51 65 85)", // slate-700
          foreground: "rgb(248 250 252)", // slate-50
        },
        destructive: {
          DEFAULT: "rgb(239 68 68)", // red-500
          foreground: "rgb(248 250 252)", // slate-50
        },
        border: "rgb(51 65 85)", // slate-700
        input: "rgb(51 65 85)", // slate-700
        ring: "rgb(59 130 246)", // blue-500
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary":
          "linear-gradient(to right, rgb(59 130 246), rgb(96 165 250))", // blue-500 to blue-400
        "gradient-dark":
          "linear-gradient(to bottom, rgb(15 23 42), rgb(30 41 59))", // slate-900 to slate-800
        "gradient-card":
          "linear-gradient(to bottom, rgb(30 41 59), rgb(51 65 85))", // slate-800 to slate-700
        "gradient-accent":
          "linear-gradient(to right, rgb(51 65 85), rgb(59 130 246))", // slate-700 to blue-500
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        gradient: "gradient 8s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
