(function () {
"use strict";

if (window.BYGMarketplaceMVP) return;

var APP_STATE_KEY = "byg_app_state_v2";
var ctx = { basePath: "./", isPublicPage: false, role: "traveler" };

var ROUTES = {
  travelerDashboard: "pages/traveler/dashboard.html",
  vibe: "pages/traveler/vibe-search.html",
  tour: "pages/traveler/tour-detail.html",
  checkout: "pages/traveler/checkout.html",
  bookingConfirm: "pages/traveler/booking-confirm.html",
  notifications: "pages/traveler/notifications.html",
  guideDashboard: "pages/guide/dashboard.html",
  guideClients: "pages/guide/clients.html",
  agencyDashboard: "pages/agency/dashboard.html",
  agencyBookings: "pages/agency/participants.html",
  signIn: "pages/public/signin.html",
  payoutSetup: "pages/shared/payout-setup.html",
  paymentStatus: "pages/shared/payment-status.html"
};

var DESTINATION_CUES = [
  { label: "Tadoba tiger safari", expertise: ["wildlife"], tags: ["tiger", "safari", "forest", "wildlife", "nature"], destination: "Tadoba National Park" },
  { label: "Ladakh high altitude trek", expertise: ["mountaineering"], tags: ["trek", "mountain", "altitude", "ladakh", "himalaya", "climb", "camp"], destination: "Ladakh" },
  { label: "Jaipur craft and food trail", expertise: ["cultural"], tags: ["culture", "food", "festival", "craft", "art", "local"], destination: "Jaipur" },
  { label: "Mumbai night culture break", expertise: ["urban"], tags: ["city", "urban", "nightlife", "shopping", "street", "weekend"], destination: "Mumbai" },
  { label: "Pune old city heritage walk", expertise: ["historical"], tags: ["history", "heritage", "fort", "museum", "old city", "temple"], destination: "Pune" },
  { label: "Konkan slow coastal reset", expertise: ["cultural", "urban"], tags: ["coastal", "beach", "slow", "weekend", "konkan"], destination: "Konkan Coast" }
];

var MOOD_EXPERTISE = {
  "neon nights": ["urban", "cultural"],
  "high altitude": ["mountaineering"],
  "island calm": ["cultural"],
  "deep forest": ["wildlife"],
  "alpine autumn": ["mountaineering", "historical"],
  "coastal color": ["urban", "cultural"]
};

var GUIDE_SEEDS = [
  {
    id: "guide-ananya-patil",
    type: "guide",
    name: "Ananya Patil",
    baseCity: "Pune",
    neighborhood: "Baner",
    expertise: ["wildlife"],
    specialties: ["Tiger safaris", "Birding hides", "Photography-friendly pacing"],
    headline: "Wildlife naturalist for tiger, birding, and slow jungle journeys",
    summary: "Builds private wildlife escapes from Pune to Tadoba, Bhigwan, and Pench with a calm, family-safe pace.",
    bio: "Ananya plans nature-first itineraries for travelers who want sightings, storytelling, and comfortable logistics without losing the wild feeling of the trip.",
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.9,
    tripsCompleted: 118,
    responseTime: "18 min",
    priceFrom: 2800,
    featuredTitle: "Tadoba Tiger Tracking Escape",
    featuredDestination: "Tadoba National Park",
    featuredDuration: "3D / 2N",
    featuredSummary: "A Pune start, premium safari slots, and a photography-minded guide brief.",
    tags: ["Wildlife", "Nature", "Photography"],
    destinations: ["Tadoba", "Bhigwan", "Pench", "Satpura"]
  },
  {
    id: "guide-rohan-kulkarni",
    type: "guide",
    name: "Rohan Kulkarni",
    baseCity: "Pune",
    neighborhood: "Aundh",
    expertise: ["mountaineering"],
    specialties: ["Technical prep", "High-altitude pacing", "Beginner-to-intermediate climbs"],
    headline: "Mountaineering mentor for treks, camps, and first summit plans",
    summary: "Rohan handles training, acclimatization planning, and gear lists for travelers leaving Pune for the Sahyadris and Himalayas.",
    bio: "Former expedition lead with a patient coaching style. Great for ambitious travelers who want a safe but serious mountain plan.",
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.8,
    tripsCompleted: 93,
    responseTime: "27 min",
    priceFrom: 3200,
    featuredTitle: "Ladakh Prep + Stok Kangri Style Training",
    featuredDestination: "Ladakh",
    featuredDuration: "6D / 5N",
    featuredSummary: "Training blocks, acclimatization logic, and a realistic summit roadmap.",
    tags: ["Mountaineering", "Camping", "Fitness"],
    destinations: ["Ladakh", "Sandhan Valley", "Harishchandragad", "Spiti"]
  },
  {
    id: "guide-meera-joshi",
    type: "guide",
    name: "Meera Joshi",
    baseCity: "Pune",
    neighborhood: "Kothrud",
    expertise: ["cultural"],
    specialties: ["Craft routes", "Food-led itineraries", "Local host access"],
    headline: "Cultural guide for food, festivals, and maker communities",
    summary: "Meera curates immersive culture trips that feel local, not touristy, from Pune to Jaipur, Varanasi, and coastal craft towns.",
    bio: "Perfect for travelers who care about people, food, and context. She builds days around conversations, markets, and living traditions.",
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.9,
    tripsCompleted: 146,
    responseTime: "14 min",
    priceFrom: 2600,
    featuredTitle: "Jaipur Craft + Courtyard Food Trail",
    featuredDestination: "Jaipur",
    featuredDuration: "4D / 3N",
    featuredSummary: "Potters, block printers, old city meals, and boutique stays with story-rich pacing.",
    tags: ["Culture", "Food", "Handmade"],
    destinations: ["Jaipur", "Varanasi", "Kutch", "Kochi"]
  },
  {
    id: "guide-kunal-deshpande",
    type: "guide",
    name: "Kunal Deshpande",
    baseCity: "Pune",
    neighborhood: "Kalyani Nagar",
    expertise: ["urban"],
    specialties: ["Street culture", "Cafe neighborhoods", "Fast weekend breaks"],
    headline: "Urban trip planner for city energy, design, and nightlife",
    summary: "Kunal helps travelers turn a quick escape into a layered city experience with music, food, shopping, and neighborhood rhythm.",
    bio: "Best for high-energy trips where the traveler wants the city to feel curated, social, and easy to navigate from day to late night.",
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.7,
    tripsCompleted: 101,
    responseTime: "11 min",
    priceFrom: 2200,
    featuredTitle: "Mumbai Night Culture Sprint",
    featuredDestination: "Mumbai",
    featuredDuration: "2D / 1N",
    featuredSummary: "Street eats, design stores, indie music stops, and smooth intercity logistics from Pune.",
    tags: ["Urban", "Nightlife", "Weekend"],
    destinations: ["Mumbai", "Bengaluru", "Hyderabad", "Goa"]
  },
  {
    id: "guide-isha-nene",
    type: "guide",
    name: "Isha Nene",
    baseCity: "Pune",
    neighborhood: "Sadashiv Peth",
    expertise: ["historical"],
    specialties: ["Fort trails", "Contextual storytelling", "Heritage-friendly pacing"],
    headline: "Historical storyteller for forts, old quarters, and layered heritage routes",
    summary: "Isha connects architecture, memory, and local legends so travelers understand why a place matters, not just what to photograph.",
    bio: "Ideal for slower travelers who want forts, museums, temple towns, and old city walks with a strong narrative thread.",
    languages: ["English", "Hindi", "Marathi"],
    rating: 4.9,
    tripsCompleted: 87,
    responseTime: "20 min",
    priceFrom: 2400,
    featuredTitle: "Pune to Hampi Heritage Circuit",
    featuredDestination: "Hampi",
    featuredDuration: "5D / 4N",
    featuredSummary: "A story-led route through ruins, temple geometry, and old trade paths.",
    tags: ["History", "Heritage", "Architecture"],
    destinations: ["Pune", "Hampi", "Ajanta", "Jaipur"]
  }
];

var AGENCY_SEEDS = [
  {
    id: "agency-sahyadri-summit-co",
    type: "agency",
    name: "Sahyadri Summit Co.",
    baseCity: "Pune",
    neighborhood: "Shivajinagar",
    expertise: ["mountaineering"],
    headline: "Adventure agency for treks, climbs, and training-led expeditions",
    summary: "Runs structured mountain departures with logistics, camp ops, and safety systems built for travelers departing Pune.",
    bio: "A high-trust operator for summit-focused groups, from Sahyadri prep weekends to Himalayan expedition blocks.",
    rating: 4.8,
    tripsCompleted: 212,
    responseTime: "32 min",
    priceFrom: 14500,
    teamSize: 12,
    featuredTitle: "Winter Rupin Prep Series",
    featuredDestination: "Uttarakhand",
    featuredDuration: "7D / 6N",
    featuredSummary: "Training, guide ratios, and a clean high-altitude operations plan.",
    tags: ["Adventure", "Expedition", "Training"],
    destinations: ["Uttarakhand", "Ladakh", "Spiti", "Sahyadris"]
  },
  {
    id: "agency-deccan-heritage-collective",
    type: "agency",
    name: "Deccan Heritage Collective",
    baseCity: "Pune",
    neighborhood: "Deccan Gymkhana",
    expertise: ["historical", "cultural"],
    headline: "Boutique heritage agency for old cities, forts, and living culture",
    summary: "Packages story-rich journeys with local historians, craft partners, and beautifully paced stays from Pune outward.",
    bio: "Best for couples, families, and international visitors who want a premium heritage trip without losing local depth.",
    rating: 4.9,
    tripsCompleted: 184,
    responseTime: "25 min",
    priceFrom: 16800,
    teamSize: 8,
    featuredTitle: "Pune Old Quarter + Fort Belt",
    featuredDestination: "Pune",
    featuredDuration: "3D / 2N",
    featuredSummary: "Heritage walks, curated stays, and Maratha history told with strong local context.",
    tags: ["Heritage", "Craft", "Luxury"],
    destinations: ["Pune", "Hampi", "Jaipur", "Lucknow"]
  },
  {
    id: "agency-pune-urban-weekenders",
    type: "agency",
    name: "Pune Urban Weekenders",
    baseCity: "Pune",
    neighborhood: "Koregaon Park",
    expertise: ["urban"],
    headline: "Fast-moving city break agency for weekends, food runs, and social itineraries",
    summary: "Builds low-friction city escapes with nightlife, design stays, restaurant bookings, and clean transit from Pune.",
    bio: "A good match for young professionals, friend groups, and quick reset trips where the city itself is the experience.",
    rating: 4.7,
    tripsCompleted: 231,
    responseTime: "16 min",
    priceFrom: 9800,
    teamSize: 10,
    featuredTitle: "Mumbai 36-Hour Pulse Trip",
    featuredDestination: "Mumbai",
    featuredDuration: "2D / 1N",
    featuredSummary: "Dining, culture, and neighborhood energy without the planning overhead.",
    tags: ["City Break", "Food", "Nightlife"],
    destinations: ["Mumbai", "Goa", "Hyderabad", "Bengaluru"]
  },
  {
    id: "agency-wildpune-expeditions",
    type: "agency",
    name: "WildPune Expeditions",
    baseCity: "Pune",
    neighborhood: "Viman Nagar",
    expertise: ["wildlife"],
    headline: "Wildlife-first agency for safaris, naturalist-led departures, and family nature escapes",
    summary: "Combines guide expertise, permits, stays, and transport into full wildlife trips that start smoothly from Pune.",
    bio: "Strong option for families and small groups who want the simplicity of a package with real naturalist depth.",
    rating: 4.9,
    tripsCompleted: 205,
    responseTime: "19 min",
    priceFrom: 13200,
    teamSize: 9,
    featuredTitle: "Pench + Tadoba Double Park Circuit",
    featuredDestination: "Central India",
    featuredDuration: "5D / 4N",
    featuredSummary: "Safari slots, lodge transfers, and one wildlife operations team handling the full run.",
    tags: ["Safari", "Family", "Nature"],
    destinations: ["Tadoba", "Pench", "Satpura", "Bhigwan"]
  },
  {
    id: "agency-roots-ritual-travel",
    type: "agency",
    name: "Roots & Ritual Travel",
    baseCity: "Pune",
    neighborhood: "Erandwane",
    expertise: ["cultural"],
    headline: "Slow travel agency for rituals, food stories, and soulful community stays",
    summary: "Builds deeper itineraries around local hosts, regional food, and meaningful cultural pacing instead of checklist travel.",
    bio: "Great for travelers who want a softer, more intimate trip with a strong sense of place and thoughtful logistics.",
    rating: 4.8,
    tripsCompleted: 159,
    responseTime: "24 min",
    priceFrom: 15400,
    teamSize: 7,
    featuredTitle: "Konkan Monsoon Story Route",
    featuredDestination: "Konkan Coast",
    featuredDuration: "4D / 3N",
    featuredSummary: "Local homes, coastal food, and story-led regional experiences from a Pune start.",
    tags: ["Slow Travel", "Food", "Local Hosts"],
    destinations: ["Konkan", "Kutch", "Jaipur", "Kochi"]
  }
];

var SAMPLE_REQUESTS = [
  { id: "req-seed-1", providerId: "guide-ananya-patil", providerType: "guide", travelerName: "Riya Shah", destination: "Tadoba National Park", travelers: 2, dates: "2026-04-18", note: "Want tiger-focused safaris and a photography-friendly jeep.", stage: "new", budget: "INR 30k", createdAt: "2026-03-29T09:00:00.000Z" },
  { id: "req-seed-2", providerId: "guide-isha-nene", providerType: "guide", travelerName: "Dev Mehta", destination: "Pune heritage trail", travelers: 4, dates: "2026-04-11", note: "Parents visiting. Need an accessible old-city day plan.", stage: "quoted", budget: "INR 18k", createdAt: "2026-03-28T11:30:00.000Z" },
  { id: "req-seed-3", providerId: "guide-meera-joshi", providerType: "guide", travelerName: "Sana Khan", destination: "Jaipur craft trail", travelers: 2, dates: "2026-04-25", note: "Food plus handmade experiences. Boutique stays preferred.", stage: "planning", budget: "INR 45k", createdAt: "2026-03-27T13:00:00.000Z" },
  { id: "req-seed-4", providerId: "agency-sahyadri-summit-co", providerType: "agency", travelerName: "Aarav Jain", destination: "Ladakh prep departure", travelers: 5, dates: "2026-05-06", note: "Small team from Pune, need acclimatization and gear support.", stage: "new", budget: "INR 1.8L", createdAt: "2026-03-30T08:40:00.000Z" },
  { id: "req-seed-5", providerId: "agency-deccan-heritage-collective", providerType: "agency", travelerName: "Maya Iyer", destination: "Pune fort and history weekend", travelers: 6, dates: "2026-04-20", note: "Family celebration, want storytellers and premium transfers.", stage: "quoted", budget: "INR 72k", createdAt: "2026-03-29T17:15:00.000Z" },
  { id: "req-seed-6", providerId: "agency-pune-urban-weekenders", providerType: "agency", travelerName: "Karan Sethi", destination: "Mumbai weekend pulse", travelers: 3, dates: "2026-04-12", note: "Need nightlife, design hotels, and smooth Pune pickups.", stage: "planning", budget: "INR 55k", createdAt: "2026-03-30T14:05:00.000Z" }
];

var SAMPLE_BOOKINGS = [
  { id: "book-seed-1", providerId: "agency-wildpune-expeditions", providerType: "agency", travelerName: "Nikita Rao", destination: "Pench + Tadoba Double Park Circuit", travelers: 4, dates: "2026-04-15", amount: 64800, status: "confirmed", createdAt: "2026-03-26T09:20:00.000Z", reference: "BKG-40261" },
  { id: "book-seed-2", providerId: "guide-ananya-patil", providerType: "guide", travelerName: "Rohan Verma", destination: "Bhigwan birding sunrise", travelers: 2, dates: "2026-04-09", amount: 9600, status: "confirmed", createdAt: "2026-03-25T07:40:00.000Z", reference: "BKG-40262" },
  { id: "book-seed-3", providerId: "agency-deccan-heritage-collective", providerType: "agency", travelerName: "Lina George", destination: "Pune Old Quarter + Fort Belt", travelers: 5, dates: "2026-04-13", amount: 52500, status: "confirmed", createdAt: "2026-03-24T15:00:00.000Z", reference: "BKG-40263" }
];

function init(options) {
  ctx = mergeObjects(ctx, options || {});
  if (!window.BYG || !window.BYG.appState) return Promise.resolve();

  decorateRoleModal();

  if (ctx.isPublicPage) {
    initTravelerOnlySignIn();
    return Promise.resolve();
  }

  ensureMarketplaceState();
  syncTravelerIdentity();
  personalizeTravelerUi();
  initTravelerDashboard();
  initVibeSearch();
  initTourDetail();
  initCheckoutUI();
  initNotifications();
  initGuideDashboard();
  initGuideClients();
  initAgencyDashboard();
  initAgencyParticipants();
  initBookingConfirm();
  initBookingConfirmUI();
  initGuideProfileBuilder();
  initGuideAvailability();
  initPayoutSetup();
  initAgencyTourBuilder();
  initAgencyTeam();
  initGavel();
  initNotifications();
  initWeatherSwap();
  initVibeSearch();
  initPastTrips();
  initRealtimeSync();
  return Promise.resolve();
}

function initRealtimeSync() {
  var checkDb = setInterval(function() {
    if (window.BYG && window.BYG.db && window.location.protocol !== "file:") {
      clearInterval(checkDb);
      if (window.BYG.db.onSnapshot) {
        window.BYG.db.onSnapshot(
          window.BYG.db.doc(window.BYG.db.instance, "global", "marketplace_v2"),
          function(docSnap) {
            if (docSnap.exists()) {
              var data = docSnap.data();
              var market = window.BYG.appState.marketplace;
              if (!market) return;
              market.requests = data.requests || market.requests;
              market.bookings = data.bookings || market.bookings;
              market.messages = data.messages || market.messages;
              try {
                localStorage.setItem(APP_STATE_KEY, JSON.stringify(window.BYG.appState));
              } catch(e) {}
              rerenderCurrentBoard();
            } else {
              persistMarketplaceData();
            }
          }
        );
      }
    }
  }, 1000);
}

function ensureMarketplaceState() {
  var appState = window.BYG.appState || (window.BYG.appState = {});
  var market = appState.marketplace || {};
  var changed = false;

  if (market.schemaVersion !== 2) {
    market.schemaVersion = 2;
    market.requests = [];
    market.bookings = [];
    market.messages = [];
    changed = true;
  }

  if (!market.schemaVersion) {
    market.schemaVersion = 1;
    changed = true;
  }
  if (!market.guides || !market.guides.length) {
    market.guides = deepClone(GUIDE_SEEDS);
    changed = true;
  }
  if (!market.agencies || !market.agencies.length) {
    market.agencies = deepClone(AGENCY_SEEDS);
    changed = true;
  }
  if (!market.requests) {
    market.requests = [];
    changed = true;
  }
  if (!market.bookings) {
    market.bookings = [];
    changed = true;
  }
  if (!market.messages) {
    market.messages = [];
    changed = true;
  }
  if (!market.selectedGuideId) {
    market.selectedGuideId = market.guides[0].id;
    changed = true;
  }
  if (!market.selectedAgencyId) {
    market.selectedAgencyId = market.agencies[0].id;
    changed = true;
  }
  if (!market.search) {
    market.search = { query: "Pune", providerType: "all", expertise: "all", summary: "" };
    changed = true;
  }
  if (!market.activeListing) {
    market.activeListing = listingFromProvider(market.agencies[0]);
    changed = true;
  }

  appState.marketplace = market;

  if (!market.bootstrapNotified && window.BYGPlatformExperience && window.BYGPlatformExperience.pushNotification) {
    market.bootstrapNotified = true;
    window.BYGPlatformExperience.pushNotification({
      category: "System",
      title: "Pune provider network is live",
      body: "Explore now includes 5 guides and 5 agencies with live demo interactions.",
      ctaLabel: "Explore",
      route: route("travelerDashboard")
    });
    changed = true;
  }

  if (changed) persistState();
  return market;
}

function syncTravelerIdentity() {
  var market = ensureMarketplaceState();
  var user = window.BYG.user;
  var email = (user && user.email) || localStorage.getItem("byg_user_email") || "";
  var displayName = (user && user.displayName) || emailToName(email) || "Traveler";
  market.traveler = market.traveler || {};
  market.traveler.name = displayName;
  market.traveler.email = email;
  market.traveler.baseCity = "Pune";
  persistState();
}

function initTravelerOnlySignIn() {
  if (window.location.pathname.indexOf("/public/signin") === -1) return;
  if (document.getElementById("byg-traveler-auth-note")) return;

  var title = document.querySelector("h1");
  var subtitle = title && title.parentElement ? title.parentElement.querySelector("p") : null;
  var socialButtons = $$("button").filter(function (btn) { return /google|facebook|apple/i.test(btn.textContent || ""); });
  var form = document.querySelector("form");
  var sideText = $$("a, p, span").filter(function (node) {
    return /sign up|create an account|forgot password|remember me/i.test((node.textContent || "").toLowerCase());
  });

  if (title) title.textContent = "Traveler Sign In";
  if (subtitle) subtitle.textContent = "Use Google to open your traveler dashboard. Guide and agency sides are pre-seeded Pune demo profiles.";

  if (socialButtons.length) {
    socialButtons.forEach(function (btn) {
      var text = (btn.textContent || "").toLowerCase();
      if (text.indexOf("google") > -1) {
        btn.innerHTML = btn.innerHTML.replace(/Google/i, "Continue with Google");
        btn.classList.add("border-primary/30", "bg-orange-50");
      } else {
        btn.style.display = "none";
      }
    });
  }

  if (form) form.style.display = "none";
  sideText.forEach(function (node) {
    if (node.closest("form")) return;
    if (/features|process|inspiration/i.test(node.textContent || "")) return;
    if (/privacy|terms/i.test(node.textContent || "")) return;
    node.style.display = "none";
  });

  if (title && title.parentElement) {
    var note = document.createElement("div");
    note.id = "byg-traveler-auth-note";
    note.className = "mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-left";
    note.innerHTML =
      '<p class="text-sm font-semibold text-slate-900">Traveler-only authentication</p>' +
      '<p class="mt-1 text-sm text-slate-600">The real sign-in is for travelers. Guide and agency dashboards are filled with Pune-based demo providers so the marketplace feels live from day one.</p>';
    title.parentElement.appendChild(note);
  }
}

function decorateRoleModal() {
  var modal = document.getElementById("byg-role-modal");
  if (!modal || modal.dataset.marketplaceReady === "true") return;
  modal.dataset.marketplaceReady = "true";

  var desc = modal.querySelector("p");
  if (desc) desc.textContent = "Traveler is your real sign-in. Guide and agency views are seeded Pune demo dashboards for MVP testing.";

  $$("a", modal).forEach(function (link) {
    var text = (link.textContent || "").toLowerCase();
    if (text.indexOf("guide") > -1) {
      var body = link.querySelector("p");
      if (body) body.textContent = "Preview 5 seeded Pune guide profiles";
    }
    if (text.indexOf("agency") > -1) {
      var agencyBody = link.querySelector("p");
      if (agencyBody) agencyBody.textContent = "Preview 5 seeded Pune agency profiles";
    }
  });
}

function personalizeTravelerUi() {
  var market = ensureMarketplaceState();
  var travelerName = market.traveler && market.traveler.name ? market.traveler.name : "Traveler";
  if (window.location.pathname.indexOf("/traveler/") === -1) return;

  $$("p, h1, h2, span").forEach(function (node) {
    if ((node.textContent || "").trim() === "Alex Morgan") node.textContent = travelerName;
  });
}

function initTravelerDashboard() {
  if (window.location.pathname.indexOf("/traveler/dashboard") === -1) return;
  if (document.getElementById("byg-mvp-explore")) return;

  var main = document.querySelector("main");
  var anchor = main && main.querySelector("header");
  if (!main || !anchor) return;

  var section = document.createElement("section");
  section.id = "byg-mvp-explore";
  section.className = "space-y-6 rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur";
  section.innerHTML =
    '<div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">' +
      '<div class="space-y-2">' +
        '<div class="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">' +
          '<span class="material-icons text-sm">hub</span> Live Marketplace' +
        '</div>' +
        '<h2 class="text-2xl font-bold text-slate-900">Search a place, then decide: solo, guide, or agency.</h2>' +
        '<p class="max-w-3xl text-sm text-slate-500">Every result below is a seeded Pune-based provider profile. Traveler actions here create live requests that also appear inside guide and agency dashboards.</p>' +
      '</div>' +
      '<button type="button" data-byg-solo class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">' +
        '<span class="material-icons text-base">travel_explore</span> Continue Solo with AI' +
      '</button>' +
    '</div>' +
    '<div class="grid gap-4 lg:grid-cols-[1.7fr_1fr]">' +
      '<div class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">' +
        '<div class="flex flex-col gap-3 md:flex-row">' +
          '<label class="flex-1">' +
            '<span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search a place or trip style</span>' +
            '<div class="relative">' +
              '<span class="material-icons pointer-events-none absolute left-3 top-3.5 text-slate-400">search</span>' +
              '<input data-byg-market-query type="text" placeholder="Try: Tadoba tiger safari, Pune heritage, Mumbai weekend..." class="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />' +
            '</div>' +
          '</label>' +
          '<label class="md:w-56">' +
            '<span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Provider type</span>' +
            '<select data-byg-market-type class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">' +
              '<option value="all">Show guides and agencies</option>' +
              '<option value="guide">Guides only</option>' +
              '<option value="agency">Agencies only</option>' +
            '</select>' +
          '</label>' +
        '</div>' +
        '<div class="flex flex-wrap gap-2" data-byg-expertise-chips></div>' +
        '<div class="flex flex-wrap gap-2 text-xs font-medium text-slate-500" data-byg-destination-cues></div>' +
        '<div class="rounded-2xl border border-slate-200 bg-white p-4">' +
          '<div class="flex items-start gap-3">' +
            '<div class="rounded-xl bg-teal-50 p-2 text-primary"><span class="material-icons">auto_awesome</span></div>' +
            '<div class="space-y-1">' +
              '<p class="text-sm font-semibold text-slate-900">Match summary</p>' +
              '<p data-byg-ai-summary class="text-sm text-slate-600">Search a destination and we will rank the best Pune-based guides or agencies for it.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white">' +
        '<p class="text-xs font-semibold uppercase tracking-wide text-orange-200">Why this MVP feels live</p>' +
        '<div class="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">' +
          '<div><p class="text-2xl font-bold">5</p><p class="text-sm text-slate-200">Guides with distinct expertise</p></div>' +
          '<div><p class="text-2xl font-bold">5</p><p class="text-sm text-slate-200">Agencies based in Pune</p></div>' +
          '<div><p class="text-2xl font-bold">3-way</p><p class="text-sm text-slate-200">Traveler, guide, and agency interactions share one state layer</p></div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-byg-market-results></div>';

  anchor.insertAdjacentElement("afterend", section);
  bindTravelerDashboardSearch(section);
}

function bindTravelerDashboardSearch(section) {
  var market = ensureMarketplaceState();
  var queryInput = section.querySelector("[data-byg-market-query]");
  var typeSelect = section.querySelector("[data-byg-market-type]");
  var chipsWrap = section.querySelector("[data-byg-expertise-chips]");
  var cueWrap = section.querySelector("[data-byg-destination-cues]");
  var summaryEl = section.querySelector("[data-byg-ai-summary]");
  var resultsEl = section.querySelector("[data-byg-market-results]");
  var selectedExpertise = market.search.expertise || "all";
  var chips = ["all", "wildlife", "mountaineering", "cultural", "urban", "historical"];

  queryInput.value = market.search.query || "Pune";
  typeSelect.value = market.search.providerType || "all";

  chipsWrap.innerHTML = chips.map(function (chip) {
    return '<button type="button" data-byg-expertise="' + chip + '" class="rounded-full border px-3 py-1.5 text-xs font-semibold transition ' +
      (selectedExpertise === chip ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary") +
      '">' + titleCase(chip === "all" ? "all expertise" : chip) + '</button>';
  }).join("");

  cueWrap.innerHTML = DESTINATION_CUES.slice(0, 6).map(function (cue) {
    return '<button type="button" data-byg-cue="' + escapeHtml(cue.label) + '" class="rounded-full bg-white px-3 py-1.5 shadow-sm transition hover:bg-orange-50 hover:text-orange-600">' + escapeHtml(cue.label) + '</button>';
  }).join("");

  function refresh(useAi) {
    selectedExpertise = selectedExpertise || "all";
    market.search.query = queryInput.value.trim() || "Pune";
    market.search.providerType = typeSelect.value;
    market.search.expertise = selectedExpertise;
    persistState();

    var results = searchProviders(market.search.query, market.search.providerType, selectedExpertise, getSelectedMood());
    renderProviderResults(resultsEl, results, market.search.query, summaryEl);
    if (useAi !== false) updateSearchSummary(summaryEl, market.search.query, results, selectedExpertise);
  }

  chipsWrap.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-byg-expertise]");
    if (!btn) return;
    selectedExpertise = btn.getAttribute("data-byg-expertise");
    $$("[data-byg-expertise]", chipsWrap).forEach(function (chipBtn) {
      var active = chipBtn.getAttribute("data-byg-expertise") === selectedExpertise;
      chipBtn.className = "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
        (active ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary");
    });
    refresh(true);
  });

  cueWrap.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-byg-cue]");
    if (!btn) return;
    queryInput.value = btn.getAttribute("data-byg-cue");
    refresh(true);
  });

  typeSelect.addEventListener("change", function () { refresh(true); });
  queryInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      refresh(true);
    }
  });
  section.querySelector("[data-byg-solo]").addEventListener("click", function () {
    market.activeListing = null;
    persistState();
    navigate("vibe");
  });

  resultsEl.addEventListener("click", function (event) {
    var cardAction = event.target.closest("[data-byg-provider-action]");
    if (!cardAction) return;
    var providerId = cardAction.getAttribute("data-byg-provider-id");
    var providerType = cardAction.getAttribute("data-byg-provider-type");
    var action = cardAction.getAttribute("data-byg-provider-action");
    var provider = findProvider(providerType, providerId);
    if (!provider) return;

    if (action === "details") openProviderProfile(provider, queryInput.value.trim() || "Pune");
    if (action === "request") openRequestComposer(provider, queryInput.value.trim() || provider.featuredDestination);
    if (action === "message") openMessageComposer(provider, "I found your profile in Explore and want to plan " + (queryInput.value.trim() || provider.featuredDestination) + ".");
    if (action === "tour") {
      setActiveListing(provider, queryInput.value.trim() || provider.featuredDestination);
      navigate("tour");
    }
  });

  refresh(false);
}

