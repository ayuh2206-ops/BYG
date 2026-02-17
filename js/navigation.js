// ═══════════════════════════════════════════════════════════════
// BeforeYouGo – Navigation System v3 (Production)
// ═══════════════════════════════════════════════════════════════
// • Injects a consistent topbar into EVERY authenticated page
// • Role-based navigation (Traveler / Guide / Agency)
// • Fixes every remaining href="#" dead link
// • Consistent mobile bottom-nav
// • Role switcher dropdown
// • Sidebar repair for agency pages
// ═══════════════════════════════════════════════════════════════

(function () {
  "use strict";

  var PATH = window.location.pathname;

  // ── base path helper ──
  function base() {
    if (PATH === "/" || PATH.endsWith("/index.html") || /\/beforeyougo\/?$/.test(PATH)) return "./";
    var m = PATH.match(/\/pages\//);
    if (m) {
      var after = PATH.split("/pages/")[1];
      var depth = after.split("/").length;
      return "../".repeat(depth);
    }
    return "./";
  }
  var B = base();

  // ── routes ──
  var R = {
    home:B+"index.html", signin:B+"pages/public/signin.html", quiz:B+"pages/public/quiz.html",
    about:B+"pages/public/about.html", terms:B+"pages/public/terms.html", cookies:B+"pages/public/cookies.html",
    tDash:B+"pages/traveler/dashboard.html", tHome:B+"pages/traveler/home.html",
    tVibe:B+"pages/traveler/vibe-search.html", tGavel:B+"pages/traveler/gavel.html",
    tWeather:B+"pages/traveler/weather-swap.html", tPast:B+"pages/traveler/past-trips.html",
    tTour:B+"pages/traveler/tour-detail.html", tNotif:B+"pages/traveler/notifications.html",
    tCheckout:B+"pages/traveler/checkout.html", tBooking:B+"pages/traveler/booking-confirm.html",
    gDash:B+"pages/guide/dashboard.html", gClients:B+"pages/guide/clients.html",
    gAvail:B+"pages/guide/availability.html", gProfile:B+"pages/guide/profile-builder.html",
    aDash:B+"pages/agency/dashboard.html", aAnalytics:B+"pages/agency/analytics.html",
    aTour:B+"pages/agency/tour-builder.html", aCal:B+"pages/agency/calendar.html",
    aBook:B+"pages/agency/participants.html", aTeam:B+"pages/agency/team.html",
    aProfile:B+"pages/agency/profile-builder.html", aMobile:B+"pages/agency/mobile-analytics.html",
    settings:B+"pages/shared/settings.html", roles:B+"pages/shared/roles.html",
    security:B+"pages/shared/security.html", subs:B+"pages/shared/subscription.html",
    payStatus:B+"pages/shared/payment-status.html", payout:B+"pages/shared/payout-setup.html"
  };

  // ── detect role + page ──
  function role() {
    var s = localStorage.getItem("byg_role");
    if (s) return s;
    if (PATH.indexOf("/traveler/")>-1) return "traveler";
    if (PATH.indexOf("/guide/")>-1) return "guide";
    if (PATH.indexOf("/agency/")>-1) return "agency";
    return "traveler";
  }
  function page() {
    var map = [
      ["dashboard","dashboard"],["home","home"],["vibe-search","vibe"],["gavel","gavel"],
      ["weather-swap","weather"],["past-trips","past"],["tour-detail","tour"],
      ["notifications","notif"],["checkout","checkout"],["booking-confirm","booking"],
      ["analytics","analytics"],["tour-builder","tourbuilder"],["calendar","calendar"],
      ["participants","bookings"],["team","team"],["profile-builder","profile"],
      ["mobile-analytics","mobileAnalytics"],["clients","clients"],["availability","avail"],
      ["settings","settings"],["roles","roles"],["security","security"],
      ["subscription","subs"],["payment-status","payStatus"],["payout-setup","payout"],
      ["signin","signin"],["quiz","quiz"],["about","about"],["terms","terms"],["cookies","cookies"]
    ];
    for (var i=0;i<map.length;i++) if (PATH.indexOf(map[i][0])>-1) return map[i][1];
    return "";
  }

  var ROLE = role(), PAGE = page();
  var IS_PUBLIC = PATH.indexOf("/public/")>-1 || PATH.endsWith("index.html") || PATH==="/" || PATH.endsWith("404.html");
  var IS_SHARED = PATH.indexOf("/shared/")>-1;

  // ── role tabs ──
  var TABS = {
    traveler:[
      {label:"Dashboard",icon:"dashboard",href:R.tDash,id:"dashboard"},
      {label:"Explore",icon:"travel_explore",href:R.tHome,id:"home"},
      {label:"My Trips",icon:"history",href:R.tPast,id:"past"},
      {label:"Vibe Search",icon:"image_search",href:R.tVibe,id:"vibe"},
      {label:"Alerts",icon:"notifications",href:R.tNotif,id:"notif"}
    ],
    guide:[
      {label:"Dashboard",icon:"dashboard",href:R.gDash,id:"dashboard"},
      {label:"Clients",icon:"people",href:R.gClients,id:"clients"},
      {label:"Calendar",icon:"calendar_today",href:R.gAvail,id:"avail"},
      {label:"Profile",icon:"person",href:R.gProfile,id:"profile"}
    ],
    agency:[
      {label:"Dashboard",icon:"dashboard",href:R.aDash,id:"dashboard"},
      {label:"Analytics",icon:"analytics",href:R.aAnalytics,id:"analytics"},
      {label:"Tours",icon:"map",href:R.aTour,id:"tourbuilder"},
      {label:"Calendar",icon:"calendar_today",href:R.aCal,id:"calendar"},
      {label:"Bookings",icon:"confirmation_number",href:R.aBook,id:"bookings"},
      {label:"Team",icon:"groups",href:R.aTeam,id:"team"}
    ]
  };

  // ── settings sub-nav ──
  var STABS = [
    {label:"Profile",icon:"person",href:R.settings,id:"settings"},
    {label:"Roles",icon:"manage_accounts",href:R.roles,id:"roles"},
    {label:"Security",icon:"security",href:R.security,id:"security"},
    {label:"Subscription",icon:"card_membership",href:R.subs,id:"subs"},
    {label:"Payments",icon:"payments",href:R.payStatus,id:"payStatus"},
    {label:"Payouts",icon:"account_balance",href:R.payout,id:"payout"}
  ];

  // ── dead link map ──
  var DL={
    "destinations":R.tHome,"community":R.about,"hotels":R.tHome,"flights":R.tHome,
    "sitemap":R.home,"legal":R.terms,"press":R.about,"pricing":R.subs,"api":R.about,
    "privacy":R.cookies,"support":R.about,"cancellation policy":R.terms,
    "create an account":R.signin,"don't have an account":R.signin,
    "tour builder":R.aTour,"crm":R.aBook,"finance":R.payStatus,"agents":R.aTeam,
    "trips":R.tPast,"guide":R.gDash,"portfolio":R.gClients,
    "roles":R.roles,"subscription":R.subs,"payments":R.payStatus,
    "payment methods":R.payStatus,"role management":R.roles,"invoices":R.payStatus,
    "members":R.roles,"why switch roles":R.roles,"manage on stripe":R.payout,
    "view all history":R.payStatus,"travelers":R.tDash,"need help":R.about,
    "planner":R.tDash,"view on map":R.tDash,"chat with a travel":R.tDash,
    "quotes":R.tNotif,"alerts":R.tNotif,"view details":R.tTour,
    "upgrade plan":R.subs,"asia":R.tHome,"indonesia":R.tHome,
    "view open positions":R.about
  };

  // ════════════════════════════════════════════
  //  MAIN
  // ════════════════════════════════════════════
  document.addEventListener("DOMContentLoaded", function () {
    if (IS_PUBLIC) { fixDeadLinks(); return; }
    replaceTopbar();
    fixSidebar();
    fixDeadLinks();
    addMobileBottomNav();
  });

  // ── 1. REPLACE TOPBAR ──
  function replaceTopbar() {
    // Agency/guide pages with FULL sidebar layouts (flex h-screen): 
    // don't replace the header - fix it in place instead.
    // Settings pages have aside inside grids (col-span) - those DO get new topbar.
    var fullSidebar = document.querySelector("aside:not([class*='col-span'])");
    if (fullSidebar) {
      var parent = fullSidebar.parentElement;
      var parentCls = (parent && parent.className) || "";
      // Only skip topbar replacement if aside is in a flex h-screen layout
      if (parentCls.indexOf("flex") > -1 && (parentCls.indexOf("h-screen") > -1 || parentCls.indexOf("min-h-screen") > -1)) {
        fixSidebarHeader();
        return;
      }
    }

    var tabs = TABS[ROLE] || TABS.traveler;
    var tabsHtml = "";
    tabs.forEach(function(t){
      var a = isActive(t.id);
      var c = a
        ? "border-b-2 border-orange-500 text-orange-500 font-semibold"
        : "border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-teal-500 hover:border-slate-300";
      tabsHtml += '<a class="hidden md:inline-flex items-center gap-1.5 px-1 pt-1 text-sm transition-colors '+c+'" href="'+t.href+'">'
        + '<span class="material-icons text-base">'+t.icon+'</span>'+t.label+'</a>';
    });

    var dH = ROLE==="guide"?R.gDash:ROLE==="agency"?R.aDash:R.tDash;
    var rL = ROLE==="guide"?"Guide":ROLE==="agency"?"Agency":"Traveler";
    var rI = ROLE==="guide"?"tour":ROLE==="agency"?"business":"flight";

    var bar =
      '<nav id="byg-topbar" class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">'+
        '<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">'+
          '<div class="flex items-center justify-between h-16">'+
            '<div class="flex items-center gap-6">'+
              '<a href="'+dH+'" class="flex items-center gap-2 flex-shrink-0">'+
                '<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">'+
                  '<span class="material-icons text-lg">change_history</span>'+
                '</div>'+
                '<span class="font-bold text-lg tracking-tight text-slate-900 dark:text-white hidden sm:block">Before <span class="bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">You Go</span></span>'+
              '</a>'+
              '<div class="hidden md:flex items-center gap-6 h-16">'+tabsHtml+'</div>'+
            '</div>'+
            '<div class="flex items-center gap-2">'+
              // Role switcher
              '<div class="relative" id="byg-rw">'+
                '<button id="byg-rb" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition bg-white dark:bg-slate-800">'+
                  '<span class="material-icons text-sm text-teal-500">'+rI+'</span>'+
                  '<span class="hidden sm:inline text-slate-600 dark:text-slate-300">'+rL+'</span>'+
                  '<span class="material-icons text-sm text-slate-400">expand_more</span>'+
                '</button>'+
                '<div id="byg-rd" class="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 hidden z-[60]">'+
                  roleDD()+
                '</div>'+
              '</div>'+
              '<a href="'+R.tNotif+'" class="relative p-2 rounded-full text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-white/5 transition">'+
                '<span class="material-icons text-xl">notifications</span>'+
                '<span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>'+
              '</a>'+
              '<a href="'+R.settings+'" class="p-2 rounded-full text-slate-400 hover:text-teal-500 hover:bg-slate-100 dark:hover:bg-white/5 transition">'+
                '<span class="material-icons text-xl">settings</span>'+
              '</a>'+
              '<button id="byg-ham" class="md:hidden p-2 text-slate-500"><span class="material-icons text-2xl">menu</span></button>'+
              '<div class="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">'+
                '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white text-sm font-bold">U</div>'+
              '</div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div id="byg-mob" class="hidden md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pb-4">'+mobTabs(tabs)+'</div>'+
      '</nav>';

    // Settings sub-nav
    var sBar = "";
    if (IS_SHARED) {
      sBar = '<div id="byg-settings-bar" class="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-16 z-40">'
        +'<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">'
        +'<div class="flex items-center gap-1 py-2 min-w-max">';
      STABS.forEach(function(s){
        var a=s.id===PAGE;
        var c=a?"bg-teal-500/10 text-teal-600 font-semibold":"text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-teal-500";
        sBar+='<a class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition '+c+'" href="'+s.href+'">'
          +'<span class="material-icons text-lg">'+s.icon+'</span>'+s.label+'</a>';
      });
      sBar += '</div></div></div>';
    }

    // Find existing topbar to replace
    var existing = null;
    var shouldReplace = true;
    
    // Look for a sticky/fixed nav that contains navigation links (Dashboard, Trips, etc.)
    var candidates = document.querySelectorAll("nav, header");
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var cls = (el.className || "");
      // Skip sidebar navs
      if (el.closest && el.closest("aside")) continue;
      // Skip breadcrumb navs inside headers
      if (el.tagName === "NAV" && el.parentElement && el.parentElement.tagName === "HEADER") continue;
      
      var isPositioned = cls.indexOf("sticky") > -1 || cls.indexOf("fixed") > -1 || cls.indexOf("top-0") > -1;
      if (!isPositioned) continue;
      
      // Check if this is a NAVIGATION bar (has Dashboard/Trips/etc links)
      // vs an app-specific header (Tour Builder action bar, Gavel toolbar, etc.)
      var linkTexts = (el.textContent || "").toLowerCase();
      var isNavBar = linkTexts.indexOf("dashboard") > -1 || linkTexts.indexOf("my trips") > -1 
                  || linkTexts.indexOf("discover") > -1 || linkTexts.indexOf("messages") > -1
                  || linkTexts.indexOf("clients") > -1 || linkTexts.indexOf("analytics") > -1
                  || linkTexts.indexOf("explore") > -1;
      
      if (isNavBar) {
        // This IS a navigation bar - replace it
        existing = el;
        shouldReplace = true;
        break;
      } else if (el.tagName === "HEADER") {
        // This is an app header (tour builder, etc.) - prepend before it
        existing = el;
        shouldReplace = false;
        break;
      }
    }
    
    if (existing && shouldReplace) {
      existing.outerHTML = bar + sBar;
    } else if (existing && !shouldReplace) {
      existing.insertAdjacentHTML("beforebegin", bar + sBar);
    } else {
      // No nav/header found at all - inject at top of body
      // Skip ambient blobs div if present
      var firstReal = document.body.firstElementChild;
      while (firstReal && (firstReal.id === "byg-ambient-blobs" || firstReal.tagName === "STYLE" || firstReal.tagName === "SCRIPT")) {
        firstReal = firstReal.nextElementSibling;
      }
      if (firstReal) {
        firstReal.insertAdjacentHTML("beforebegin", bar + sBar);
      } else {
        document.body.insertAdjacentHTML("afterbegin", bar + sBar);
      }
    }

    // Fix body layout for centered pages (checkout, booking-confirm, weather-swap)
    // These pages have body with flex items-center justify-center which doesn't
    // work with a prepended topbar. Convert to flex-col with centered content.
    var bodyCls = document.body.className || "";
    if (bodyCls.indexOf("items-center") > -1 && bodyCls.indexOf("justify-center") > -1) {
      document.body.classList.remove("items-center", "justify-center");
      document.body.classList.add("flex-col", "items-stretch");
      // Wrap non-nav content in a centered container
      var children = Array.from(document.body.children);
      var wrapper = document.createElement("div");
      wrapper.className = "flex-1 flex items-center justify-center p-4";
      children.forEach(function(child) {
        if (child.id !== "byg-topbar" && child.id !== "byg-settings-bar" && child.id !== "byg-ambient-blobs" && child.tagName !== "STYLE" && child.tagName !== "SCRIPT") {
          wrapper.appendChild(child);
        }
      });
      document.body.appendChild(wrapper);
    }

    // Fix h-screen overflow when topbar is prepended (tour-builder, gavel, etc.)
    if (bodyCls.indexOf("h-screen") > -1 && !shouldReplace) {
      document.body.style.height = "100vh";
      document.body.style.overflow = "hidden";
    }

    // Wire events
    setTimeout(function(){
      var rb=document.getElementById("byg-rb"),rd=document.getElementById("byg-rd");
      if(rb&&rd){
        rb.addEventListener("click",function(e){e.stopPropagation();rd.classList.toggle("hidden");});
        document.addEventListener("click",function(){rd.classList.add("hidden");});
      }
      var hm=document.getElementById("byg-ham"),mb=document.getElementById("byg-mob");
      if(hm&&mb) hm.addEventListener("click",function(){mb.classList.toggle("hidden");});
    },50);
  }

  function isActive(id) {
    if (id===PAGE) return true;
    // Map sub-pages to parent tabs
    if (ROLE==="traveler") {
      if (id==="dashboard" && ["gavel","weather","checkout","booking"].indexOf(PAGE)>-1) return true;
      if (id==="past" && PAGE==="tour") return true;
    }
    if (IS_SHARED) return false; // no main tab active on settings pages
    return false;
  }

  function roleDD(){
    var rs=[{k:"traveler",i:"flight",l:"Traveler",h:R.tDash},{k:"guide",i:"tour",l:"Guide",h:R.gDash},{k:"agency",i:"business",l:"Agency",h:R.aDash}];
    var h='';
    rs.forEach(function(r){
      var a=r.k===ROLE;
      var c=a?"bg-teal-500/10 text-teal-600 font-semibold":"text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5";
      h+='<a class="flex items-center gap-3 px-4 py-2.5 text-sm transition '+c+'" href="'+r.h+'" onclick="localStorage.setItem(\'byg_role\',\''+r.k+'\')">'
        +'<span class="material-icons text-lg">'+r.i+'</span>'+r.l;
      if(a) h+='<span class="ml-auto material-icons text-sm text-teal-500">check</span>';
      h+='</a>';
    });
    h+='<div class="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">'
      +'<a class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition" href="'+R.signin+'" onclick="localStorage.clear()">'
      +'<span class="material-icons text-lg">logout</span>Sign Out</a></div>';
    return h;
  }

  function mobTabs(tabs){
    var h='<div class="px-4 pt-3 space-y-1">';
    tabs.forEach(function(t){
      var a=isActive(t.id);
      var c=a?"bg-teal-500/10 text-teal-600 font-semibold":"text-slate-600 hover:bg-slate-50";
      h+='<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm '+c+'" href="'+t.href+'">'
        +'<span class="material-icons text-xl">'+t.icon+'</span>'+t.label+'</a>';
    });
    h+='<div class="border-t border-slate-200 mt-3 pt-3">'
      +'<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-600 hover:bg-slate-50" href="'+R.settings+'"><span class="material-icons text-xl">settings</span>Settings</a>'
      +'<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-500 hover:bg-red-50" href="'+R.signin+'" onclick="localStorage.clear()"><span class="material-icons text-xl">logout</span>Sign Out</a>'
      +'</div></div>';
    return h;
  }

  // ── 1b. FIX HEADER ON SIDEBAR PAGES ──
  function fixSidebarHeader() {
    // On agency pages with sidebars, the header is inside the content area
    // Just ensure it has correct branding and useful links
    var header = document.querySelector("header");
    if (!header) return;
    
    // Find/fix logo in the aside
    var aside = document.querySelector("aside");
    if (aside) {
      var logoArea = aside.querySelector('[class*="h-16"], [class*="border-b"]:first-child');
      if (logoArea) {
        var dH = ROLE==="guide"?R.gDash:ROLE==="agency"?R.aDash:R.tDash;
        logoArea.innerHTML = '<a href="'+dH+'" class="flex items-center gap-2 w-full">'
          +'<div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">'
          +'<span class="material-icons text-lg">change_history</span></div>'
          +'<span class="ml-1 font-bold text-lg hidden lg:block tracking-tight">Before <span class="bg-gradient-to-r from-orange-500 to-teal-500 bg-clip-text text-transparent">You Go</span></span>'
          +'</a>';
      }
    }
    
    // Add role switcher + notifications to the header
    var rightSide = header.querySelector('[class*="flex"][class*="items-center"][class*="gap"]');
    if (!rightSide) rightSide = header.querySelector('[class*="flex"]:last-child');
    
    if (rightSide && !document.getElementById("byg-rw")) {
      var rL = ROLE==="guide"?"Guide":ROLE==="agency"?"Agency":"Traveler";
      var rI = ROLE==="guide"?"tour":ROLE==="agency"?"business":"flight";
      
      var html = '<div class="flex items-center gap-2 ml-auto">'
        +'<div class="relative" id="byg-rw">'
        +'<button id="byg-rb" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:border-teal-400 transition bg-white dark:bg-slate-800">'
        +'<span class="material-icons text-sm text-teal-500">'+rI+'</span>'
        +'<span class="hidden sm:inline text-slate-600 dark:text-slate-300">'+rL+'</span>'
        +'<span class="material-icons text-sm text-slate-400">expand_more</span>'
        +'</button>'
        +'<div id="byg-rd" class="absolute right-0 top-full mt-2 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 hidden z-[60]">'
        +roleDD()
        +'</div></div>'
        +'<a href="'+R.tNotif+'" class="relative p-2 rounded-full text-slate-400 hover:text-teal-500 transition">'
        +'<span class="material-icons text-xl">notifications</span>'
        +'<span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span></a>'
        +'<a href="'+R.settings+'" class="p-2 rounded-full text-slate-400 hover:text-teal-500 transition">'
        +'<span class="material-icons text-xl">settings</span></a>'
        +'</div>';
      
      rightSide.insertAdjacentHTML("beforeend", html);
      
      // Wire dropdown
      setTimeout(function(){
        var rb=document.getElementById("byg-rb"),rd=document.getElementById("byg-rd");
        if(rb&&rd){
          rb.addEventListener("click",function(e){e.stopPropagation();rd.classList.toggle("hidden");});
          document.addEventListener("click",function(){rd.classList.add("hidden");});
        }
      },50);
    }
  }


  // ── 2. FIX SIDEBAR ──
  function fixSidebar(){
    var aside=document.querySelector("aside");
    if(!aside) return;
    var nav=aside.querySelector("nav");
    if(!nav) return;

    var items={
      agency:[
        {icon:"dashboard",label:"Dashboard",href:R.aDash,id:"dashboard"},
        {icon:"analytics",label:"Analytics",href:R.aAnalytics,id:"analytics"},
        {icon:"map",label:"Tour Builder",href:R.aTour,id:"tourbuilder"},
        {icon:"calendar_today",label:"Calendar",href:R.aCal,id:"calendar"},
        {icon:"confirmation_number",label:"Bookings",href:R.aBook,id:"bookings"},
        {icon:"groups",label:"Team",href:R.aTeam,id:"team"},
        {icon:"storefront",label:"Profile",href:R.aProfile,id:"profile"},
        {sep:true},
        {icon:"payments",label:"Payouts",href:R.payout,id:"payout"},
        {icon:"settings",label:"Settings",href:R.settings,id:"settings"}
      ]
    };

    var sr=PATH.indexOf("/agency/")>-1?"agency":null;
    if(!sr||!items[sr]) {
      // Try fixing settings sidebar instead
      if(IS_SHARED) fixSettingsSidebar(nav);
      return;
    }

    var h="";
    items[sr].forEach(function(item){
      if(item.sep){h+='<div class="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50"><p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden lg:block mb-2">Tools</p></div>';return;}
      var a=item.id===PAGE;
      var c=a?"bg-gradient-to-r from-orange-500/10 to-teal-500/5 text-teal-600 font-semibold border-l-[3px] border-orange-500":"text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-teal-500";
      h+='<a class="flex items-center px-3 py-2.5 rounded-lg group transition-colors '+c+'" href="'+item.href+'">'
        +'<span class="material-icons text-[20px]">'+item.icon+'</span>'
        +'<span class="ml-3 font-medium hidden lg:block text-sm">'+item.label+'</span></a>';
    });
    nav.innerHTML=h;
  }

  function fixSettingsSidebar(nav) {
    if (!nav) return;
    var h = "";
    STABS.forEach(function(s){
      var a = s.id === PAGE;
      var c = a
        ? "bg-teal-500/10 text-teal-600 font-semibold border-l-4 border-orange-500"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent";
      h += '<a class="group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all '+c+'" href="'+s.href+'">'
        + '<span class="material-icons mr-3 text-xl">'+s.icon+'</span>'
        + s.label + '</a>';
    });
    nav.innerHTML = h;
  }

  // ── 3. FIX DEAD LINKS ──
  function fixDeadLinks(){
    document.querySelectorAll('a[href="#"]').forEach(function(a){
      var raw=(a.textContent||"").replace(/\s+/g," ").trim().toLowerCase();
      var target;
      // direct match
      target=DL[raw];
      // partial match
      if(target===undefined){for(var k in DL){if(raw.indexOf(k)>-1){target=DL[k];break;}}}
      if(target) a.href=target;
      else a.style.cursor="pointer";
    });
  }

  // ── 4. MOBILE BOTTOM NAV ──
  function addMobileBottomNav(){
    if(document.getElementById("byg-bottom-nav")) return;
    var items={
      traveler:[{icon:"home",label:"Home",href:R.tDash},{icon:"travel_explore",label:"Explore",href:R.tHome},{icon:"image_search",label:"Vibe",href:R.tVibe},{icon:"notifications",label:"Alerts",href:R.tNotif},{icon:"settings",label:"More",href:R.settings}],
      guide:[{icon:"dashboard",label:"Home",href:R.gDash},{icon:"people",label:"Clients",href:R.gClients},{icon:"calendar_today",label:"Calendar",href:R.gAvail},{icon:"person",label:"Profile",href:R.gProfile},{icon:"settings",label:"More",href:R.settings}],
      agency:[{icon:"dashboard",label:"Home",href:R.aDash},{icon:"analytics",label:"Analytics",href:R.aAnalytics},{icon:"map",label:"Tours",href:R.aTour},{icon:"groups",label:"Team",href:R.aTeam},{icon:"settings",label:"More",href:R.settings}]
    };
    var btns=items[ROLE]||items.traveler;
    var nav=document.createElement("nav");
    nav.id="byg-bottom-nav";
    nav.className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 md:hidden z-50";
    nav.style.cssText="box-shadow:0 -4px 20px rgba(0,0,0,0.06);padding-bottom:env(safe-area-inset-bottom,4px)";
    var h='<div class="flex justify-around items-center h-14">';
    btns.forEach(function(b){
      var a=b.href.indexOf(PAGE)>-1;
      var c=a?"text-teal-500":"text-slate-400";
      h+='<a class="flex flex-col items-center justify-center gap-0.5 flex-1 '+c+'" href="'+b.href+'">'
        +'<span class="material-icons text-xl">'+b.icon+'</span>'
        +'<span class="text-[10px] font-medium">'+b.label+'</span></a>';
    });
    h+='</div>';
    nav.innerHTML=h;
    document.body.appendChild(nav);
    document.body.style.paddingBottom="60px";
  }

  window.BYG_NAV={ROUTES:R,ROLE:ROLE,PAGE:PAGE,BASE:B};
})();
