// ═══════════════════════════════════════════════════════
// BeforeYouGo - Shared Platform JavaScript
// ═══════════════════════════════════════════════════════
// This file is injected into every page and provides:
// - Firebase Auth & Firestore
// - Gemini AI with Image Search
// - Weather, Maps, Currency APIs
// - Navigation & Role Management
// - AI Travel Buddy Chat Widget

(function() {
"use strict";

// ── Protocol Check: file:// won't work with ES modules ──
const IS_FILE_PROTOCOL = window.location.protocol === "file:";
if (IS_FILE_PROTOCOL) {
    console.warn("⚠️ Running on file:// protocol. Firebase & API features disabled.");
    console.warn("💡 Run a local server instead:");
    console.warn("   npx serve .    (Node.js)");
    console.warn("   python3 -m http.server 3000    (Python)");
    
    // Show a helper banner
    document.addEventListener("DOMContentLoaded", function() {
        const banner = document.createElement("div");
        banner.id = "byg-dev-banner";
        banner.innerHTML = `
            <div style="position:fixed;top:0;left:0;right:0;z-index:99999;background:linear-gradient(135deg,#F97316,#EA580C);color:white;padding:10px 20px;font-family:Inter,sans-serif;font-size:13px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                <div>
                    <strong>⚡ Local Dev Mode</strong> — Navigation works, but Firebase/AI features need a server. 
                    Run: <code style="background:rgba(0,0,0,0.2);padding:2px 8px;border-radius:4px;font-size:12px;">npx serve .</code> or 
                    <code style="background:rgba(0,0,0,0.2);padding:2px 8px;border-radius:4px;font-size:12px;">python3 -m http.server 3000</code>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;padding:0 4px;">✕</button>
            </div>
        `;
        document.body.prepend(banner);
        // Push body content down
        document.body.style.paddingTop = "48px";
    });
}

// ── ENV Configuration (Replace with your .env values) ──
const CONFIG = {
    FIREBASE_API_KEY:        window.ENV?.FIREBASE_API_KEY        || "",
    FIREBASE_AUTH_DOMAIN:    window.ENV?.FIREBASE_AUTH_DOMAIN    || "",
    FIREBASE_PROJECT_ID:     window.ENV?.FIREBASE_PROJECT_ID     || "",
    FIREBASE_STORAGE_BUCKET: window.ENV?.FIREBASE_STORAGE_BUCKET || "",
    FIREBASE_MSG_SENDER_ID:  window.ENV?.FIREBASE_MSG_SENDER_ID  || "",
    FIREBASE_APP_ID:         window.ENV?.FIREBASE_APP_ID         || "",
    GEMINI_API_KEY:          window.ENV?.GEMINI_API_KEY          || "",
    OPENWEATHER_API_KEY:     window.ENV?.OPENWEATHER_API_KEY     || "",
    GOOGLE_MAPS_KEY:         window.ENV?.GOOGLE_MAPS_KEY         || "",
    GOOGLE_SEARCH_KEY:       window.ENV?.GOOGLE_SEARCH_KEY       || "",
    GOOGLE_SEARCH_CX:       window.ENV?.GOOGLE_SEARCH_CX        || "",
    EXCHANGE_RATE_KEY:       window.ENV?.EXCHANGE_RATE_KEY        || "",
};

// ── State ──
window.BYG = window.BYG || {};
BYG.user = null;
BYG.role = localStorage.getItem("byg_role") || "traveler";
BYG.itinerary = null;
BYG.chatHistory = [];

// ═══════════════════════════════════════════════
// 1. FIREBASE AUTH
// ═══════════════════════════════════════════════
let firebaseApp, firebaseAuth, firebaseDb;

async function initFirebase() {
    if (!CONFIG.FIREBASE_API_KEY) {
        console.warn("Firebase not configured. Auth features disabled.");
        updateAuthUI(null);
        return;
    }
    // ES module imports fail on file:// protocol
    if (IS_FILE_PROTOCOL) {
        console.warn("Firebase skipped on file:// protocol.");
        updateAuthUI(null);
        // Provide mock auth for local testing
        BYG.auth = {
            signIn: () => Promise.reject(new Error("Start a local server for Firebase auth")),
            signUp: () => Promise.reject(new Error("Start a local server for Firebase auth")),
            signOut: () => Promise.resolve(),
            signInAnon: () => Promise.resolve()
        };
        BYG.db = null;
        return;
    }
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
        const { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInAnonymously }
            = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs }
            = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

        firebaseApp = initializeApp({
            apiKey: CONFIG.FIREBASE_API_KEY,
            authDomain: CONFIG.FIREBASE_AUTH_DOMAIN,
            projectId: CONFIG.FIREBASE_PROJECT_ID,
            storageBucket: CONFIG.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: CONFIG.FIREBASE_MSG_SENDER_ID,
            appId: CONFIG.FIREBASE_APP_ID
        });
        firebaseAuth = getAuth(firebaseApp);
        firebaseDb = getFirestore(firebaseApp);

        // Expose auth functions globally
        BYG.auth = {
            signIn: (e, p) => signInWithEmailAndPassword(firebaseAuth, e, p),
            signUp: (e, p) => createUserWithEmailAndPassword(firebaseAuth, e, p),
            signOut: () => signOut(firebaseAuth),
            signInAnon: () => signInAnonymously(firebaseAuth)
        };
        BYG.db = {
            doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs,
            instance: firebaseDb
        };

        onAuthStateChanged(firebaseAuth, (user) => {
            BYG.user = user;
            updateAuthUI(user);
            if (user && !user.isAnonymous) {
                loadUserProfile(user.uid);
            }
        });

        // If no user, sign in anonymously
        if (!firebaseAuth.currentUser) {
            await signInAnonymously(firebaseAuth);
        }
    } catch (e) {
        console.error("Firebase init failed:", e);
        updateAuthUI(null);
    }
}