function renderProviderResults(resultsEl, results, query, summaryEl) {
  if (!results.length) {
    resultsEl.innerHTML =
      '<div class="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">' +
        '<p class="text-sm font-semibold text-slate-900">No provider matched that search yet.</p>' +
        '<p class="mt-1 text-sm text-slate-500">Try a destination, mood, or expertise like wildlife, urban, or historical.</p>' +
      '</div>';
    summaryEl.textContent = "No direct match yet, so try a broader destination or switch the expertise filter.";
    return;
  }

  resultsEl.innerHTML = results.map(function (item) {
    var provider = item.provider;
    return (
      '<article class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">' +
        '<div class="flex items-start justify-between gap-3 border-b border-slate-100 p-4">' +
          '<div class="flex items-center gap-3">' +
            avatarHtml(provider.name, provider.type === "guide" ? "from-teal-500 to-emerald-400" : "from-orange-500 to-amber-400", 48) +
            '<div><p class="text-sm font-semibold text-slate-900">' + escapeHtml(provider.name) + '</p><p class="text-xs text-slate-500">' + escapeHtml(provider.baseCity + " • " + provider.neighborhood) + '</p></div>' +
          '</div>' +
          '<div class="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">' + item.score + '% fit</div>' +
        '</div>' +
        '<div class="space-y-4 p-4">' +
          '<div><p class="text-xs font-semibold uppercase tracking-wide text-primary">' + escapeHtml(provider.type === "guide" ? "Guide" : "Agency") + '</p><h3 class="mt-1 text-lg font-bold text-slate-900">' + escapeHtml(provider.featuredTitle) + '</h3><p class="mt-1 text-sm text-slate-600">' + escapeHtml(provider.summary) + '</p></div>' +
          '<div class="flex flex-wrap gap-2">' +
            provider.tags.slice(0, 3).map(function (tag) { return '<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">' + escapeHtml(tag) + '</span>'; }).join("") +
          '</div>' +
          '<div class="grid grid-cols-2 gap-3 text-sm">' +
            '<div class="rounded-xl bg-slate-50 p-3"><p class="text-xs uppercase text-slate-400">Best for</p><p class="mt-1 font-semibold text-slate-900">' + escapeHtml(provider.expertise.join(", ")) + '</p></div>' +
            '<div class="rounded-xl bg-slate-50 p-3"><p class="text-xs uppercase text-slate-400">From Pune</p><p class="mt-1 font-semibold text-slate-900">' + formatCurrency(provider.priceFrom, provider.type) + '</p></div>' +
          '</div>' +
          '<div class="rounded-xl border border-teal-100 bg-teal-50 p-3 text-sm text-teal-900"><span class="font-semibold">Why this match:</span> ' + escapeHtml(item.reason) + '</div>' +
          '<div class="flex flex-wrap gap-2">' +
            '<button type="button" data-byg-provider-action="tour" data-byg-provider-id="' + provider.id + '" data-byg-provider-type="' + provider.type + '" class="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"><span class="material-icons text-base">map</span> See Details</button>' +
            '<button type="button" data-byg-provider-action="request" data-byg-provider-id="' + provider.id + '" data-byg-provider-type="' + provider.type + '" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"><span class="material-icons text-base">request_quote</span> Request Plan</button>' +
            '<button type="button" data-byg-provider-action="message" data-byg-provider-id="' + provider.id + '" data-byg-provider-type="' + provider.type + '" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"><span class="material-icons text-base">chat</span> Message</button>' +
            '<button type="button" data-byg-provider-action="details" data-byg-provider-id="' + provider.id + '" data-byg-provider-type="' + provider.type + '" class="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"><span class="material-icons text-base">person</span> Profile</button>' +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join("");
}

function updateSearchSummary(summaryEl, query, results, selectedExpertise) {
  var expertiseText = selectedExpertise && selectedExpertise !== "all" ? titleCase(selectedExpertise) : "mixed expertise";
  summaryEl.textContent = "For " + query + ", the strongest Pune matches are " + results.slice(0, 2).map(function (item) { return item.provider.name; }).join(" and ") + " because they already specialize in " + expertiseText.toLowerCase() + " travel.";

  if (!(window.ENV && window.ENV.GEMINI_API_KEY && window.BYG && typeof window.BYG.callGemini === "function")) return;

  window.BYG.callGemini(
    "Traveler query: " + query + "\nTop Pune providers: " + results.slice(0, 3).map(function (item) { return item.provider.name + " (" + item.provider.type + ", " + item.provider.expertise.join("/") + ")"; }).join(", ") + "\nWrite two short sentences explaining why these providers fit.",
    "You are helping match travelers with Pune-based guides and agencies. Be concise and concrete.",
    { enableTools: false }
  ).then(function (response) {
    if (response && response.text) summaryEl.textContent = response.text.replace(/\s+/g, " ").trim();
  }).catch(function () {});
}

function initVibeSearch() {
  if (window.location.pathname.indexOf("/traveler/vibe-search") === -1) return;
  if (document.getElementById("byg-vibe-provider-strip")) return;

  var resultsHeader = $$("h2").filter(function (node) { return /destination matches/i.test(node.textContent || ""); })[0];
  if (!resultsHeader || !resultsHeader.parentElement || !resultsHeader.parentElement.parentElement) return;

  var strip = document.createElement("section");
  strip.id = "byg-vibe-provider-strip";
  strip.className = "mb-8 space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm";
  resultsHeader.parentElement.parentElement.insertBefore(strip, resultsHeader.parentElement.nextSibling);
  renderVibeProviderStrip(strip);
}

function renderVibeProviderStrip(strip) {
  var mood = getSelectedMood();
  var expertise = (MOOD_EXPERTISE[(mood || "").toLowerCase()] || ["cultural"])[0];
  var results = searchProviders(mood, "all", expertise, mood).slice(0, 3);

  strip.innerHTML =
    '<div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">' +
      '<div><p class="text-xs font-semibold uppercase tracking-wide text-primary">Prefer help instead of solo planning?</p><h3 class="text-xl font-bold text-slate-900">Pune providers that match the "' + escapeHtml(mood) + '" vibe</h3></div>' +
      '<button type="button" data-byg-vibe-solo class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">Keep It Solo</button>' +
    '</div>' +
    '<div class="grid gap-4 md:grid-cols-3">' +
      results.map(function (item) {
        return (
          '<article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">' +
            '<div class="flex items-center gap-3">' +
              avatarHtml(item.provider.name, item.provider.type === "guide" ? "from-teal-500 to-emerald-400" : "from-orange-500 to-amber-400", 42) +
              '<div><p class="font-semibold text-slate-900">' + escapeHtml(item.provider.name) + '</p><p class="text-xs text-slate-500">' + escapeHtml(item.provider.type === "guide" ? "Guide" : "Agency") + ' • ' + item.score + '% fit</p></div>' +
            '</div>' +
            '<p class="mt-3 text-sm text-slate-600">' + escapeHtml(item.reason) + '</p>' +
            '<div class="mt-4 flex gap-2">' +
              '<button type="button" data-byg-vibe-provider="' + item.provider.id + '" data-byg-vibe-type="' + item.provider.type + '" class="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">Use This Match</button>' +
              '<button type="button" data-byg-vibe-message="' + item.provider.id + '" data-byg-vibe-type="' + item.provider.type + '" class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">Message</button>' +
            '</div>' +
          '</article>'
        );
      }).join("") +
    '</div>';

  strip.addEventListener("click", function (event) {
    var soloBtn = event.target.closest("[data-byg-vibe-solo]");
    if (soloBtn) { navigate("travelerDashboard"); return; }

    var providerBtn = event.target.closest("[data-byg-vibe-provider]");
    if (providerBtn) {
      var provider = findProvider(providerBtn.getAttribute("data-byg-vibe-type"), providerBtn.getAttribute("data-byg-vibe-provider"));
      if (!provider) return;
      setActiveListing(provider, provider.featuredDestination);
      navigate("tour");
      return;
    }

    var messageBtn = event.target.closest("[data-byg-vibe-message]");
    if (!messageBtn) return;
    var messageProvider = findProvider(messageBtn.getAttribute("data-byg-vibe-type"), messageBtn.getAttribute("data-byg-vibe-message"));
    if (messageProvider) openMessageComposer(messageProvider, "I matched with your profile from the " + mood + " vibe search.");
  });
}

function initTourDetail() {
  if (window.location.pathname.indexOf("/traveler/tour-detail") === -1) return;
  var market = ensureMarketplaceState();
  var listing = market.activeListing || listingFromProvider(market.agencies[0]);
  if (!listing) return;

  updateTourDetailContent(listing);
  bindTourDetailActions(listing);
}

function updateTourDetailContent(listing) {
  var provider = findProvider(listing.providerType, listing.providerId);
  if (!provider) return;

  var title = document.querySelector("h1");
  if (title) title.textContent = listing.title;

  $$("div, p, span").forEach(function (node) {
    var text = (node.textContent || "").trim();
    if (text === "Ubud, Bali, Indonesia") node.textContent = listing.destination;
    if (text === "Bali Soul Tours") node.textContent = provider.name;
  });

  var price = $$("span").filter(function (node) { return /^\$\d/.test((node.textContent || "").trim()); })[0];
  if (price) price.textContent = "$" + Math.round(listing.priceFrom).toLocaleString("en-US");

  var saveTag = $$("div").filter(function (node) { return /save 10%/i.test(node.textContent || ""); })[0];
  if (saveTag) saveTag.textContent = provider.type === "guide" ? "PRIVATE GUIDE" : "PUNE AGENCY";

  var fitCopy = $$("p").filter(function (node) { return /Based on your interest/i.test(node.textContent || ""); })[0];
  if (fitCopy) {
    fitCopy.innerHTML = 'Based on your current search for <strong class="text-primary-dark dark:text-primary">' + escapeHtml(listing.searchQuery || listing.destination) + '</strong>, this is a strong match because <strong class="text-primary-dark dark:text-primary">' + escapeHtml(provider.name) + '</strong> already specializes in <strong class="text-primary-dark dark:text-primary">' + escapeHtml(provider.expertise.join(" + ")) + '</strong> travel from Pune.';
  }

  var sidebarButtons = $$("button").filter(function (btn) {
    var text = (btn.textContent || "").toLowerCase();
    return text.indexOf("book now") > -1 || text.indexOf("request quote") > -1 || text.indexOf("message host") > -1;
  });
  sidebarButtons.forEach(function (btn) {
    var text = (btn.textContent || "").toLowerCase();
    if (text.indexOf("book now") > -1) btn.textContent = provider.type === "guide" ? "Request Guide" : "Book Now";
    if (text.indexOf("request quote") > -1) btn.textContent = provider.type === "guide" ? "Hold Dates" : "Request Quote";
    if (text.indexOf("message host") > -1) btn.textContent = provider.type === "guide" ? "Message Guide" : "Message Agency";
  });

  var selects = $$("select");
  if (selects.length > 0) {
    var d = new Date();
    var m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var f = function(dt) { return m[dt.getMonth()] + " " + String(dt.getDate()).padStart(2,"0") + ", " + dt.getFullYear(); };
    var d1 = new Date(d.getFullYear(), d.getMonth() + 1, 15);
    var d2 = new Date(d.getFullYear(), d.getMonth() + 2, 8);
    var d3 = new Date(d.getFullYear(), d.getMonth() + 3, 22);
    var d1e = new Date(d1.getTime() + 7 * 86400000);
    var d2e = new Date(d2.getTime() + 7 * 86400000);
    var d3e = new Date(d3.getTime() + 7 * 86400000);
    selects[0].innerHTML = 
      '<option>' + f(d1) + ' - ' + f(d1e) + '</option>' +
      '<option>' + f(d2) + ' - ' + f(d2e) + '</option>' +
      '<option>' + f(d3) + ' - ' + f(d3e) + '</option>';
      
    // Default dates for state transfer
    listing.defaultDates = f(d1) + ' - ' + f(d1e);
  }
}

function bindTourDetailActions(listing) {
  var provider = findProvider(listing.providerType, listing.providerId);
  if (!provider) return;

  $$("button").forEach(function (btn) {
    var text = (btn.textContent || "").toLowerCase();
    if (text.indexOf("request guide") > -1 || text.indexOf("book now") > -1) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        
        var dateSel = $$("select")[0];
        window.BYG.appState.bookingDraftSelectedDates = dateSel ? dateSel.value : (listing.defaultDates || "Flexible Dates");
        
        setActiveListing(provider, listing.destination);
        ensureMarketplaceState().activeCheckoutProvider = {
          providerId: provider.id,
          providerType: provider.type,
          destination: listing.destination,
          title: listing.title,
          priceFrom: listing.priceFrom,
          duration: listing.duration
        };
        window.BYG.appState.bookingDraft = {
          title: listing.title,
          price: "$" + Math.round(listing.priceFrom).toLocaleString("en-US"),
          dates: window.BYG.appState.bookingDraftSelectedDates || listing.defaultDates || "Flexible Dates",
          guests: "2 Travelers",
          providerName: provider.name,
          providerType: provider.type,
          providerId: provider.id,
          reference: "TRP-" + Math.floor(10000 + Math.random() * 89999)
        };
        persistState();
        navigate("checkout");
      }, true);
    }

    if (text.indexOf("hold dates") > -1 || text.indexOf("request quote") > -1) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openRequestComposer(provider, listing.destination);
      }, true);
    }

    if (text.indexOf("message guide") > -1 || text.indexOf("message agency") > -1 || text.indexOf("message host") > -1) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openMessageComposer(provider, "I am interested in " + listing.title + ".");
      }, true);
    }
  });
}

