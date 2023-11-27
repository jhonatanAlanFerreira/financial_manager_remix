import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  ...(process.env.NODE_ENV == "development" && {
    safelist: [{ pattern: /.*/ }],
  }),
} satisfies Config;
