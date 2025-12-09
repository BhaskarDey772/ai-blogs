/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/novel/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: "1rem",
                sm: "2rem",
                lg: "4rem",
            },
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#334155",
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0",
                    500: "#334155",
                    700: "#1f2937",
                },
                accent: {
                    DEFAULT: "#6366f1",
                    500: "#6366f1",
                    600: "#4f46e5",
                },
                brand: {
                    DEFAULT: "#06b6d4",
                },
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "ui-sans-serif",
                    "system-ui",
                    "-apple-system",
                    "Segoe UI",
                    "Roboto",
                    "Helvetica Neue",
                    "Noto Sans",
                    "sans-serif",
                ],
            },
            boxShadow: {
                "card-lg": "0 10px 30px rgba(2,6,23,0.08)",
            },
        },
    },
};