function initBookingConfirm() {
  if (window.location.pathname.indexOf("/traveler/booking-confirm") === -1) return;
  var market = ensureMarketplaceState();
  var checkoutProvider = market.activeCheckoutProvider;
  var confirmed = (window.BYG.appState.confirmedBookings || [])[0] || window.BYG.appState.bookingDraft;
  if (!checkoutProvider || !confirmed) return;
  if (findBookingByReference(confirmed.reference)) return;

  market.bookings.unshift({
    id: "book-" + Date.now(),
    providerId: checkoutProvider.providerId,
    providerType: checkoutProvider.providerType,
    travelerName: market.traveler.name,
    destination: checkoutProvider.title,
    travelers: parseInt((confirmed.guests || "2").replace(/\D/g, ""), 10) || 2,
    dates: confirmed.dates || "Flexible Dates",
    amount: parseInt(String(checkoutProvider.priceFrom).replace(/\D/g, ""), 10) || checkoutProvider.priceFrom,
    status: "confirmed",
    createdAt: new Date().toISOString(),
    reference: confirmed.reference || ("BKG-" + Math.floor(10000 + Math.random() * 89999))
  });

  pushAppNotification({
    category: "System",
    title: "Booking shared with " + providerName(checkoutProvider.providerType, checkoutProvider.providerId),
    body: "Your reservation is now visible in the provider dashboard.",
    ctaLabel: "View inbox",
    route: route("notifications")
  });

  persistState();
}