async function loadUserProfile(uid) {
    if (!firebaseDb) return;
    try {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
        const snap = await getDoc(doc(firebaseDb, "users", uid));
        if (snap.exists()) {
            const data = snap.data();
            BYG.role = data.activeRole || "traveler";
            localStorage.setItem("byg_role", BYG.role);
            updateNavForRole(BYG.role);
        }
    } catch(e) { console.error("Profile load error:", e); }
}

function updateAuthUI(user) {
    document.querySelectorAll("[data-auth-state]").forEach(el => {
        const state = el.dataset.authState;
        if (state === "logged-in") el.style.display = user && !user.isAnonymous ? "" : "none";
        if (state === "logged-out") el.style.display = !user || user.isAnonymous ? "" : "none";
    });
    document.querySelectorAll("[data-user-name]").forEach(el => {
        el.textContent = user?.email?.split("@")[0] || "Guest";
    });
    document.querySelectorAll("[data-user-email]").forEach(el => {
        el.textContent = user?.email || "";
    });
}


// ═══════════════════════════════════════════════
// 2. GEMINI AI + IMAGE SEARCH
// ═══════════════════════════════════════════════

// Gemini function calling schema for image search
const IMAGE_SEARCH_TOOL = {
    functionDeclarations: [{
        name: "searchImages",
        description: "Search for travel-related images when the user asks to see visual content like hotels, destinations, landmarks, food, activities.",
        parameters: {
            type: "OBJECT",
            properties: {
                query: { type: "STRING", description: "Search query for images (e.g., 'luxury hotels Kyoto', 'street food Bangkok')" },
                count: { type: "INTEGER", description: "Number of images to return (1-5)" }
            },
            required: ["query"]
        }
    }, {
        name: "getWeather",
        description: "Get weather forecast for a destination when user asks about weather, packing, or clothing.",
        parameters: {
            type: "OBJECT",
            properties: {
                city: { type: "STRING", description: "City name" },
                country: { type: "STRING", description: "Country code (e.g., JP, US, FR)" }
            },
            required: ["city"]
        }
    }, {
        name: "getCurrency",
        description: "Get currency exchange rate when user mentions money, prices, budget, or asks about costs in a destination.",
        parameters: {
            type: "OBJECT",
            properties: {
                from: { type: "STRING", description: "Source currency code (e.g., USD, EUR)" },
                to: { type: "STRING", description: "Target currency code (e.g., JPY, INR)" }
            },
            required: ["from", "to"]
        }
    }]
};

