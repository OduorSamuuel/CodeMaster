import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // custom color palette
        brand: {
          "dark-blue": "hsl(248.57, 71.79%, 15.29%)", // Color 1
          "medium-blue": "hsl(227.81, 28.32%, 55.69%)", // Color 2
          "white": "hsl(0, 0%, 100%)", // Color 3
          "yellow": "hsl(53.87, 100%, 73.14%)", // Color 4
          "light-blue": "hsl(220, 100%, 94.12%)", // Color 5
          "bright-blue": "hsl(225.88, 80.95%, 54.71%)", // Color 6
          "purple": "hsl(262.12, 100%, 50%)", // Color 7
          "light-gray": "hsl(244.29, 15.56%, 82.35%)", // Color 8
          "red": "hsl(359.68, 81.82%, 54.71%)", // Color 9
          "dark-purple": "hsl(255.35, 77.25%, 32.75%)", // Color 10
          "light-red": "hsl(0, 78.43%, 80%)", // Color 11
          "teal": "hsl(159.65, 46.56%, 51.57%)", // Additional color
          "orange": "hsl(36.13, 75%, 51.37%)", // Additional color
          "brown": "hsl(10.91, 20.75%, 58.43%)", // Additional color
          "light-teal": "hsl(162.15, 57.89%, 59.02%)", // Additional color
        },
        // Badge-specific colors
        badge: {
          "red": "hsl(359.68, 81.82%, 54.71%)",
          "purple": "hsl(255.35, 77.25%, 32.75%)",
          "pink": "hsl(0, 78.43%, 80%)",
          "teal": "hsl(159.65, 46.56%, 51.57%)",
          "orange": "hsl(36.13, 75%, 51.37%)",
          "brown": "hsl(10.91, 20.75%, 58.43%)",
          "light-teal": "hsl(162.15, 57.89%, 59.02%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;