function initBookingConfirmUI() {
  if (window.location.pathname.indexOf("/traveler/booking-confirm") === -1) return;
  var confirmed = (window.BYG.appState.confirmedBookings || [])[0] || window.BYG.appState.bookingDraft;
  if (!confirmed) return;
  var market = window.BYG.appState.marketplace;
  var checkoutProvider = market.activeCheckoutProvider;
  
  $$("h1, div, p, span").forEach(function(el) {
    var txt = (el.textContent || "").trim();
    if (txt === "Sunset Kayaking Tour") el.textContent = confirmed.title;
    else if (txt === "Sarah Jenkins") {
      var pn = confirmed.providerName;
      if (!pn && checkoutProvider) {
        var p = findProvider(checkoutProvider.providerType, checkoutProvider.providerId);
        if (p) pn = p.name;
      }
      el.textContent = pn || "Provider";
    }
    else if (txt === "Oct 24, 2023") el.textContent = confirmed.dates;
    else if (txt === "Dock 52, Marina Del Rey") el.textContent = (checkoutProvider ? checkoutProvider.destination : confirmed.title);
    else if (txt === "2 Adults" && el.tagName.toLowerCase() === "div") el.textContent = confirmed.guests;
    else if (txt === "Booking #TRP-88291") el.textContent = "Booking " + confirmed.reference;
    else if (txt === "#TRP-88291") el.textContent = confirmed.reference;
    else if (txt === "Order #88291") el.textContent = "Order " + confirmed.reference;
  });
}

function initCheckoutUI() {
  if (window.location.pathname.indexOf("/traveler/checkout") === -1) return;
  var draft = window.BYG && window.BYG.appState && window.BYG.appState.bookingDraft;
  if (!draft) return;
  var market = window.BYG.appState.marketplace;
  var provider = market && market.activeCheckoutProvider;

  $$("h3, p, span").forEach(function(el) {
    var txt = (el.textContent || "").trim();
    if (txt === "Kyoto, Japan" && provider) el.textContent = provider.destination;
    else if (txt === "Traditional Culture & Nature Tour") el.textContent = draft.title + " by " + draft.providerName;
    else if (txt === "Oct 12 - Oct 20, 2023") el.textContent = draft.dates;
    else if (txt === "2 Adults" && el.tagName.toLowerCase() === "p") el.textContent = draft.guests;
    else if (txt === "$2,450.00" || txt === "$2,200.00") el.textContent = draft.price;
  });
  
  var btnPrice = document.getElementById("byg-checkout-price");
  if (btnPrice) btnPrice.textContent = draft.price;
}

function initNotifications() {
  if (window.location.pathname.indexOf("/traveler/notifications") === -1) return;
  if (document.getElementById("byg-live-inbox")) return;

  var main = document.querySelector("main");
  var firstBlock = main && main.querySelector("div.flex.flex-col.lg\\:flex-row");
  if (!main || !firstBlock) return;

  var section = document.createElement("section");
  section.id = "byg-live-inbox";
  section.className = "mb-8 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm";
  main.insertBefore(section, firstBlock);
  renderNotifications(section);
}

function renderNotifications(section) {
  var market = ensureMarketplaceState();
  var travelerName = market.traveler.name;
  var requestItems = market.requests.filter(function (req) { return req.travelerName === travelerName; }).slice(0, 4);
  var bookingItems = market.bookings.filter(function (booking) { return booking.travelerName === travelerName; }).slice(0, 3);
  var messageItems = market.messages.filter(function (msg) { return msg.travelerName === travelerName; }).slice(0, 4);
  var cards = [];

  requestItems.forEach(function (req) {
    cards.push({ tone: "teal", title: providerName(req.providerType, req.providerId) + " received your request", body: req.destination + " • " + titleCase(req.stage) + " • " + (req.dates || "Flexible dates"), action: "Reply", providerId: req.providerId, providerType: req.providerType });
  });
  bookingItems.forEach(function (booking) {
    cards.push({ tone: "orange", title: booking.destination + " is confirmed", body: providerName(booking.providerType, booking.providerId) + " • Ref " + booking.reference, action: "Open booking", routeKey: "bookingConfirm" });
  });
  messageItems.forEach(function (msg) {
    cards.push({ tone: "blue", title: "New message from " + providerName(msg.providerType, msg.providerId), body: truncate(msg.message, 90), action: "Reply", providerId: msg.providerId, providerType: msg.providerType });
  });

  if (!cards.length) {
    cards.push({ tone: "slate", title: "Your live inbox is ready", body: "As soon as you request a guide or agency from Explore, the conversation will show up here.", action: "Start exploring", routeKey: "travelerDashboard" });
  }

  section.innerHTML =
    '<div class="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">' +
      '<div><p class="text-xs font-semibold uppercase tracking-wide text-primary">Live traveler inbox</p><h2 class="text-xl font-bold text-slate-900">Marketplace updates tied to your real traveler account</h2></div>' +
      '<p class="text-sm text-slate-500">These cards are generated from the same shared state used by the provider dashboards.</p>' +
    '</div>' +
    '<div class="grid gap-4 md:grid-cols-2">' +
      cards.map(function (card) {
        var toneClass = card.tone === "orange" ? "orange-600" : card.tone === "blue" ? "blue-600" : card.tone === "teal" ? "teal-600" : "slate-600";
        return (
          '<article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">' +
            '<div class="flex items-start gap-3">' +
              '<div class="rounded-xl bg-' + card.tone + '-50 p-2 text-' + toneClass + '"><span class="material-icons">' + (card.routeKey === "bookingConfirm" ? "confirmation_number" : card.action === "Reply" ? "chat" : "notifications") + '</span></div>' +
              '<div class="flex-1">' +
                '<p class="font-semibold text-slate-900">' + escapeHtml(card.title) + '</p>' +
                '<p class="mt-1 text-sm text-slate-600">' + escapeHtml(card.body) + '</p>' +
                '<button type="button" data-byg-live-card="' + escapeHtml(card.action) + '" data-byg-live-provider="' + (card.providerId || "") + '" data-byg-live-type="' + (card.providerType || "") + '" data-byg-live-route="' + (card.routeKey || "") + '" class="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark">' +
                  escapeHtml(card.action) + ' <span class="material-icons text-base">arrow_forward</span>' +
                '</button>' +
              '</div>' +
            '</div>' +
          '</article>'
        );
      }).join("") +
    '</div>';

  if (section.dataset.bound !== "true") {
    section.addEventListener("click", function (event) {
      var action = event.target.closest("[data-byg-live-card]");
      if (!action) return;
      var routeKey = action.getAttribute("data-byg-live-route");
      var providerId = action.getAttribute("data-byg-live-provider");
      var providerType = action.getAttribute("data-byg-live-type");
      if (routeKey) { navigate(routeKey); return; }
      if (providerId && providerType) {
        var provider = findProvider(providerType, providerId);
        if (provider) openMessageComposer(provider, "Following up from my notifications.");
      }
    });
    section.dataset.bound = "true";
  }
}

function initGuideDashboard() {
  if (window.location.pathname.indexOf("/guide/dashboard") === -1) return;
  if (document.getElementById("byg-guide-live-board")) return;

  var main = document.querySelector("main");
  if (!main) return;

  var board = document.createElement("section");
  board.id = "byg-guide-live-board";
  board.className = "mb-6 space-y-5";
  main.insertBefore(board, main.firstChild);
  renderGuideDashboard(board);
}