async function callGemini(prompt, systemInstruction, options = {}) {
    if (!CONFIG.GEMINI_API_KEY || IS_FILE_PROTOCOL) {
        // Demo mode - return helpful placeholder responses
        const demoResponses = {
            weather: "🌤 **Weather Demo**: Tokyo is currently 22°C and partly cloudy. Pack layers and a light jacket! The forecast shows sunshine for the next 3 days.",
            hotel: "🏨 **Hotels Demo**: I'd recommend checking out the Park Hyatt Tokyo (Shinjuku), HOSHINOYA Tokyo (Otemachi), or Hotel Gracery Shinjuku for great views.",
            currency: "💱 **Currency Demo**: 1 USD = 149.50 JPY. Budget tip: Japan is mostly cash-based, so get yen at airport ATMs for best rates.",
            pack: "🎒 **Packing Tips**: Light layers, comfortable walking shoes, a portable umbrella, and a power adapter (Type A/B). Don't forget a small towel!",
            default: "✨ I'm your AI Travel Buddy! I'm running in demo mode. Start a local server and add your Gemini API key to get full AI responses. Try asking about weather, hotels, packing tips, or currency!"
        };
        const lower = prompt.toLowerCase();
        let response = demoResponses.default;
        if (lower.includes("weather") || lower.includes("climate")) response = demoResponses.weather;
        else if (lower.includes("hotel") || lower.includes("stay") || lower.includes("accommodation")) response = demoResponses.hotel;
        else if (lower.includes("currency") || lower.includes("money") || lower.includes("usd") || lower.includes("eur")) response = demoResponses.currency;
        else if (lower.includes("pack") || lower.includes("bring") || lower.includes("wear")) response = demoResponses.pack;
        return { text: response, toolCalls: [], rawParts: [{ text: response }] };
    }
    
    const model = options.model || "gemini-2.5-flash-preview-09-2025";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    
    const messages = options.history || [];
    messages.push({ role: "user", parts: [{ text: prompt }] });
    
    const payload = {
        contents: messages,
        systemInstruction: { parts: [{ text: systemInstruction || "You are a helpful AI travel assistant for BeforeYouGo platform." }] },
    };

    // Add tools for function calling if enabled
    if (options.enableTools !== false) {
        payload.tools = [IMAGE_SEARCH_TOOL];
    }

    if (options.jsonMode) {
        payload.generationConfig = { responseMimeType: "application/json" };
    }

    let retries = 3, delay = 1000;
    while (retries > 0) {
        try {
            const resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) throw new Error(`API ${resp.status}`);
            const result = await resp.json();
            const candidate = result.candidates?.[0];
            
            if (!candidate?.content?.parts) throw new Error("Empty response");
            
            const textParts = [];
            const toolCalls = [];
            
            for (const part of candidate.content.parts) {
                if (part.text) textParts.push(part.text);
                if (part.functionCall) toolCalls.push(part.functionCall);
            }
            
            return { text: textParts.join("\n"), toolCalls, rawParts: candidate.content.parts };
        } catch(e) {
            retries--;
            if (retries === 0) return { text: "Sorry, AI is temporarily unavailable. Please try again.", toolCalls: [] };
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
        }
    }
}

// Execute tool calls from Gemini
async function executeToolCalls(toolCalls) {
    const results = [];
    for (const call of toolCalls) {
        switch (call.name) {
            case "searchImages":
                results.push({ name: call.name, data: await searchImages(call.args.query, call.args.count || 3) });
                break;
            case "getWeather":
                results.push({ name: call.name, data: await getWeather(call.args.city, call.args.country) });
                break;
            case "getCurrency":
                results.push({ name: call.name, data: await getCurrency(call.args.from, call.args.to) });
                break;
        }
    }
    return results;
}

// Full AI chat with function calling loop
async function aiChat(userMessage, context) {
    const systemPrompt = `You are the BeforeYouGo AI Travel Buddy. Be friendly, helpful, and concise.
You have access to tools: searchImages (for visual requests), getWeather (for weather/packing), getCurrency (for money/budget).
Use these tools proactively when relevant. ${context || ""}`;

    // First call
    let response = await callGemini(userMessage, systemPrompt, { history: BYG.chatHistory });

    // If Gemini wants to call functions
    if (response.toolCalls.length > 0) {
        const toolResults = await executeToolCalls(response.toolCalls);
        
        // Send tool results back to Gemini for final response
        const functionResponses = toolResults.map(r => ({
            functionResponse: { name: r.name, response: { result: JSON.stringify(r.data) } }
        }));
        
        BYG.chatHistory.push({ role: "model", parts: response.rawParts });
        BYG.chatHistory.push({ role: "user", parts: functionResponses });
        
        const finalResp = await callGemini("", systemPrompt, { 
            history: BYG.chatHistory, 
            enableTools: false 
        });
        
        return { text: finalResp.text, widgets: toolResults };
    }
    
    // Update history
    BYG.chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
    BYG.chatHistory.push({ role: "model", parts: [{ text: response.text }] });
    
    return { text: response.text, widgets: [] };
}

BYG.aiChat = aiChat;
BYG.callGemini = callGemini;


// ═══════════════════════════════════════════════
// 3. GOOGLE CUSTOM SEARCH (Image Search)
// ═══════════════════════════════════════════════

