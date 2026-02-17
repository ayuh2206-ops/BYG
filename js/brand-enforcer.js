// ═══════════════════════════════════════════════
// BeforeYouGo - Brand & Design Enforcer
// ═══════════════════════════════════════════════
// Runs on every page after DOM load to enforce
// consistent branding regardless of Stitch output.

(function() {
"use strict";

const BRAND = "Before You Go";
const LOGO_ICON = "change_history";

// Wrong brand names Stitch might have generated
const WRONG_BRANDS = [
    "TerraPlan", "TripFlow", "WanderLust", "Wanderlust", "WanderAI", "WanderCard",
    "TravelFlow", "TravelHub", "TravelConnect", "TravelAI", "TravelCore",
    "PathFinder", "NomadAI", "JourneyAI", "ExploreAI", "TrekBuddy", "VoyageAI",
    "Atlas CRM", "TravelDNA"
];

// Wrong logo icons
const WRONG_ICONS = [
    "flight_takeoff", "travel_explore", "explore", "public",
    "flight", "airplanemode_active", "language", "map"
];

document.addEventListener("DOMContentLoaded", function() {

    // ─── 1. FIX SIDEBAR LOGO ───
    fixSidebarLogo();

    // ─── 2. FIX TOPBAR LOGO ───
    fixTopbarLogo();

    // ─── 3. FIX ANY REMAINING BRAND TEXT ───
    fixBrandText();

    // ─── 4. ADD ORANGE GRADIENT TOUCHES ───
    addOrangeAccents();

    // ─── 5. ENHANCE STAT NUMBERS ───
    enhanceStatNumbers();
});


function fixSidebarLogo() {
    // Find sidebars (aside elements with nav)
    var asides = document.querySelectorAll("aside");
    asides.forEach(function(aside) {
        // Only fix navigation sidebars (ones with nav links, not content sidebars)
        var hasNav = aside.querySelector("nav") || aside.querySelector("a[href]");
        if (!hasNav) return;

        // Find the logo header area (usually first child div with h-16 or border-b)
        var headerDiv = aside.querySelector('[class*="h-16"], [class*="border-b"]:first-child');
        if (!headerDiv) {
            // Try first div child
            headerDiv = aside.children[0];
        }
        if (!headerDiv) return;

        // Find material icon in this header
        var iconEl = headerDiv.querySelector('[class*="material"]');
        if (iconEl) {
            var iconText = iconEl.textContent.trim();
            if (WRONG_ICONS.indexOf(iconText) !== -1 || iconText !== LOGO_ICON) {
                // Only replace if it looks like a logo icon (in a small colored container)
                var parent = iconEl.parentElement;
                var isLogoIcon = parent && (
                    parent.className.indexOf("w-8") !== -1 ||
                    parent.className.indexOf("w-9") !== -1 ||
                    parent.className.indexOf("w-10") !== -1 ||
                    parent.className.indexOf("rounded") !== -1
                );
                if (isLogoIcon) {
                    iconEl.textContent = LOGO_ICON;

                    // Also upgrade the icon container to gradient
                    parent.className = parent.className
                        .replace(/bg-primary/g, "")
                        .replace(/bg-teal-\d+/g, "")
                        .replace(/bg-emerald-\d+/g, "");
                    parent.style.background = "linear-gradient(135deg, #F97316, #14B8A6)";
                    parent.style.boxShadow = "0 4px 12px rgba(249,115,22,0.25)";
                }
            }
        }

        // Find brand text near the icon
        var textEls = headerDiv.querySelectorAll("span, p, h1, h2, h3");
        textEls.forEach(function(el) {
            var text = el.textContent.trim();
            // Check if this looks like a brand name
            WRONG_BRANDS.forEach(function(wrong) {
                if (text === wrong || text.indexOf(wrong) !== -1) {
                    replaceBrandInElement(el);
                }
            });
            // Also fix if it's just a plain brand-like text next to the icon
            if (el.className.indexOf("font-bold") !== -1 && el.className.indexOf("hidden") !== -1 && el.className.indexOf("lg:block") !== -1) {
                replaceBrandInElement(el);
            }
        });
    });
}


function fixTopbarLogo() {
    // Skip the navigation.js-injected topbar (it handles its own branding)
    // Find header elements
    var headers = document.querySelectorAll("header, [class*='sticky'][class*='top-0'], [class*='fixed'][class*='top-0']");
    headers.forEach(function(header) {
        // Skip if this is the navigation.js topbar
        if (header.id === "byg-topbar" || header.closest("#byg-topbar")) return;
        // Find flex container that likely holds logo
        var logoContainers = header.querySelectorAll('[class*="flex"][class*="items-center"]');
        logoContainers.forEach(function(container) {
            var iconEl = container.querySelector('[class*="material"]');
            var textEl = container.querySelector('[class*="font-bold"], [class*="font-display"]');
            
            if (iconEl && textEl) {
                var iconText = iconEl.textContent.trim();
                var brandText = textEl.textContent.trim();
                
                // Check if this is a logo area (icon + brand text together)
                if (WRONG_ICONS.indexOf(iconText) !== -1 || iconText === LOGO_ICON) {
                    iconEl.textContent = LOGO_ICON;
                    // Apply gradient to icon
                    iconEl.style.background = "linear-gradient(135deg, #F97316, #14B8A6)";
                    iconEl.style.webkitBackgroundClip = "text";
                    iconEl.style.webkitTextFillColor = "transparent";
                    iconEl.style.backgroundClip = "text";
                }
                
                // Fix brand text
                WRONG_BRANDS.forEach(function(wrong) {
                    if (brandText.indexOf(wrong) !== -1 || brandText === wrong) {
                        replaceBrandInElement(textEl);
                    }
                });
            }
        });
    });

    // Also look for standalone logo links in nav bars
    document.querySelectorAll("a[href*='index'], a[href*='dashboard'], a[href='/'], a[href='#']").forEach(function(link) {
        if (link.closest("nav, header, [class*='sticky']")) {
            var icon = link.querySelector('[class*="material"]');
            var text = link.querySelector('[class*="font-bold"]');
            if (icon) {
                var iconText = icon.textContent.trim();
                if (WRONG_ICONS.indexOf(iconText) !== -1) {
                    icon.textContent = LOGO_ICON;
                    icon.style.background = "linear-gradient(135deg, #F97316, #14B8A6)";
                    icon.style.webkitBackgroundClip = "text";
                    icon.style.webkitTextFillColor = "transparent";
                }
            }
        }
    });
}


function replaceBrandInElement(el) {
    // Check if element has a color-span child like "Terra<span>Plan</span>"
    var childSpan = el.querySelector("span");
    if (childSpan && el.childNodes.length > 1) {
        // Multi-part brand: "Before " + "<span class='gradient'>You Go</span>"
        // Clear all children
        while (el.firstChild) el.removeChild(el.firstChild);
        el.appendChild(document.createTextNode("Before "));
        var span = document.createElement("span");
        span.textContent = "You Go";
        span.style.background = "linear-gradient(135deg, #F97316, #14B8A6)";
        span.style.webkitBackgroundClip = "text";
        span.style.webkitTextFillColor = "transparent";
        span.style.backgroundClip = "text";
        el.appendChild(span);
    } else {
        // Simple text replacement
        el.textContent = BRAND;
    }
}


function fixBrandText() {
    // Walk all text nodes looking for wrong brand names
    var walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    var node;
    while (node = walker.nextNode()) {
        var text = node.textContent;
        WRONG_BRANDS.forEach(function(wrong) {
            if (text.indexOf(wrong) !== -1) {
                node.textContent = text.split(wrong).join(BRAND);
            }
        });
    }

    // Fix footer brand names and copyright
    document.querySelectorAll("footer span, footer p, footer h3, footer h4").forEach(function(el) {
        WRONG_BRANDS.forEach(function(wrong) {
            if (el.textContent.indexOf(wrong) !== -1) {
                el.textContent = el.textContent.split(wrong).join(BRAND);
            }
        });
    });
}


function addOrangeAccents() {
    // ── Enhance CTA buttons with orange gradient ──
    document.querySelectorAll("button, a").forEach(function(btn) {
        var cl = btn.className || "";
        
        // Primary solid buttons → teal-to-orange gradient on hover
        if (cl.indexOf("bg-primary") !== -1 && 
            cl.indexOf("bg-primary/") === -1 &&
            cl.indexOf("bg-primary-") === -1 &&
            !btn.closest("aside, nav")) {
            // Only for prominent action buttons, not nav items
            var text = (btn.textContent || "").trim().toLowerCase();
            if (text.indexOf("save") !== -1 || text.indexOf("create") !== -1 || 
                text.indexOf("publish") !== -1 || text.indexOf("book") !== -1 ||
                text.indexOf("confirm") !== -1 || text.indexOf("send") !== -1 ||
                text.indexOf("start") !== -1 || text.indexOf("get") !== -1 ||
                text.indexOf("submit") !== -1 || text.indexOf("pay") !== -1 ||
                text.indexOf("upgrade") !== -1 || text.indexOf("continue") !== -1) {
                btn.style.background = "linear-gradient(135deg, #F97316, #EA580C)";
                btn.style.boxShadow = "0 4px 15px rgba(249,115,22,0.3)";
                btn.style.border = "none";
            }
        }
    });

    // ── Upgrade section headers with subtle gradient ──
    document.querySelectorAll("h1, h2").forEach(function(h) {
        var cl = h.className || "";
        if (cl.indexOf("font-bold") !== -1 || cl.indexOf("font-display") !== -1) {
            // Only if it's a dark text heading
            if (cl.indexOf("text-slate-900") !== -1 || cl.indexOf("text-white") !== -1 || cl.indexOf("text-gray") !== -1) {
                // Don't touch white text headings on dark backgrounds
                if (cl.indexOf("text-white") !== -1) return;
            }
        }
    });

    // ── Add gradient border-top to main content cards ──
    document.querySelectorAll('[class*="rounded-2xl"][class*="bg-white"], [class*="rounded-xl"][class*="bg-white"], [class*="rounded-2xl"][class*="bg-surface"]').forEach(function(card) {
        if (card.closest("aside, nav")) return; // Skip sidebar cards
        if (card.offsetHeight > 100) { // Only substantial cards
            card.style.borderTop = "2px solid transparent";
            card.style.borderImage = "linear-gradient(90deg, #14B8A6, #F97316) 1";
            card.style.borderImageSlice = "1 0 0 0"; 
        }
    });

    // ── Upgrade tab / pill active states ──
    document.querySelectorAll('[class*="bg-primary"][class*="text-white"][class*="rounded"]').forEach(function(pill) {
        var cl = pill.className || "";
        if (cl.indexOf("rounded-full") !== -1 || cl.indexOf("rounded-lg") !== -1) {
            pill.style.background = "linear-gradient(135deg, #F97316, #EA580C)";
            pill.style.boxShadow = "0 2px 8px rgba(249,115,22,0.25)";
        }
    });

    // ── Make orange-500 badges more vibrant ──
    document.querySelectorAll('[class*="bg-orange"]').forEach(function(el) {
        el.style.background = "linear-gradient(135deg, #F97316, #FB923C)";
    });

    // ── Add shimmer to notification badges ──
    document.querySelectorAll('[class*="bg-red-"][class*="rounded-full"]').forEach(function(badge) {
        if (badge.offsetWidth < 30) { // Small notification dots
            badge.style.background = "linear-gradient(135deg, #F97316, #EF4444)";
            badge.style.boxShadow = "0 0 8px rgba(249,115,22,0.4)";
        }
    });
}


function enhanceStatNumbers() {
    // Make stat/metric numbers use gradient text
    document.querySelectorAll('[class*="text-3xl"][class*="font-bold"], [class*="text-4xl"][class*="font-bold"], [class*="text-2xl"][class*="font-semibold"]').forEach(function(el) {
        // Only apply to numbers (not headings with words)
        var text = el.textContent.trim();
        if (/^[\d,.$%€¥£₹+\-\s]+$/.test(text) || /^\d/.test(text)) {
            el.style.background = "linear-gradient(135deg, #14B8A6, #F97316)";
            el.style.webkitBackgroundClip = "text";
            el.style.webkitTextFillColor = "transparent";
            el.style.backgroundClip = "text";
        }
    });

    // ── Make progress bars gradient ──
    document.querySelectorAll('[class*="bg-primary"][class*="h-1"], [class*="bg-primary"][class*="h-2"], [class*="bg-teal"][class*="h-1"], [class*="bg-teal"][class*="h-2"], [class*="bg-primary"][class*="rounded-full"]').forEach(function(bar) {
        // Only progress bars (parent is a track container)
        var parent = bar.parentElement;
        if (parent && (parent.className.indexOf("bg-slate") !== -1 || parent.className.indexOf("bg-gray") !== -1)) {
            bar.style.background = "linear-gradient(90deg, #14B8A6, #F97316)";
            bar.style.boxShadow = "0 0 8px rgba(249,115,22,0.2)";
        }
    });
}

})();