function renderGuideDashboard(board) {
  var market = ensureMarketplaceState();
  var guide = findProvider("guide", market.selectedGuideId) || market.guides[0];
  var requests = providerRequests(guide.id, "guide");
  var bookings = providerBookings(guide.id, "guide");
  var fresh = requests.filter(function (req) { return req.stage === "new"; });
  var active = requests.filter(function (req) { return req.stage === "quoted" || req.stage === "planning"; });
  var revenue = bookings.reduce(function(sum, b) { return sum + (b.amount || 0); }, 0);

  // Fix Bug 7: Update original static cards
  var statP = $$("p").filter(function(p) { return p.textContent.indexOf("Total Trips") > -1; })[0];
  if (statP && statP.nextElementSibling) statP.nextElementSibling.textContent = bookings.length;
  var earnP = $$("p").filter(function(p) { return p.textContent.indexOf("Month's Earnings") > -1; })[0];
  if (earnP && earnP.nextElementSibling) earnP.nextElementSibling.textContent = "INR " + revenue.toLocaleString("en-IN");
  var pendP = $$("p").filter(function(p) { return p.textContent.indexOf("Pending Quotes") > -1; })[0];
  if (pendP && pendP.nextElementSibling) pendP.nextElementSibling.textContent = fresh.length;

  board.innerHTML =
    '<div class="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">' +
      '<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">' +
        '<div class="flex items-center gap-4">' +
          avatarHtml(guide.name, "from-teal-500 to-emerald-400", 64) +
          '<div><p class="text-xs font-semibold uppercase tracking-wide text-primary">Demo guide profile</p><h2 class="text-2xl font-bold text-slate-900">' + escapeHtml(guide.name) + '</h2><p class="text-sm text-slate-500">' + escapeHtml(guide.headline) + '</p></div>' +
        '</div>' +
        '<label class="block lg:w-80">' +
          '<span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Switch test guide</span>' +
          '<select data-byg-guide-select class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">' +
            market.guides.map(function (item) { return '<option value="' + item.id + '"' + (item.id === guide.id ? " selected" : "") + '>' + escapeHtml(item.name + " • " + titleCase(item.expertise[0])) + '</option>'; }).join("") +
          '</select>' +
        '</label>' +
      '</div>' +
      '<div class="mt-4 flex flex-wrap gap-2">' + guide.tags.map(function (tag) { return '<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>' +
    '</div>' +
    '<div class="grid gap-4 md:grid-cols-3">' + statCard("New requests", String(fresh.length), "request_quote") + statCard("Active planning", String(active.length), "event_note") + statCard("Confirmed trips", String(bookings.length), "flight_takeoff") + '</div>' +
    '<div class="grid gap-4 lg:grid-cols-3">' + pipelineCard("New Requests", fresh, guide, "new") + pipelineCard("Quoted / Planning", active, guide, "active") + bookingCardColumn("Booked Trips", bookings) + '</div>';

  board.querySelector("[data-byg-guide-select]").addEventListener("change", function (event) {
    ensureMarketplaceState().selectedGuideId = event.target.value;
    persistState();
    renderGuideDashboard(board);
  });

  if (board.dataset.actionsBound !== "true") {
    bindProviderBoardActions(board, guide);
    board.dataset.actionsBound = "true";
  }
}

function initGuideClients() {
  if (window.location.pathname.indexOf("/guide/clients") === -1) return;
  if (document.getElementById("byg-guide-live-clients")) return;

  var main = document.querySelector("main");
  if (!main) return;
  var section = document.createElement("section");
  section.id = "byg-guide-live-clients";
  section.className = "mb-10 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm";
  main.insertBefore(section, main.firstChild);
  renderGuideClients(section);
}

function renderGuideClients(section) {
  var market = ensureMarketplaceState();
  var guide = findProvider("guide", market.selectedGuideId) || market.guides[0];
  var requests = providerRequests(guide.id, "guide");
  var bookings = providerBookings(guide.id, "guide");
  var rows = requests.concat(bookings.map(function (booking) {
    return { id: booking.id, travelerName: booking.travelerName, destination: booking.destination, travelers: booking.travelers, dates: booking.dates, stage: "booked", budget: "INR " + booking.amount };
  })).slice(0, 8);

  section.innerHTML =
    '<div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">' +
      '<div><p class="text-xs font-semibold uppercase tracking-wide text-primary">Live CRM</p><h2 class="text-xl font-bold text-slate-900">Traveler requests routed to ' + escapeHtml(guide.name) + '</h2></div>' +
      '<button type="button" data-byg-guide-add class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"><span class="material-icons text-base">person_add</span> Add Manual Lead</button>' +
    '</div>' +
    '<div class="overflow-x-auto">' +
      '<table class="w-full min-w-[720px] text-left">' +
        '<thead><tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500"><th class="pb-3 pr-4">Traveler</th><th class="pb-3 pr-4">Destination</th><th class="pb-3 pr-4">Party</th><th class="pb-3 pr-4">Stage</th><th class="pb-3 pr-4">Value</th><th class="pb-3 text-right">Action</th></tr></thead>' +
        '<tbody>' +
          rows.map(function (row) {
            return '<tr class="border-b border-slate-100 text-sm text-slate-700"><td class="py-4 pr-4 font-semibold text-slate-900">' + escapeHtml(row.travelerName) + '</td><td class="py-4 pr-4">' + escapeHtml(row.destination) + '</td><td class="py-4 pr-4">' + escapeHtml(String(row.travelers || 2)) + ' travelers</td><td class="py-4 pr-4"><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">' + escapeHtml(titleCase(row.stage || "new")) + '</span></td><td class="py-4 pr-4">' + escapeHtml(row.budget || "INR 0") + '</td><td class="py-4 text-right"><button type="button" data-byg-guide-row="' + row.id + '" class="text-sm font-semibold text-primary hover:text-primary-dark">Message</button></td></tr>';
          }).join("") +
        '</tbody>' +
      '</table>' +
    '</div>';

  if (section.dataset.bound !== "true") {
    section.addEventListener("click", function (event) {
      var currentGuide = findProvider("guide", ensureMarketplaceState().selectedGuideId) || ensureMarketplaceState().guides[0];
      var addBtn = event.target.closest("[data-byg-guide-add]");
      if (addBtn) { openManualLeadComposer("guide", currentGuide); return; }
      var rowBtn = event.target.closest("[data-byg-guide-row]");
      if (rowBtn) openMessageComposer(currentGuide, "Following up on your guide request.");
    });
    section.dataset.bound = "true";
  }
}

function initAgencyDashboard() {
  if (window.location.pathname.indexOf("/agency/dashboard") === -1) return;
  if (document.getElementById("byg-agency-live-board")) return;

  var content = document.querySelector("main .flex-1.overflow-y-auto") || document.querySelector("main");
  if (!content) return;

  var section = document.createElement("section");
  section.id = "byg-agency-live-board";
  section.className = "mb-6 space-y-5";
  content.insertBefore(section, content.firstChild);
  renderAgencyDashboard(section);
}

function renderAgencyDashboard(section) {
  var market = ensureMarketplaceState();
  var agency = findProvider("agency", market.selectedAgencyId) || market.agencies[0];
  var requests = providerRequests(agency.id, "agency");
  var bookings = providerBookings(agency.id, "agency");
  var newRequests = requests.filter(function (req) { return req.stage === "new"; });
  var liveQuotes = requests.filter(function (req) { return req.stage === "quoted" || req.stage === "planning"; });
  var revenue = bookings.reduce(function (sum, booking) { return sum + (booking.amount || 0); }, 0);

  // Fix Bug 7: Update original static cards
  var revP = $$("p").filter(function(p) { return p.textContent.indexOf("Total Revenue") > -1; })[0];
  if (revP && revP.nextElementSibling) revP.nextElementSibling.textContent = "INR " + revenue.toLocaleString("en-IN");
  var tourP = $$("p").filter(function(p) { return p.textContent.indexOf("Active Tours") > -1; })[0];
  if (tourP && tourP.nextElementSibling) tourP.nextElementSibling.textContent = bookings.length;
  var pendP = $$("p").filter(function(p) { return p.textContent.indexOf("Pending Quotes") > -1; })[0];
  if (pendP && pendP.nextElementSibling) pendP.nextElementSibling.textContent = newRequests.length;

  section.innerHTML =
    '<div class="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">' +
      '<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">' +
        '<div class="flex items-center gap-4">' +
          avatarHtml(agency.name, "from-orange-500 to-amber-400", 64) +
          '<div><p class="text-xs font-semibold uppercase tracking-wide text-primary">Demo agency profile</p><h2 class="text-2xl font-bold text-slate-900">' + escapeHtml(agency.name) + '</h2><p class="text-sm text-slate-500">' + escapeHtml(agency.headline) + '</p></div>' +
        '</div>' +
        '<label class="block lg:w-80">' +
          '<span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Switch test agency</span>' +
          '<select data-byg-agency-select class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20">' +
            market.agencies.map(function (item) { return '<option value="' + item.id + '"' + (item.id === agency.id ? " selected" : "") + '>' + escapeHtml(item.name + " • " + titleCase(item.expertise[0])) + '</option>'; }).join("") +
          '</select>' +
        '</label>' +
      '</div>' +
      '<div class="mt-4 flex flex-wrap gap-2">' + agency.tags.map(function (tag) { return '<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">' + escapeHtml(tag) + '</span>'; }).join("") + '</div>' +
    '</div>' +
    '<div class="grid gap-4 md:grid-cols-4">' + statCard("Fresh inquiries", String(newRequests.length), "mark_email_unread") + statCard("Drafting quotes", String(liveQuotes.length), "description") + statCard("Upcoming departures", String(bookings.length), "flight") + statCard("Booked revenue", "INR " + revenue.toLocaleString("en-IN"), "payments") + '</div>' +
    '<div class="grid gap-4 xl:grid-cols-[1.4fr_1fr]"><div class="space-y-4">' + pipelineCard("Agency Inquiries", newRequests.concat(liveQuotes), agency, "agency") + '</div><div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Upcoming departures</p><div class="mt-4 space-y-3">' +
      (bookings.length ? bookings.map(function (booking) { return '<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p class="font-semibold text-slate-900">' + escapeHtml(booking.destination) + '</p><p class="mt-1 text-sm text-slate-500">' + escapeHtml(booking.travelerName) + ' • ' + escapeHtml(booking.dates) + '</p><p class="mt-2 text-sm font-semibold text-primary">INR ' + Number(booking.amount || 0).toLocaleString("en-IN") + '</p></div>'; }).join("") : '<p class="text-sm text-slate-500">New traveler bookings will appear here.</p>') +
    '</div></div></div>';

  section.querySelector("[data-byg-agency-select]").addEventListener("change", function (event) {
    ensureMarketplaceState().selectedAgencyId = event.target.value;
    persistState();
    renderAgencyDashboard(section);
  });

  if (section.dataset.actionsBound !== "true") {
    bindProviderBoardActions(section, agency);
    section.dataset.actionsBound = "true";
  }
}

function initAgencyParticipants() {
  if (window.location.pathname.indexOf("/agency/participants") === -1) return;
  if (document.getElementById("byg-agency-live-participants")) return;

  var main = document.querySelector("main");
  if (!main) return;

  var section = document.createElement("section");
  section.id = "byg-agency-live-participants";
  section.className = "mb-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm";
  main.insertBefore(section, main.firstChild);
  renderAgencyParticipants(section);
}

function renderAgencyParticipants(section) {
  var market = ensureMarketplaceState();
  var agency = findProvider("agency", market.selectedAgencyId) || market.agencies[0];
  var bookings = providerBookings(agency.id, "agency");

  section.innerHTML =
    '<div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">' +
      '<div><p class="text-xs font-semibold uppercase tracking-wide text-primary">Live departures</p><h2 class="text-xl font-bold text-slate-900">Bookings currently routed to ' + escapeHtml(agency.name) + '</h2></div>' +
      '<button type="button" data-byg-agency-message-all class="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"><span class="material-icons text-base">send</span> Message All</button>' +
    '</div>' +
    '<div class="overflow-x-auto">' +
      '<table class="w-full min-w-[720px] text-left">' +
        '<thead><tr class="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500"><th class="pb-3 pr-4">Traveler</th><th class="pb-3 pr-4">Departure</th><th class="pb-3 pr-4">Party</th><th class="pb-3 pr-4">Amount</th><th class="pb-3 pr-4">Status</th><th class="pb-3 text-right">Action</th></tr></thead>' +
        '<tbody>' +
          (bookings.length ? bookings.map(function (booking) {
            return '<tr class="border-b border-slate-100 text-sm text-slate-700"><td class="py-4 pr-4 font-semibold text-slate-900">' + escapeHtml(booking.travelerName) + '</td><td class="py-4 pr-4">' + escapeHtml(booking.destination) + '<div class="text-xs text-slate-400">' + escapeHtml(booking.dates) + '</div></td><td class="py-4 pr-4">' + escapeHtml(String(booking.travelers)) + '</td><td class="py-4 pr-4">INR ' + Number(booking.amount || 0).toLocaleString("en-IN") + '</td><td class="py-4 pr-4"><span class="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">Confirmed</span></td><td class="py-4 text-right"><button type="button" data-byg-agency-booking="' + booking.id + '" class="text-sm font-semibold text-primary hover:text-primary-dark">Message</button></td></tr>';
          }).join("") : '<tr><td colspan="6" class="py-6 text-center text-sm text-slate-500">Traveler bookings will appear here after checkout.</td></tr>') +
        '</tbody>' +
      '</table>' +
    '</div>';

  if (section.dataset.bound !== "true") {
    section.addEventListener("click", function (event) {
      var currentAgency = findProvider("agency", ensureMarketplaceState().selectedAgencyId) || ensureMarketplaceState().agencies[0];
      var messageAll = event.target.closest("[data-byg-agency-message-all]");
      if (messageAll) { openBroadcastComposer(currentAgency); return; }
      var bookingBtn = event.target.closest("[data-byg-agency-booking]");
      if (bookingBtn) openMessageComposer(currentAgency, "Following up on my confirmed departure.");
    });
    section.dataset.bound = "true";
  }
}

function bindProviderBoardActions(container, provider) {
  container.addEventListener("click", function (event) {
    var quoteBtn = event.target.closest("[data-byg-provider-quote]");
    if (quoteBtn) {
      var request = findRequest(quoteBtn.getAttribute("data-byg-provider-quote"));
      if (request) openQuoteComposer(provider, request);
      return;
    }

    var messageBtn = event.target.closest("[data-byg-provider-message]");
    if (messageBtn) {
      openMessageComposer(provider, "Following up on your " + (provider.type === "guide" ? "guide" : "agency") + " request.");
      return;
    }

    var bookBtn = event.target.closest("[data-byg-provider-book]");
    if (bookBtn) {
      var bookingRequest = findRequest(bookBtn.getAttribute("data-byg-provider-book"));
      if (bookingRequest) convertRequestToBooking(provider, bookingRequest);
    }
  });
}

function pipelineCard(title, requests, provider, variant) {
  return '<div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center justify-between"><p class="text-sm font-semibold text-slate-900">' + escapeHtml(title) + '</p><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">' + requests.length + '</span></div><div class="space-y-3">' +
    (requests.length ? requests.slice(0, 5).map(function (req) {
      return '<article class="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div class="flex items-start justify-between gap-3"><div><p class="font-semibold text-slate-900">' + escapeHtml(req.travelerName) + '</p><p class="text-sm text-slate-500">' + escapeHtml(req.destination) + '</p></div><span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">' + escapeHtml(titleCase(req.stage || "new")) + '</span></div><p class="mt-3 text-sm text-slate-600">' + escapeHtml(truncate(req.note || "", 90)) + '</p><div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>' + escapeHtml(req.dates || "Flexible dates") + '</span><span>•</span><span>' + escapeHtml(String(req.travelers || 2)) + ' travelers</span><span>•</span><span>' + escapeHtml(req.budget || "Budget TBD") + '</span></div><div class="mt-4 flex gap-2"><button type="button" data-byg-provider-message="' + req.id + '" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">Message</button>' + (variant === "new" || variant === "agency" ? '<button type="button" data-byg-provider-quote="' + req.id + '" class="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">Send Quote</button>' : '<button type="button" data-byg-provider-book="' + req.id + '" class="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">Mark Booked</button>') + '</div></article>';
    }).join("") : '<p class="text-sm text-slate-500">No live requests yet for this provider.</p>') +
  '</div></div>';
}

function bookingCardColumn(title, bookings) {
  return '<div class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div class="mb-4 flex items-center justify-between"><p class="text-sm font-semibold text-slate-900">' + escapeHtml(title) + '</p><span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">' + bookings.length + '</span></div><div class="space-y-3">' +
    (bookings.length ? bookings.slice(0, 5).map(function (booking) {
      return '<article class="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p class="font-semibold text-slate-900">' + escapeHtml(booking.travelerName) + '</p><p class="mt-1 text-sm text-slate-500">' + escapeHtml(booking.destination) + '</p><div class="mt-3 flex items-center justify-between text-sm"><span class="text-slate-500">' + escapeHtml(booking.dates) + '</span><span class="font-semibold text-primary">INR ' + Number(booking.amount || 0).toLocaleString("en-IN") + '</span></div></article>';
    }).join("") : '<p class="text-sm text-slate-500">Confirmed trips will appear here.</p>') +
  '</div></div>';
}

function statCard(label, value, icon) {
  return '<div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div class="flex items-center justify-between gap-3"><div><p class="text-xs font-semibold uppercase tracking-wide text-slate-400">' + escapeHtml(label) + '</p><p class="mt-1 text-2xl font-bold text-slate-900">' + escapeHtml(value) + '</p></div><div class="rounded-xl bg-orange-50 p-3 text-orange-500"><span class="material-icons">' + icon + '</span></div></div></div>';
}

function openProviderProfile(provider, query) {
  var openModal = window.BYGPlatformExperience && window.BYGPlatformExperience.openModal;
  if (!openModal) return;

  openModal({
    title: provider.name,
    description: provider.bio,
    customHtml: '<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#0f766e;margin:0 0 8px">Based in Pune</p><p style="font-size:14px;color:#334155;line-height:1.6;margin:0 0 10px">' + escapeHtml(provider.headline) + '</p><p style="font-size:13px;color:#64748b;line-height:1.6;margin:0">Top match for "' + escapeHtml(query || provider.featuredDestination) + '" because this provider already works across ' + escapeHtml(provider.destinations.join(", ")) + '.</p></div>',
    confirmLabel: "Open Details",
    secondaryLabel: "Message",
    onConfirm: function () {
      setActiveListing(provider, query || provider.featuredDestination);
      navigate("tour");
    },
    onSecondary: function () {
      openMessageComposer(provider, "I want to know more about your " + provider.featuredTitle + " trip.");
    }
  });
}

function openRequestComposer(provider, destination) {
  var openModal = window.BYGPlatformExperience && window.BYGPlatformExperience.openModal;
  if (!openModal) return;

  openModal({
    title: "Request plan from " + provider.name,
    description: "This creates a live request in the traveler inbox and the selected provider dashboard.",
    fields: [
      { name: "destination", label: "Destination", value: destination || provider.featuredDestination, placeholder: "Where do you want to go?" },
      { name: "dates", label: "Dates", type: "date" },
      { name: "travelers", label: "Travelers", type: "number", value: "2", min: 1 },
      { name: "budget", label: "Budget", placeholder: "e.g. INR 60k or Flexible" },
      { name: "message", label: "Trip brief", type: "textarea", placeholder: "Tell them the style of trip you want..." }
    ],
    confirmLabel: "Send Request",
    onConfirm: function (values) {
      createRequest(provider, values);
      navigate("notifications");
    }
  });
}

function openMessageComposer(provider, seedText) {
  var openModal = window.BYGPlatformExperience && window.BYGPlatformExperience.openModal;
  if (!openModal) return;

  openModal({
    title: "Message " + provider.name,
    description: "Messages appear in the traveler inbox and the provider-side boards.",
    fields: [{ name: "message", label: "Message", type: "textarea", value: seedText || "", placeholder: "Type your message..." }],
    confirmLabel: "Send",
    onConfirm: function (values) {
      createMessage(provider, values.message);
      navigate("notifications");
    }
  });
}

function openQuoteComposer(provider, request) {
  var openModal = window.BYGPlatformExperience && window.BYGPlatformExperience.openModal;
  if (!openModal) return;

  openModal({
    title: "Send quote to " + request.travelerName,
    description: "This updates the traveler-facing request and keeps the provider pipeline moving.",
    fields: [
      { name: "price", label: "Quote value", placeholder: "e.g. INR 48k" },
      { name: "note", label: "What is included", type: "textarea", placeholder: "Hotels, local transport, guide hours..." }
    ],
    confirmLabel: "Send Quote",
    onConfirm: function (values) {
      request.stage = "quoted";
      request.budget = values.price || request.budget || "INR TBD";
      request.note = values.note || request.note;
      persistState();
      pushAppNotification({ category: "Quote", title: provider.name + " sent a quote", body: request.destination + " • " + (request.budget || "Budget shared"), ctaLabel: "View inbox", route: route("notifications") });
      rerenderCurrentBoard();
    }
  });
}

function openManualLeadComposer(providerType, provider) {
  var openModal = window.BYGPlatformExperience && window.BYGPlatformExperience.openModal;
  if (!openModal) return;

  openModal({
    title: "Add manual lead for " + provider.name,
    fields: [
      { name: "name", label: "Traveler name", placeholder: "Full name" },
      { name: "destination", label: "Destination", placeholder: provider.featuredDestination },
      { name: "travelers", label: "Travelers", type: "number", value: "2", min: 1 },
      { name: "message", label: "Brief", type: "textarea", placeholder: "Trip context..." }
    ],
    confirmLabel: "Add lead",
    onConfirm: function (values) {
      if (!values.name) return;
      ensureMarketplaceState().requests.unshift({ id: "req-" + Date.now(), providerId: provider.id, providerType: providerType, travelerName: values.name, destination: values.destination || provider.featuredDestination, travelers: parseInt(values.travelers, 10) || 2, dates: "Flexible", note: values.message || "Manual lead added from provider dashboard.", stage: "new", budget: "TBD", createdAt: new Date().toISOString() });
      persistState();
      rerenderCurrentBoard();
    }
  });
}

function openBroadcastComposer(provider) {
  var openModal = window.BYGPlatformExperience && window.BYGPlatformExperience.openModal;
  if (!openModal) return;

  openModal({
    title: "Message all travelers for " + provider.name,
    fields: [{ name: "message", label: "Update", type: "textarea", placeholder: "Departure note, packing list, meeting point..." }],
    confirmLabel: "Send update",
    onConfirm: function (values) {
      if (!values.message) return;
      pushAppNotification({ category: "Message", title: provider.name + " sent a departure update", body: truncate(values.message, 90), ctaLabel: "View inbox", route: route("notifications") });
    }
  });
}

function createRequest(provider, values) {
  var market = ensureMarketplaceState();
  var request = { id: "req-" + Date.now(), providerId: provider.id, providerType: provider.type, travelerName: market.traveler.name, destination: values.destination || provider.featuredDestination, travelers: parseInt(values.travelers, 10) || 2, dates: values.dates || "Flexible", note: values.message || "Trip brief shared from Explore.", stage: "new", budget: values.budget || "Flexible", createdAt: new Date().toISOString() };
  market.requests.unshift(request);
  market.activeListing = listingFromProvider(provider, request.destination);
  persistState();
  pushAppNotification({ category: "Quote", title: "Request sent to " + provider.name, body: request.destination + " • " + request.travelers + " travelers", ctaLabel: "View inbox", route: route("notifications") });
}

function createMessage(provider, message) {
  if (!message) return;
  var market = ensureMarketplaceState();
  market.messages.unshift({ id: "msg-" + Date.now(), providerId: provider.id, providerType: provider.type, travelerName: market.traveler.name, message: message, createdAt: new Date().toISOString() });
  persistState();
  pushAppNotification({ category: "Message", title: "Message sent to " + provider.name, body: truncate(message, 80), ctaLabel: "Open inbox", route: route("notifications") });
}

function convertRequestToBooking(provider, request) {
  var market = ensureMarketplaceState();
  request.stage = "booked";
  market.bookings.unshift({ id: "book-" + Date.now(), providerId: provider.id, providerType: provider.type, travelerName: request.travelerName, destination: request.destination, travelers: request.travelers, dates: request.dates, amount: parseInt(String(request.budget || provider.priceFrom).replace(/\D/g, ""), 10) || provider.priceFrom, status: "confirmed", createdAt: new Date().toISOString(), reference: "BKG-" + Math.floor(10000 + Math.random() * 89999) });
  persistState();
  pushAppNotification({ category: "System", title: request.destination + " is now booked", body: provider.name + " moved this traveler into a confirmed trip.", ctaLabel: "View inbox", route: route("notifications") });
  rerenderCurrentBoard();
}

function setActiveListing(provider, searchQuery) {
  ensureMarketplaceState().activeListing = listingFromProvider(provider, searchQuery);
  persistState();
}

function listingFromProvider(provider, searchQuery) {
  return { providerId: provider.id, providerType: provider.type, title: provider.featuredTitle, destination: provider.featuredDestination, duration: provider.featuredDuration, summary: provider.featuredSummary, priceFrom: provider.priceFrom, searchQuery: searchQuery || provider.featuredDestination };
}

function searchProviders(query, providerType, selectedExpertise, mood) {
  var market = ensureMarketplaceState();
  var providers = market.guides.concat(market.agencies).filter(function (provider) {
    return providerType === "all" || provider.type === providerType;
  });
  var inferred = inferExpertise(query, selectedExpertise, mood);
  var tokens = tokenize(query);

  return providers.map(function (provider) {
    var score = 62;
    var reason = [];
    var expertiseMatches = intersection(provider.expertise, inferred);
    var destinationMatches = provider.destinations.filter(function (destination) {
      return tokens.some(function (token) { return destination.toLowerCase().indexOf(token) > -1; });
    });

    score += expertiseMatches.length * 12;
    score += destinationMatches.length * 8;
    if (!tokens.length && provider.rating >= 4.8) score += 8;
    if (selectedExpertise && selectedExpertise !== "all" && provider.expertise.indexOf(selectedExpertise) > -1) score += 15;
    if ((query || "").toLowerCase().indexOf("pune") > -1) score += 6;
    if ((query || "").toLowerCase().indexOf(provider.featuredDestination.toLowerCase()) > -1) score += 10;
    if (provider.type === "guide") score += 2;

    expertiseMatches.forEach(function (match) { reason.push(titleCase(match) + " expertise"); });
    destinationMatches.forEach(function (match) { reason.push(match + " experience"); });
    if (!reason.length) reason.push("Pune-based planning support");

    return { provider: provider, score: Math.max(74, Math.min(99, score)), reason: reason.slice(0, 2).join(" + ") };
  }).sort(function (a, b) { return b.score - a.score; });
}

function inferExpertise(query, selectedExpertise, mood) {
  var matches = [];
  var tokens = tokenize(query);

  DESTINATION_CUES.forEach(function (cue) {
    var matched = !tokens.length ? false : cue.tags.some(function (tag) {
      return tokens.indexOf(tag) > -1 || (query || "").toLowerCase().indexOf(tag) > -1;
    });
    if (matched) matches = matches.concat(cue.expertise);
  });

  if (selectedExpertise && selectedExpertise !== "all") matches.push(selectedExpertise);
  if (mood && MOOD_EXPERTISE[mood.toLowerCase()]) matches = matches.concat(MOOD_EXPERTISE[mood.toLowerCase()]);

  return unique(matches.length ? matches : ["cultural", "urban"]);
}

function providerRequests(providerId, providerType) {
  return ensureMarketplaceState().requests.filter(function (request) {
    return request.providerId === providerId && request.providerType === providerType && request.stage !== "booked";
  }).sort(byNewest);
}

function providerBookings(providerId, providerType) {
  return ensureMarketplaceState().bookings.filter(function (booking) {
    return booking.providerId === providerId && booking.providerType === providerType;
  }).sort(byNewest);
}

function rerenderCurrentBoard() {
  var guideBoard = document.getElementById("byg-guide-live-board");
  if (guideBoard) renderGuideDashboard(guideBoard);
  var guideClients = document.getElementById("byg-guide-live-clients");
  if (guideClients) renderGuideClients(guideClients);
  var agencyBoard = document.getElementById("byg-agency-live-board");
  if (agencyBoard) renderAgencyDashboard(agencyBoard);
  var agencyParticipants = document.getElementById("byg-agency-live-participants");
  if (agencyParticipants) renderAgencyParticipants(agencyParticipants);
  var inbox = document.getElementById("byg-live-inbox");
  if (inbox) renderNotifications(inbox);
}

function findProvider(type, id) {
  if (!id) return null;
  var list = type === "guide" ? ensureMarketplaceState().guides : ensureMarketplaceState().agencies;
  return list.filter(function (item) { return item.id === id; })[0] || null;
}

function findRequest(id) {
  return ensureMarketplaceState().requests.filter(function (req) { return req.id === id; })[0] || null;
}

function findBookingByReference(reference) {
  return ensureMarketplaceState().bookings.filter(function (booking) { return booking.reference === reference; })[0] || null;
}

function providerName(type, id) {
  var provider = findProvider(type, id);
  return provider ? provider.name : "Provider";
}

function getSelectedMood() {
  return window.BYG && window.BYG.appState && window.BYG.appState.vibe ? window.BYG.appState.vibe.selectedMood || "Neon Nights" : "Neon Nights";
}

function persistMarketplaceData() {
  if (window.BYG && window.BYG.db && window.location.protocol !== "file:") {
    var market = window.BYG.appState.marketplace;
    if (!market) return;
    var sharedData = {
      requests: market.requests,
      bookings: market.bookings,
      messages: market.messages
    };
    window.BYG.db.setDoc(
      window.BYG.db.doc(window.BYG.db.instance, "global", "marketplace_v2"),
      sharedData,
      { merge: true }
    ).catch(function () {});
  }
}

function persistState() {
  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(window.BYG.appState));
  } catch (error) {}

  persistMarketplaceData();

  if (window.BYG && window.BYG.db && window.BYG.user && window.location.protocol !== "file:") {
    window.BYG.db.setDoc(
      window.BYG.db.doc(window.BYG.db.instance, "users", window.BYG.user.uid, "appState", "platform"),
      window.BYG.appState,
      { merge: true }
    ).catch(function () {});
  }
}