async function searchImages(query, count = 3) {
    if (!CONFIG.GOOGLE_SEARCH_KEY || !CONFIG.GOOGLE_SEARCH_CX) {
        // Fallback to placeholder images
        return Array.from({length: count}, (_, i) => ({
            title: `${query} - Image ${i+1}`,
            url: `https://placehold.co/600x400/14B8A6/white?text=${encodeURIComponent(query)}`,
            thumbnail: `https://placehold.co/300x200/14B8A6/white?text=${encodeURIComponent(query)}`,
            source: "Placeholder"
        }));
    }

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${CONFIG.GOOGLE_SEARCH_KEY}&cx=${CONFIG.GOOGLE_SEARCH_CX}&q=${encodeURIComponent(query)}&searchType=image&num=${count}&imgSize=large&safe=active`;
        const resp = await fetch(url);
        const data = await resp.json();
        
        return (data.items || []).map(item => ({
            title: item.title,
            url: item.link,
            thumbnail: item.image?.thumbnailLink || item.link,
            source: item.displayLink,
            width: item.image?.width,
            height: item.image?.height
        }));
    } catch(e) {
        console.error("Image search error:", e);
        return [];
    }
}

BYG.searchImages = searchImages;


// ═══════════════════════════════════════════════
// 4. WEATHER API (OpenWeatherMap)
// ═══════════════════════════════════════════════

async function getWeather(city, country) {
    if (!CONFIG.OPENWEATHER_API_KEY) {
        return { error: false, city, temp: 24, feels_like: 26, humidity: 65, description: "Partly cloudy", icon: "02d",
            forecast: [
                { day: "Mon", temp_max: 26, temp_min: 18, icon: "01d", desc: "Clear" },
                { day: "Tue", temp_max: 24, temp_min: 17, icon: "02d", desc: "Partly cloudy" },
                { day: "Wed", temp_max: 22, temp_min: 16, icon: "10d", desc: "Light rain" },
                { day: "Thu", temp_max: 25, temp_min: 18, icon: "01d", desc: "Sunny" },
                { day: "Fri", temp_max: 27, temp_min: 19, icon: "02d", desc: "Few clouds" }
            ],
            _demo: true
        };
    }
    
    try {
        const loc = country ? `${city},${country}` : city;
        // Current weather
        const currentResp = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(loc)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric`
        );
        const current = await currentResp.json();
        
        // 5-day forecast
        const forecastResp = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(loc)}&appid=${CONFIG.OPENWEATHER_API_KEY}&units=metric&cnt=40`
        );
        const forecastData = await forecastResp.json();
        
        // Group forecast by day
        const days = {};
        const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
        (forecastData.list || []).forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toISOString().split("T")[0];
            if (!days[dayKey]) {
                days[dayKey] = { temps: [], icons: [], descs: [], day: dayNames[date.getDay()] };
            }
            days[dayKey].temps.push(item.main.temp);
            days[dayKey].icons.push(item.weather[0].icon);
            days[dayKey].descs.push(item.weather[0].description);
        });
        
        const forecast = Object.values(days).slice(0, 5).map(d => ({
            day: d.day,
            temp_max: Math.round(Math.max(...d.temps)),
            temp_min: Math.round(Math.min(...d.temps)),
            icon: d.icons[Math.floor(d.icons.length/2)],
            desc: d.descs[Math.floor(d.descs.length/2)]
        }));

        return {
            city: current.name,
            temp: Math.round(current.main?.temp),
            feels_like: Math.round(current.main?.feels_like),
            humidity: current.main?.humidity,
            description: current.weather?.[0]?.description,
            icon: current.weather?.[0]?.icon,
            forecast
        };
    } catch(e) {
        console.error("Weather API error:", e);
        return { error: true, message: "Weather data unavailable" };
    }
}

BYG.getWeather = getWeather;


// ═══════════════════════════════════════════════
// 5. CURRENCY EXCHANGE API
// ═══════════════════════════════════════════════

async function getCurrency(from, to) {
    if (!CONFIG.EXCHANGE_RATE_KEY) {
        // Demo rates
        const demoRates = { "USD-EUR": 0.92, "USD-JPY": 149.5, "USD-INR": 83.2, "USD-GBP": 0.79, "EUR-USD": 1.09, "INR-USD": 0.012 };
        const key = `${from}-${to}`;
        const rate = demoRates[key] || 1.0;
        return { from, to, rate, amount_1: rate, amount_100: (rate * 100).toFixed(2), _demo: true };
    }
    
    try {
        const resp = await fetch(`https://v6.exchangerate-api.com/v6/${CONFIG.EXCHANGE_RATE_KEY}/pair/${from}/${to}`);
        const data = await resp.json();
        return {
            from, to,
            rate: data.conversion_rate,
            amount_1: data.conversion_rate,
            amount_100: (data.conversion_rate * 100).toFixed(2)
        };
    } catch(e) {
        console.error("Currency API error:", e);
        return { error: true, message: "Currency data unavailable" };
    }
}

