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
        // Space-themed color palette
        "moon-blue": "#3B5CC9",
        "soft-pink": "#F2C9D6",
        "midnight-purple": "#1A1A4B",
        "celestial-blue": "#A6D1F7",
        "space-blue": "#0A0F2C",
        "misty-sky": "#D7E4F4",
        moonlight: "#F8F9FA",
        stardust: "#B2B9D1",

        // Semantic color mappings
        background: "#0A0F2C",
        foreground: "#F8F9FA",
        card: {
          DEFAULT: "#1A1A4B",
          foreground: "#F8F9FA",
        },
        popover: {
          DEFAULT: "#1A1A4B",
          foreground: "#F8F9FA",
        },
        primary: {
          DEFAULT: "#3B5CC9",
          foreground: "#F8F9FA",
        },
        secondary: {
          DEFAULT: "#F2C9D6",
          foreground: "#1A1A4B",
        },
        muted: {
          DEFAULT: "#B2B9D1",
          foreground: "#F8F9FA",
        },
        accent: {
          DEFAULT: "#1A1A4B",
          foreground: "#F8F9FA",
        },
        destructive: {
          DEFAULT: "#FF4D4D",
          foreground: "#F8F9FA",
        },
        border: "#3B5CC9",
        input: "#D7E4F4",
        ring: "#A6D1F7",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