function pushAppNotification(payload) {
  if (window.BYGPlatformExperience && typeof window.BYGPlatformExperience.pushNotification === "function") {
    window.BYGPlatformExperience.pushNotification(payload);
    return;
  }

  window.BYG.appState.notifications = window.BYG.appState.notifications || [];
  payload.id = "notif-" + Date.now();
  payload.createdAt = new Date().toISOString();
  payload.unread = true;
  window.BYG.appState.notifications.unshift(payload);
  persistState();
}

function navigate(routeKey) {
  if (window.BYGPlatformExperience && typeof window.BYGPlatformExperience.navigate === "function") {
    window.BYGPlatformExperience.navigate(routeKey);
  } else {
    window.location.href = route(routeKey);
  }
}

function route(key) {
  return (ctx.basePath || "./") + (ROUTES[key] || ROUTES.travelerDashboard);
}

function byNewest(a, b) {
  return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
}

function tokenize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function intersection(left, right) {
  return left.filter(function (item) { return right.indexOf(item) > -1; });
}

function unique(list) {
  return list.filter(function (item, index) { return list.indexOf(item) === index; });
}

function avatarHtml(name, gradient, size) {
  var initials = name.split(/\s+/).slice(0, 2).map(function (part) { return part.charAt(0).toUpperCase(); }).join("");
  return '<div class="flex items-center justify-center rounded-2xl bg-gradient-to-br ' + gradient + ' text-sm font-bold text-white" style="width:' + size + 'px;height:' + size + 'px;">' + initials + '</div>';
}