BYG.getCurrency = getCurrency;


// ═══════════════════════════════════════════════
// 6. WIDGET RENDERERS
// ═══════════════════════════════════════════════

function renderWeatherWidget(data) {
    if (data.error) return `<div class="p-4 bg-red-50 rounded-xl text-red-600">Weather data unavailable</div>`;
    const iconUrl = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    return `
    <div class="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg max-w-sm">
        <div class="flex items-center justify-between">
            <div>
                <p class="text-sm opacity-80">${data.city}${data._demo ? " (Demo)" : ""}</p>
                <p class="text-4xl font-bold">${data.temp}°C</p>
                <p class="text-sm capitalize">${data.description}</p>
            </div>
            <img src="${iconUrl}" alt="weather" class="w-16 h-16"/>
        </div>
        <div class="flex gap-2 mt-4 overflow-x-auto">
            ${(data.forecast||[]).map(f => `
                <div class="flex-shrink-0 text-center bg-white/20 rounded-xl px-3 py-2 text-xs">
                    <p class="font-medium">${f.day}</p>
                    <img src="https://openweathermap.org/img/wn/${f.icon}.png" class="w-8 h-8 mx-auto"/>
                    <p>${f.temp_max}°/${f.temp_min}°</p>
                </div>
            `).join("")}
        </div>
    </div>`;
}

function renderCurrencyWidget(data) {
    if (data.error) return `<div class="p-4 bg-red-50 rounded-xl text-red-600">Currency data unavailable</div>`;
    return `
    <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-lg max-w-xs">
        <p class="text-xs opacity-80">Exchange Rate${data._demo ? " (Demo)" : ""}</p>
        <p class="text-2xl font-bold mt-1">1 ${data.from} = ${data.rate?.toFixed(4)} ${data.to}</p>
        <p class="text-sm mt-2 opacity-90">100 ${data.from} = ${data.amount_100} ${data.to}</p>
    </div>`;
}

function renderImageGallery(images) {
    if (!images?.length) return "";
    return `
    <div class="grid grid-cols-${Math.min(images.length, 3)} gap-3 mt-3">
        ${images.map(img => `
            <div class="rounded-xl overflow-hidden shadow-md group">
                <img src="${img.url}" alt="${img.title}" class="w-full h-40 object-cover group-hover:scale-105 transition-transform" loading="lazy"
                     onerror="this.src='https://placehold.co/400x300/14B8A6/white?text=Image'"/>
                <p class="text-xs p-2 truncate text-gray-500">${img.title}</p>
            </div>
        `).join("")}
    </div>`;
}

BYG.renderWeatherWidget = renderWeatherWidget;
BYG.renderCurrencyWidget = renderCurrencyWidget;
BYG.renderImageGallery = renderImageGallery;


// ═══════════════════════════════════════════════
// 7. AI TRAVEL BUDDY FLOATING WIDGET
// ═══════════════════════════════════════════════

