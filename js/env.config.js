// ═══════════════════════════════════════════════
// BeforeYouGo - Environment Configuration
// ═══════════════════════════════════════════════
// Keys hardcoded for quick local dev & demo.
// For production: move to Vercel Environment Variables.

window.ENV = {
    // ── Firebase ──
    FIREBASE_API_KEY:        "AIzaSyBlb9Ye7elbpj19Y7TrHOq5eNS_02rK-44",
    FIREBASE_AUTH_DOMAIN:    "before-you-go-10236.firebaseapp.com",
    FIREBASE_PROJECT_ID:     "before-you-go-10236",
    FIREBASE_STORAGE_BUCKET: "before-you-go-10236.firebasestorage.app",
    FIREBASE_MSG_SENDER_ID:  "746797011005",
    FIREBASE_APP_ID:         "1:746797011005:web:5cd09abe929b708d0eda54",

    // ── Gemini AI ──
    GEMINI_API_KEY:          "AIzaSyD_uJX6JaRGIRdi-DK82bUXB9yHDS6lWjE",

    // ── OpenWeatherMap (FREE: 1000 calls/day) ──
    // Sign up: https://openweathermap.org/api
    OPENWEATHER_API_KEY:     "",

    // ── Google Maps & Places ──
    GOOGLE_MAPS_KEY:         "",

    // ── Google Custom Search (Image Search) ──
    GOOGLE_SEARCH_KEY:       "",
    GOOGLE_SEARCH_CX:        "",

    // ── Exchange Rate API (FREE: 1500 calls/month) ──
    EXCHANGE_RATE_KEY:       "",
};