function formatCurrency(amount, providerType) {
  return providerType === "guide" ? "INR " + Number(amount).toLocaleString("en-IN") + " / day" : "INR " + Number(amount).toLocaleString("en-IN") + " / trip";
}

function emailToName(email) {
  if (!email) return "";
  return email.split("@")[0].split(/[._-]/).map(titleCase).join(" ");
}

function titleCase(value) {
  return String(value || "").replace(/\b\w/g, function (char) { return char.toUpperCase(); });
}

function truncate(value, size) {
  var text = String(value || "");
  return text.length > size ? text.slice(0, size - 1) + "..." : text;
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeObjects(base, extra) {
  var output = {};
  Object.keys(base || {}).forEach(function (key) { output[key] = base[key]; });
  Object.keys(extra || {}).forEach(function (key) { output[key] = extra[key]; });
  return output;
}

function $$(selector, root) {
  return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function initGuideProfileBuilder() {
  if (window.location.pathname.indexOf("/guide/profile-builder") === -1) return;

  var saveCont = $$("button").filter(function(b) { return /save & continue/i.test(b.textContent || ""); })[0];
  var saveDraft = $$("button").filter(function(b) { return /save draft/i.test(b.textContent || ""); })[0];

  if (saveCont) {
    saveCont.addEventListener("click", function(e) {
      e.preventDefault();
      var dn = document.getElementById("display-name");
      var tl = document.getElementById("tagline");
      var bio = document.getElementById("bio");
      
      window.BYG.appState.guideProfile = {
        name: dn ? dn.value : "",
        tagline: tl ? tl.value : "",
        bio: bio ? bio.value : "",
        updatedAt: new Date().toISOString()
      };
      
      try {
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(window.BYG.appState));
        if (window.BYGPlatformExperience && window.BYGPlatformExperience.queueSync) {
            window.BYGPlatformExperience.queueSync();
        }
      } catch(ex) {}
      
      if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
        window.BYGPlatformExperience.toast("Profile saved to Firestore!", "success");
      }
      setTimeout(function() { navigate("guideDashboard"); }, 800);
    });
  }
}

function initGuideAvailability() {
  if (window.location.pathname.indexOf("/guide/availability") === -1) return;

  var saveBtn = $$("button").filter(function(b) { return (b.textContent || "").toLowerCase().indexOf("save changes") > -1; })[0];
  if (!saveBtn) return;

  saveBtn.addEventListener("click", function(e) {
    e.preventDefault();
    
    var weekendOff = document.getElementById("weekend-off");
    
    window.BYG.appState.guideAvailabilitySettings = {
      weekendOff: weekendOff ? weekendOff.checked : false,
      updatedAt: new Date().toISOString()
    };
    
    try {
      localStorage.setItem(APP_STATE_KEY, JSON.stringify(window.BYG.appState));
      if (window.BYGPlatformExperience && window.BYGPlatformExperience.queueSync) {
          window.BYGPlatformExperience.queueSync();
      }
    } catch(ex) {}
    
    if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
      window.BYGPlatformExperience.toast("Calendar settings synced to Firestore!", "success");
    }
  });
}

function initPayoutSetup() {
  if (window.location.pathname.indexOf("/shared/payout-setup") === -1) return;

  var connectBtn = $$("button").filter(function(b) { 
    return (b.textContent || "").toLowerCase().indexOf("stripe") > -1; 
  })[0];
  
  if (!connectBtn) return;

  connectBtn.addEventListener("click", function(e) {
    e.preventDefault();
    connectBtn.innerHTML = '<span class="material-icons animate-spin">autorenew</span> Connecting...';
    
    setTimeout(function() {
      window.BYG.appState.stripeConnected = true;
      persistState();
      
      if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
        window.BYGPlatformExperience.toast("Stripe account connected successfully!", "success");
      }
      
      navigate("paymentStatus");
    }, 1500);
  });
}

function initAgencyTourBuilder() {
  if (window.location.pathname.indexOf("/agency/tour-builder") === -1) return;

  if (typeof Sortable === "undefined") {
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js";
    script.onload = bindTourBuilderDragDrop;
    document.head.appendChild(script);
  } else {
    bindTourBuilderDragDrop();
  }

  $$("button").forEach(function(btn) {
    var text = (btn.textContent || "").toLowerCase();
    if (text.indexOf("publish to marketplace") > -1 || text.indexOf("save draft") > -1) {
      btn.addEventListener("click", function(e) {
        e.preventDefault();
        
        var isPublish = text.indexOf("publish") > -1;
        if (isPublish) {
            btn.innerHTML = '<span class="material-icons text-sm animate-spin">autorenew</span> Publishing...';
        } else {
            btn.innerHTML = 'Saving...';
        }
        
        setTimeout(function() {
          window.BYG.appState.agencyTourBuilderLastSaved = new Date().toISOString();
          persistState();
          
          if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
            window.BYGPlatformExperience.toast(isPublish ? "Tour published to marketplace!" : "Draft saved tracking changes.", "success");
          }
          setTimeout(function() { navigate("agencyDashboard"); }, 1000);
        }, 1200);
      });
    }
  });
}

function bindTourBuilderDragDrop() {
  var activities = document.getElementById("byg-agency-activities");
  var day1 = document.getElementById("byg-agency-timeline-day1");
  var day2 = document.getElementById("byg-agency-timeline-day2");

  if (!activities || typeof Sortable === "undefined") return;

  var opts = {
    group: "shared",
    animation: 150,
    ghostClass: "opacity-50",
    dragClass: "shadow-xl"
  };

  new Sortable(activities, mergeObjects(opts, { sort: false }));
  if (day1) new Sortable(day1, opts);
  if (day2) new Sortable(day2, opts);
}

function initAgencyTeam() {
  if (window.location.pathname.indexOf("/agency/team") === -1) return;

  var openBtn = document.getElementById("btn-open-invite");
  var modal = document.getElementById("byg-invite-modal");
  var sendBtn = document.getElementById("btn-send-invite");

  if (openBtn && modal) {
    openBtn.addEventListener("click", function(e) {
      e.preventDefault();
      modal.style.display = "flex";
    });
  }

  if (sendBtn && modal) {
    sendBtn.addEventListener("click", function(e) {
      e.preventDefault();
      
      var emailEl = document.getElementById("invite-email");
      var roleEl = document.getElementById("invite-role");
      
      var email = emailEl ? emailEl.value : "";
      
      if (!email) {
          if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
              window.BYGPlatformExperience.toast("Please enter an email address.", "error");
          }
          return;
      }
      
      sendBtn.innerHTML = '<span class="material-icons text-sm animate-spin">autorenew</span> Sending...';
      sendBtn.disabled = true;
      
      setTimeout(function() {
          sendBtn.innerHTML = 'Send Invite';
          sendBtn.disabled = false;
          modal.style.display = "none";
          if (emailEl) emailEl.value = "";
          
          if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
              window.BYGPlatformExperience.toast("Invite sent to " + email, "success");
          }
      }, 1000);
    });
  }
}