function injectAIBuddy() {
    if (document.getElementById("byg-ai-buddy")) return;
    
    const widget = document.createElement("div");
    widget.id = "byg-ai-buddy";
    widget.innerHTML = `
    <style>
        #byg-ai-buddy { position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Inter', 'Poppins', sans-serif; }
        #byg-ai-toggle { width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #14B8A6, #0F766E); color: white; border: none; cursor: pointer; box-shadow: 0 8px 25px rgba(20,184,166,0.4); display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        #byg-ai-toggle:hover { transform: scale(1.1); box-shadow: 0 12px 35px rgba(20,184,166,0.5); }
        #byg-ai-toggle .pulse { position: absolute; width: 60px; height: 60px; border-radius: 50%; background: rgba(20,184,166,0.3); animation: aiPulse 2s infinite; }
        @keyframes aiPulse { 0% { transform: scale(1); opacity: 0.7; } 100% { transform: scale(1.5); opacity: 0; } }
        #byg-ai-panel { display: none; position: absolute; bottom: 70px; right: 0; width: 380px; max-height: 520px; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden; flex-direction: column; animation: slideUp 0.3s ease; }
        #byg-ai-panel.open { display: flex; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        #byg-ai-panel .header { background: linear-gradient(135deg, #14B8A6, #0F766E); color: white; padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
        #byg-ai-panel .messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; max-height: 340px; }
        #byg-ai-panel .messages::-webkit-scrollbar { width: 4px; }
        #byg-ai-panel .messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .byg-msg { max-width: 85%; padding: 10px 14px; border-radius: 16px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
        .byg-msg.ai { background: #f0fdfa; color: #134e4a; border-bottom-left-radius: 4px; align-self: flex-start; }
        .byg-msg.user { background: linear-gradient(135deg, #F97316, #EA580C); color: white; border-bottom-right-radius: 4px; align-self: flex-end; }
        .byg-msg .widget-area { margin-top: 8px; }
        #byg-ai-panel .input-area { padding: 12px 16px; border-top: 1px solid #e5e7eb; display: flex; gap: 8px; }
        #byg-ai-panel .input-area input { flex: 1; border: 1px solid #e5e7eb; border-radius: 24px; padding: 8px 16px; font-size: 14px; outline: none; }
        #byg-ai-panel .input-area input:focus { border-color: #14B8A6; box-shadow: 0 0 0 3px rgba(20,184,166,0.1); }
        #byg-ai-panel .input-area button { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #F97316, #EA580C); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .byg-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 16px 12px; }
        .byg-chip { background: #f0fdfa; border: 1px solid #14B8A6; color: #0F766E; padding: 4px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .byg-chip:hover { background: #14B8A6; color: white; }
        .byg-typing { display: flex; gap: 4px; padding: 10px 14px; }
        .byg-typing span { width: 8px; height: 8px; background: #14B8A6; border-radius: 50%; animation: typingBounce 1.4s infinite; }
        .byg-typing span:nth-child(2) { animation-delay: 0.2s; }
        .byg-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
        @media (max-width: 480px) { #byg-ai-panel { width: calc(100vw - 32px); right: -8px; bottom: 70px; } }
    </style>
    <div id="byg-ai-panel">
        <div class="header">
            <span style="font-size:24px">✨</span>
            <div style="flex:1"><p style="font-weight:600;margin:0">AI Travel Buddy</p><p style="font-size:12px;opacity:0.8;margin:0">Ask me anything about your trip</p></div>
            <button onclick="toggleAIBuddy()" style="background:none;border:none;color:white;font-size:20px;cursor:pointer">✕</button>
        </div>
        <div class="messages" id="byg-ai-messages">
            <div class="byg-msg ai">Hello! I'm your AI Travel Buddy ✨ Ask me about destinations, packing tips, weather, local customs, or let me search for images of places you'd like to visit!</div>
        </div>
        <div class="byg-chips" id="byg-ai-chips">
            <span class="byg-chip" onclick="sendAIChip(this)">🌤 Weather in Tokyo</span>
            <span class="byg-chip" onclick="sendAIChip(this)">📸 Show hotels in Bali</span>
            <span class="byg-chip" onclick="sendAIChip(this)">💱 USD to EUR rate</span>
            <span class="byg-chip" onclick="sendAIChip(this)">🎒 Packing tips</span>
        </div>
        <div class="input-area">
            <input type="text" id="byg-ai-input" placeholder="Ask about your trip..." onkeydown="if(event.key==='Enter')sendAIMessage()"/>
            <button onclick="sendAIMessage()">➤</button>
        </div>
    </div>
    <button id="byg-ai-toggle" onclick="toggleAIBuddy()">
        <span class="pulse"></span>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>`;
    
    document.body.appendChild(widget);
}

window.toggleAIBuddy = function() {
    const panel = document.getElementById("byg-ai-panel");
    panel.classList.toggle("open");
};

window.sendAIChip = function(el) {
    const text = el.textContent.replace(/^[^\w]+/, "").trim();
    document.getElementById("byg-ai-input").value = text;
    sendAIMessage();
    document.getElementById("byg-ai-chips").style.display = "none";
};

window.sendAIMessage = async function() {
    const input = document.getElementById("byg-ai-input");
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    
    const messagesDiv = document.getElementById("byg-ai-messages");
    
    // User bubble
    messagesDiv.innerHTML += `<div class="byg-msg user">${escapeHtml(msg)}</div>`;
    
    // Typing indicator
    messagesDiv.innerHTML += `<div class="byg-msg ai byg-typing-indicator"><div class="byg-typing"><span></span><span></span><span></span></div></div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    let context = "";
    if (BYG.itinerary) context = `User has this itinerary: ${BYG.itinerary}`;
    
    const response = await BYG.aiChat(msg, context);
    
    // Remove typing indicator
    const typingEl = messagesDiv.querySelector(".byg-typing-indicator");
    if (typingEl) typingEl.remove();
    
    // AI response
    let widgetHtml = "";
    if (response.widgets) {
        for (const w of response.widgets) {
            if (w.name === "getWeather") widgetHtml += `<div class="widget-area">${renderWeatherWidget(w.data)}</div>`;
            if (w.name === "getCurrency") widgetHtml += `<div class="widget-area">${renderCurrencyWidget(w.data)}</div>`;
            if (w.name === "searchImages") widgetHtml += `<div class="widget-area">${renderImageGallery(w.data)}</div>`;
        }
    }
    
    const textHtml = response.text ? marked ? marked.parse(response.text) : response.text.replace(/\n/g, "<br>") : "";
    messagesDiv.innerHTML += `<div class="byg-msg ai">${textHtml}${widgetHtml}</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

function escapeHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}


