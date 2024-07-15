import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      maxHeight: {
        "95vh": "95vh",
      },
    },
  },
  plugins: [],
  ...(process.env.NODE_ENV === "development" && {
    safelist: [{ pattern: /.*/ }],
  }),
} satisfies Config;