function initGavel() {
  if (window.location.pathname.indexOf("/traveler/gavel") === -1) return;

  // Track votes across the items
  if (!window.BYG.appState.gavelVotes) {
      window.BYG.appState.gavelVotes = {
          item1: 4,
          item2: 2,
          item3: 1
      };
      persistState();
  }

  // Find the voting blocks
  var cards = document.querySelectorAll("main > div > div[class*='bg-white']");
  if (cards.length < 3) return;

  var items = [
      { card: cards[0], id: "item1" },
      { card: cards[1], id: "item2" },
      { card: cards[2], id: "item3" }
  ];

  function renderVotes() {
      items.forEach(function(item) {
          var votes = window.BYG.appState.gavelVotes[item.id] || 0;
          var totalGroup = 5;
          var percent = Math.round((votes / totalGroup) * 100);
          
          var percentEl = item.card.querySelector("span[class*='text-2xl']");
          if (percentEl) percentEl.innerText = percent + "%";
          
          var progressFill = item.card.querySelector("div[class*='transition-all']");
          if (progressFill) {
              progressFill.style.width = percent + "%";
              var voteCountEl = progressFill.querySelector("span");
              if (voteCountEl) {
                  voteCountEl.innerText = votes + (votes === 1 ? " Vote" : " Votes");
              }
          }
      });
  }

  // initial render
  renderVotes();

  items.forEach(function(item) {
      var btns = item.card.querySelectorAll("button");
      if (btns.length >= 2) {
          var btnYes = btns[0];
          var btnNo = btns[1];
          
          btnYes.addEventListener("click", function(e) {
              e.preventDefault();
              var current = window.BYG.appState.gavelVotes[item.id] || 0;
              if (current < 5) {
                  window.BYG.appState.gavelVotes[item.id] = current + 1;
                  persistState();
                  renderVotes();
              }
          });
          
          btnNo.addEventListener("click", function(e) {
              e.preventDefault();
              var current = window.BYG.appState.gavelVotes[item.id] || 0;
              if (current > 0) {
                  window.BYG.appState.gavelVotes[item.id] = current - 1;
                  persistState();
                  renderVotes();
              }
          });
      }
  });

  // Listen for external storage changes to update votes
  window.addEventListener("storage", function(e) {
    if (e.key === "byg_marketplace_v2") {
        renderVotes();
    }
  });
}

/* ─────────────────────────────────────────────────────────────
   Phase 5 - Social + AI Features
   ───────────────────────────────────────────────────────────── */

function initNotifications() {
  if (window.location.pathname.indexOf('/traveler/notifications') === -1) return;

  // Mark all as read
  var markAllBtn = document.querySelector('button, a');
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var txt = (btn.textContent || '').toLowerCase();
    if (txt.indexOf('mark all') > -1 || txt.indexOf('mark all as read') > -1) {
      e.preventDefault();
      var dots = document.querySelectorAll('.rounded-full.bg-primary[class*="ring"]');
      dots.forEach(function(d) { d.style.display = 'none'; });
      // Also dim all unread cards
      var cards = document.querySelectorAll('.border-l-4');
      cards.forEach(function(c) {
        c.classList.add('opacity-75');
      });
      if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
        window.BYGPlatformExperience.toast('All notifications marked as read', 'success');
      }
      // Persist to state
      window.BYG.appState.notificationsRead = true;
      persistState();
    }
  });

  // Individual card click → mark single as read
  var notifCards = document.querySelectorAll('.border-l-4, [class*="border-l-red"], [class*="border-l-primary"], [class*="border-l-blue"]');
  notifCards.forEach(function(card) {
    card.addEventListener('click', function() {
      var dot = card.querySelector('.rounded-full.bg-primary');
      if (dot) dot.style.display = 'none';
      card.classList.remove('border-l-4');
    });
  });
}

function initWeatherSwap() {
  if (window.location.pathname.indexOf('/traveler/weather-swap') === -1) return;

  // "Ignore Warning" closes modal
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    var txt = (btn.textContent || '').toLowerCase();

    if (txt.indexOf('ignore warning') > -1) {
      e.preventDefault();
      // Slide out the modal
      var modal = document.querySelector('main');
      if (modal) {
        modal.style.transition = 'opacity 0.4s';
        modal.style.opacity = '0';
        setTimeout(function() {
          window.history.back();
        }, 400);
      }
    }

    if (txt.indexOf('swap now') > -1) {
      e.preventDefault();
      var row = btn.closest('[class*="bg-surface-dark"]');
      var name = row ? (row.querySelector('h4') || {}).innerText : 'Activity';
      
      btn.innerHTML = '<span class="material-icons text-sm animate-spin">autorenew</span>';
      
      setTimeout(function() {
        btn.innerHTML = '<span class="material-icons text-sm">check_circle</span> Swapped!';
        btn.classList.remove('bg-primary', 'bg-surface-darker', 'border-slate-600');
        btn.classList.add('bg-green-600', 'border-green-600', 'text-white');
        btn.disabled = true;

        // Persist swap to app state
        if (!window.BYG.appState.weatherSwaps) window.BYG.appState.weatherSwaps = [];
        window.BYG.appState.weatherSwaps.push({
          original: 'Eiffel Tower Visit',
          replacement: name,
          swappedAt: new Date().toISOString()
        });
        persistState();

        if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
          window.BYGPlatformExperience.toast((name || 'Activity') + ' added to your itinerary!', 'success');
        }
      }, 800);
    }
  });
}

function initVibeSearch() {
  if (window.location.pathname.indexOf('/traveler/vibe-search') === -1) return;

  // Find the search input and button
  var searchInput = document.querySelector('input[type="text"], input[placeholder*="vibe"], input[placeholder*="search"], textarea');
  var searchBtn = document.querySelector('button[type="submit"], button');

  if (!searchInput) return;

  // Show typing animation suggestions
  var vibeHints = [
    'Misty mountain trails in monsoon season...',
    'Rooftop sunsets and street food in Southeast Asia...',
    'Ancient temples surrounded by jungle...',
    'Peaceful backwaters and houseboat stays...',
    'Wildlife safaris and stargazing camps...'
  ];
  var hintIdx = 0;
  
  if (!searchInput.value && searchInput.placeholder) {
    var cycleHints = setInterval(function() {
      hintIdx = (hintIdx + 1) % vibeHints.length;
      searchInput.placeholder = vibeHints[hintIdx];
    }, 3000);
    
    searchInput.addEventListener('focus', function() {
      clearInterval(cycleHints);
    });
  }

  // Wire up search submission
  function handleVibeSearch(e) {
    if (e) e.preventDefault();
    var query = searchInput.value;
    if (!query) return;

    // Show loading state
    var resultsContainer = document.querySelector('[id*="results"], [class*="result"], main > div:last-child');
    
    if (searchBtn) {
      searchBtn.innerHTML = '<span class="material-icons animate-spin text-sm">autorenew</span> Searching...';
      searchBtn.disabled = true;
    }

    // Call Gemini if available, otherwise simulate
    var promptText = 'For a traveler with this vibe: "' + query + '", suggest 3 unique Indian destinations with a 1-line description each. Reply as JSON array: [{name, emoji, tagline, match_percent}]';
    
    callGemini(promptText).then(function(resp) {
      var suggestions;
      try {
        var cleaned = resp.replace(/```json/g, '').replace(/```/g, '').trim();
        suggestions = JSON.parse(cleaned);
      } catch (err) {
        suggestions = [
          { name: 'Coorg, Karnataka', emoji: '🌿', tagline: 'Misty coffee estates and waterfalls', match_percent: 94 },
          { name: 'Spiti Valley, HP', emoji: '🏔️', tagline: 'High-altitude desert beauty', match_percent: 88 },
          { name: 'Hampi, Karnataka', emoji: '🛕', tagline: 'Ancient Vijayanagara ruins', match_percent: 82 }
        ];
      }
      renderVibeResults(suggestions, resultsContainer);
      if (searchBtn) { searchBtn.innerHTML = 'Search Vibes'; searchBtn.disabled = false; }
    }).catch(function() {
      var fallback = [
        { name: 'Coorg, Karnataka', emoji: '🌿', tagline: 'Misty coffee estates and waterfalls', match_percent: 94 },
        { name: 'Spiti Valley, HP', emoji: '🏔️', tagline: 'High-altitude desert beauty', match_percent: 88 },
        { name: 'Hampi, Karnataka', emoji: '🛕', tagline: 'Ancient Vijayanagara ruins', match_percent: 82 }
      ];
      renderVibeResults(fallback, resultsContainer);
      if (searchBtn) { searchBtn.innerHTML = 'Search Vibes'; searchBtn.disabled = false; }
    });
  }

  if (searchBtn) searchBtn.addEventListener('click', handleVibeSearch);
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleVibeSearch(e);
  });
}

function renderVibeResults(suggestions, container) {
  if (!container) return;
  var html = '<div class="mt-8 space-y-4">';
  html += '<h3 class="text-lg font-bold text-slate-900 dark:text-white">AI Vibe Matches</h3>';
  suggestions.forEach(function(s) {
    var pct = s.match_percent || 90;
    html += '<div class="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">';
    html += '<div class="flex items-center gap-4">';
    html += '<span class="text-3xl">' + (s.emoji || '📍') + '</span>';
    html += '<div><h4 class="font-semibold text-slate-900 dark:text-white">' + s.name + '</h4>';
    html += '<p class="text-sm text-slate-500">' + s.tagline + '</p></div>';
    html += '</div>';
    html += '<div class="flex flex-col items-end gap-2">';
    html += '<span class="text-sm font-bold text-primary">' + pct + '% match</span>';
    html += '<a href="../../pages/traveler/tour-detail.html" class="text-xs px-3 py-1 bg-primary text-white rounded-full hover:bg-teal-600 transition-colors">Explore</a>';
    html += '</div></div>';
  });
  html += '</div>';
  container.insertAdjacentHTML('beforeend', html);
}

function initPastTrips() {
  if (window.location.pathname.indexOf('/traveler/past-trips') === -1) return;

  // Wire review/write-review buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('button, a');
    if (!btn) return;
    var txt = (btn.textContent || '').toLowerCase();
    
    if (txt.indexOf('write a review') > -1 || txt.indexOf('leave review') > -1 || txt.indexOf('add review') > -1) {
      e.preventDefault();
      showReviewModal();
    }
  });
}

function showReviewModal() {
  if (document.getElementById('byg-review-modal')) {
    document.getElementById('byg-review-modal').style.display = 'flex';
    return;
  }
  
  var modal = document.createElement('div');
  modal.id = 'byg-review-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);';
  modal.innerHTML = '\
    <div style="background:white;border-radius:20px;padding:32px;max-width:480px;width:90%;box-shadow:0 25px 60px rgba(0,0,0,0.2);">\
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">\
        <h3 style="font-size:20px;font-weight:700;color:#1F2937">Write a Review</h3>\
        <button onclick="document.getElementById(\'byg-review-modal\').style.display=\'none\'" style="border:none;background:none;cursor:pointer;font-size:20px;color:#9CA3AF">✕</button>\
      </div>\
      <div style="margin-bottom:16px">\
        <p style="font-size:13px;color:#6B7280;margin-bottom:8px">Rating</p>\
        <div id="byg-star-rating" style="display:flex;gap:6px;cursor:pointer">\
          <span data-star="1" style="font-size:28px;color:#D1D5DB">★</span>\
          <span data-star="2" style="font-size:28px;color:#D1D5DB">★</span>\
          <span data-star="3" style="font-size:28px;color:#D1D5DB">★</span>\
          <span data-star="4" style="font-size:28px;color:#D1D5DB">★</span>\
          <span data-star="5" style="font-size:28px;color:#D1D5DB">★</span>\
        </div>\
      </div>\
      <div style="margin-bottom:20px">\
        <p style="font-size:13px;color:#6B7280;margin-bottom:8px">Your experience</p>\
        <textarea id="byg-review-text" rows="4" placeholder="Share what made this trip special..." style="width:100%;border:1px solid #E5E7EB;border-radius:10px;padding:12px;font-size:14px;resize:none;box-sizing:border-box"></textarea>\
      </div>\
      <button id="byg-submit-review" style="width:100%;padding:12px;background:#14B8A6;color:white;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer">Submit Review</button>\
    </div>';
  document.body.appendChild(modal);

  var stars = modal.querySelectorAll('[data-star]');
  var selectedRating = 0;
  stars.forEach(function(star) {
    star.addEventListener('mouseenter', function() {
      var n = parseInt(star.getAttribute('data-star'));
      stars.forEach(function(s, i) { s.style.color = i < n ? '#F97316' : '#D1D5DB'; });
    });
    star.addEventListener('click', function() {
      selectedRating = parseInt(star.getAttribute('data-star'));
    });
  });
  modal.querySelector('#byg-star-rating').addEventListener('mouseleave', function() {
    stars.forEach(function(s, i) { s.style.color = i < selectedRating ? '#F97316' : '#D1D5DB'; });
  });

  modal.querySelector('#byg-submit-review').addEventListener('click', function() {
    var text = (modal.querySelector('#byg-review-text') || {}).value || '';
    if (!selectedRating) {
      alert('Please select a rating');
      return;
    }
    
    var reviewData = {
      rating: selectedRating,
      text: text,
      createdAt: new Date().toISOString(),
      userId: (window.BYG && window.BYG.user) ? window.BYG.user.uid : 'anonymous'
    };

    if (!window.BYG.appState.pastTripReviews) window.BYG.appState.pastTripReviews = [];
    window.BYG.appState.pastTripReviews.push(reviewData);
    persistState();

    // Save to Firestore if available 
    if (window.BYGFirestore && window.BYG && window.BYG.user) {
      try {
        window.BYGFirestore.collection('reviews').add(reviewData);
      } catch(e) {}
    }

    modal.style.display = 'none';
    if (window.BYGPlatformExperience && window.BYGPlatformExperience.toast) {
      window.BYGPlatformExperience.toast('Review submitted! Thank you 🙏', 'success');
    }
  });
  
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
  });
}

window.BYGMarketplaceMVP = {
  init: init, };

})();