// ═══════════════════════════════════════════════
// 8. NAVIGATION INJECTION
// ═══════════════════════════════════════════════

function updateNavForRole(role) {
    // This adds active states and updates navigation links based on current role
    const currentPage = window.location.pathname;
    document.querySelectorAll("[data-nav-role]").forEach(el => {
        el.style.display = el.dataset.navRole === role || el.dataset.navRole === "all" ? "" : "none";
    });
    
    // Add active states
    document.querySelectorAll("nav a, aside a").forEach(link => {
        if (link.getAttribute("href") && currentPage.includes(link.getAttribute("href"))) {
            link.classList.add("border-primary", "text-primary", "font-medium");
        }
    });
}

function injectNavLinks() {
    // Find all anchor tags with href="#" and try to map them to real pages
    const linkMap = {
        "dashboard": getPageUrl("dashboard"),
        "my trips": getPageUrl("trips"),
        "trips": getPageUrl("trips"),
        "discover": getPageUrl("discover"),
        "messages": getPageUrl("messages"),
        "settings": getPageUrl("settings"),
        "clients": getPageUrl("clients"),
        "calendar": getPageUrl("calendar"),
        "analytics": getPageUrl("analytics"),
        "tours": getPageUrl("tours"),
        "profile": getPageUrl("profile"),
        "earnings": getPageUrl("earnings"),
        "notifications": getPageUrl("notifications"),
        "sign in": getPageUrl("signin"),
        "sign up": getPageUrl("signup"),
        "login": getPageUrl("signin"),
    };

    document.querySelectorAll("a[href=\"#\"]").forEach(link => {
        const text = link.textContent.trim().toLowerCase();
        for (const [key, url] of Object.entries(linkMap)) {
            if (text.includes(key) && url) {
                link.setAttribute("href", url);
                break;
            }
        }
    });
}

function getPageUrl(key) {
    const base = getBasePath();
    const role = BYG.role;
    const routes = {
        dashboard:     { traveler: `${base}pages/traveler/dashboard.html`, guide: `${base}pages/guide/dashboard.html`, agency: `${base}pages/agency/dashboard.html` },
        trips:         { traveler: `${base}pages/traveler/past-trips.html` },
        discover:      { traveler: `${base}pages/traveler/dashboard.html` },
        messages:      { all: `${base}pages/traveler/notifications.html` },
        settings:      { all: `${base}pages/shared/settings.html` },
        clients:       { guide: `${base}pages/guide/clients.html`, agency: `${base}pages/agency/dashboard.html` },
        calendar:      { guide: `${base}pages/guide/availability.html`, agency: `${base}pages/agency/calendar.html` },
        analytics:     { agency: `${base}pages/agency/analytics.html` },
        tours:         { agency: `${base}pages/agency/tour-builder.html` },
        profile:       { guide: `${base}pages/guide/profile-builder.html`, agency: `${base}pages/agency/profile-builder.html` },
        earnings:      { guide: `${base}pages/guide/dashboard.html`, agency: `${base}pages/agency/analytics.html` },
        notifications: { all: `${base}pages/traveler/notifications.html` },
        signin:        { all: `${base}pages/public/signin.html` },
        signup:        { all: `${base}pages/public/signin.html` },
    };
    
    const route = routes[key];
    if (!route) return null;
    return route[role] || route.all || route.traveler || Object.values(route)[0];
}

function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    if (path.endsWith("index.html") || path === "/" || path === "") return "./";
    return "../".repeat(Math.max(0, depth));
}


// ═══════════════════════════════════════════════
// 9. INITIALIZATION
// ═══════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
    // Load marked.js for markdown rendering
    if (!window.marked) {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
        document.head.appendChild(s);
    }
    
    // Init Firebase
    await initFirebase();
    
    // Inject navigation links
    injectNavLinks();
    
    // Inject AI Buddy widget (on authenticated pages)
    const isPublicPage = window.location.pathname.includes("/public/") || 
                          window.location.pathname.endsWith("index.html") ||
                          window.location.pathname === "/" ||
                          window.location.pathname.endsWith("404.html");
    
    if (!isPublicPage) {
        injectAIBuddy();
    }
    
    // Setup role-based UI
    updateNavForRole(BYG.role);
    
    // Wire up any auth forms on the page
    setupAuthForms();
    
    // Wire up any existing chat forms
    setupExistingChatForms();
    
    console.log("🌍 BeforeYouGo initialized | Role:", BYG.role);
});

function setupAuthForms() {
    // Look for sign-in forms
    document.querySelectorAll("form").forEach(form => {
        const emailInput = form.querySelector("input[type=\"email\"]");
        const passwordInput = form.querySelector("input[type=\"password\"]");
        if (emailInput && passwordInput) {
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const email = emailInput.value;
                const password = passwordInput.value;
                const submitBtn = form.querySelector("button[type=\"submit\"], button:last-of-type");
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Please wait...";
                }
                
                // On file:// protocol or no Firebase, just navigate to dashboard
                if (IS_FILE_PROTOCOL || !BYG.auth?.signIn) {
                    localStorage.setItem("byg_user_email", email);
                    localStorage.setItem("byg_role", "traveler");
                    window.location.href = getPageUrl("dashboard");
                    return;
                }
                
                try {
                    await BYG.auth.signIn(email, password);
                    window.location.href = getPageUrl("dashboard");
                } catch(e) {
                    // Try signup if signin fails
                    try {
                        await BYG.auth.signUp(email, password);
                        window.location.href = getPageUrl("dashboard");
                    } catch(e2) {
                        const errEl = form.querySelector("[class*=\"error\"], [class*=\"red\"]") || form.querySelector("p:last-of-type");
                        if (errEl) { errEl.textContent = e2.message; errEl.style.display = "block"; }
                        else alert(e2.message);
                    }
                }
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Sign In"; }
            });
        }
    });
}

function setupExistingChatForms() {
    // Wire up any existing chat/message inputs on the page
    const chatInputs = document.querySelectorAll("input[placeholder*=\"Ask\"], input[placeholder*=\"ask\"], input[placeholder*=\"Type\"], input[placeholder*=\"message\"]");
    chatInputs.forEach(input => {
        const form = input.closest("form") || input.parentElement;
        const sendBtn = form?.querySelector("button");
        
        const handleSend = async () => {
            const msg = input.value.trim();
            if (!msg) return;
            input.value = "";
            
            // Find nearest message container
            const msgContainer = document.querySelector("[class*=\"messages\"], [class*=\"chat\"], [id*=\"chat\"], [id*=\"message\"]");
            if (!msgContainer) return;
            
            // Add user message
            msgContainer.innerHTML += `<div class="p-3 rounded-xl bg-orange-500 text-white self-end max-w-[80%] ml-auto mb-3">${escapeHtml(msg)}</div>`;
            msgContainer.innerHTML += `<div class="p-3 rounded-xl bg-teal-50 self-start max-w-[80%] mb-3 loading-ai"><div class="byg-typing" style="display:flex;gap:4px"><span style="width:8px;height:8px;background:#14B8A6;border-radius:50%;animation:typingBounce 1.4s infinite"></span><span style="width:8px;height:8px;background:#14B8A6;border-radius:50%;animation:typingBounce 1.4s infinite 0.2s"></span><span style="width:8px;height:8px;background:#14B8A6;border-radius:50%;animation:typingBounce 1.4s infinite 0.4s"></span></div></div>`;
            msgContainer.scrollTop = msgContainer.scrollHeight;
            
            const response = await BYG.aiChat(msg, "");
            
            const loadingEl = msgContainer.querySelector(".loading-ai");
            if (loadingEl) loadingEl.remove();
            
            let widgetHtml = "";
            if (response.widgets) {
                for (const w of response.widgets) {
                    if (w.name === "getWeather") widgetHtml += renderWeatherWidget(w.data);
                    if (w.name === "getCurrency") widgetHtml += renderCurrencyWidget(w.data);
                    if (w.name === "searchImages") widgetHtml += renderImageGallery(w.data);
                }
            }
            const textHtml = window.marked ? marked.parse(response.text) : response.text;
            msgContainer.innerHTML += `<div class="p-3 rounded-xl bg-teal-50 text-teal-900 self-start max-w-[80%] mb-3">${textHtml}${widgetHtml}</div>`;
            msgContainer.scrollTop = msgContainer.scrollHeight;
        };

        input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); }});
        if (sendBtn) sendBtn.addEventListener("click", (e) => { e.preventDefault(); handleSend(); });
    });
}

})();
