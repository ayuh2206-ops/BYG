(function () {
"use strict";

if (window.BYGPlatformExperience) return;

var APP_STATE_KEY = "byg_app_state_v2";
var MAX_NOTIFICATIONS = 30;
var DEFAULT_MOOD = "Neon Nights";
var stateLoadPromise = null;
var stateSyncTimer = null;
var pageSnapshotTimer = null;
var ctx = { basePath: "./", isPublicPage: false, role: "traveler" };

var ROUTES = {
  quiz: "pages/public/quiz.html",
  home: "pages/traveler/home.html",
  travelerDashboard: "pages/traveler/dashboard.html",
  guideDashboard: "pages/guide/dashboard.html",
  agencyDashboard: "pages/agency/dashboard.html",
  vibe: "pages/traveler/vibe-search.html",
  tour: "pages/traveler/tour-detail.html",
  checkout: "pages/traveler/checkout.html",
  bookingConfirm: "pages/traveler/booking-confirm.html",
  notifications: "pages/traveler/notifications.html",
  settings: "pages/shared/settings.html",
  roles: "pages/shared/roles.html",
  subscription: "pages/shared/subscription.html",
  signIn: "pages/public/signin.html"
};

var QUIZ_QUESTIONS = [
  {
    id: "morning",
    title: "What kind of morning person are you?",
    subtitle: "This helps us gauge how active your itinerary should be.",
    options: [
      { icon: "wb_sunny", title: "Sunrise Hiker", description: "Up before the sun to catch the first light on the peaks." },
      { icon: "local_cafe", title: "Coffee Dreamer", description: "Slow starts with a latte and people watching." },
      { icon: "snooze", title: "No Alarm Needed", description: "I wake up naturally whenever my body is ready." },
      { icon: "fitness_center", title: "Early Burn", description: "A workout or run is the best way to start the day." }
    ]
  },
  {
    id: "tempo",
    title: "How do you like your travel days to feel?",
    subtitle: "We use this to balance structure with spontaneity.",
    options: [
      { icon: "bolt", title: "Packed & Electric", description: "I want every hour to feel alive and intentional." },
      { icon: "self_improvement", title: "Calm & Spacious", description: "Leave room to wander, breathe, and reset." },
      { icon: "shuffle", title: "Balanced", description: "A few anchor moments with plenty of flexibility." },
      { icon: "groups", title: "Social Momentum", description: "I like my plans to orbit around people and energy." }
    ]
  },
  {
    id: "scene",
    title: "Which setting feels most like you right now?",
    subtitle: "Your instinctive choice helps us shape your destination mix.",
    options: [
      { icon: "nights_stay", title: "Neon City", description: "Street food, late nights, and sensory overload." },
      { icon: "terrain", title: "Alpine Escape", description: "Crisp air, elevation, and cinematic landscapes." },
      { icon: "forest", title: "Forest Retreat", description: "Green silence, cabins, and grounding walks." },
      { icon: "beach_access", title: "Island Slowdown", description: "Salt air, easy afternoons, and turquoise water." }
    ]
  },
  {
    id: "food",
    title: "What role should food play in the trip?",
    subtitle: "Cuisine is often the fastest route to a memorable itinerary.",
    options: [
      { icon: "ramen_dining", title: "Major Theme", description: "Food should be one of the core reasons to go." },
      { icon: "restaurant", title: "Curated Highlights", description: "A few unforgettable meals are enough for me." },
      { icon: "bakery_dining", title: "Local Casual", description: "I care more about neighborhood spots than fine dining." },
      { icon: "emoji_food_beverage", title: "Nice Bonus", description: "Good food matters, but it does not need to lead." }
    ]
  },
  {
    id: "style",
    title: "How should this next trip leave you feeling?",
    subtitle: "This final signal sharpens the recommendation tone.",
    options: [
      { icon: "auto_awesome", title: "Re-inspired", description: "I want to come back full of new ideas and energy." },
      { icon: "spa", title: "Restored", description: "I need softness, ease, and recovery time." },
      { icon: "camera_alt", title: "Story-Rich", description: "Give me strong visuals and shareable moments." },
      { icon: "explore", title: "Changed", description: "I want a place that stretches how I think and feel." }
    ]
  }
];

function init(options) {
  ctx = deepMerge(ctx, options || {});
  return ensureState().then(function () {
    ensurePlatformUi();
    hydrateSavedFields();
    hydrateProfileDefaults();
    bindFieldPersistence();
    bindToggleButtons();
    bindFallbackActions();
    initTravelerHome();
    initQuiz();
    initVibeSearch();
    initTourDetail();
    initCheckout();
    initBookingConfirm();
    initNotifications();
    initGavel();
    initRoles();
    initPreviewAndAI();
    updateNotificationDots();
  });
}

function ensureState() {
  if (window.BYG.appState) return Promise.resolve(window.BYG.appState);
  if (stateLoadPromise) return stateLoadPromise;

  stateLoadPromise = Promise.resolve().then(function () {
    var nextState = deepMerge(getDefaultState(), safeParse(localStorage.getItem(APP_STATE_KEY)));

    if (window.BYG.db && window.BYG.user && window.location.protocol !== "file:") {
      return window.BYG.db.getDoc(
        window.BYG.db.doc(window.BYG.db.instance, "users", window.BYG.user.uid, "appState", "platform")
      ).then(function (snap) {
        if (snap.exists()) nextState = deepMerge(nextState, snap.data());
        window.BYG.appState = nextState;
        return nextState;
      }).catch(function () {
        window.BYG.appState = nextState;
        return nextState;
      });
    }

    window.BYG.appState = nextState;
    return nextState;
  });

  return stateLoadPromise;
}

function getDefaultState() {
  return {
    version: 2,
    pageState: {},
    profile: { shared: {}, guide: {}, agency: {} },
    quiz: { currentIndex: 0, answers: {}, completed: false },
    vibe: { selectedMood: DEFAULT_MOOD, bookmarks: [] },
    bookingDraft: null,
    confirmedBookings: [],
    notifications: [],
    votes: {}
  };
}

function ensurePageState() {
  var key = getPageKey();
  window.BYG.appState.pageState = window.BYG.appState.pageState || {};
  if (!window.BYG.appState.pageState[key]) {
    window.BYG.appState.pageState[key] = { fields: {}, selections: {}, meta: {} };
  }
  return window.BYG.appState.pageState[key];
}

function queueSync() {
  if (!window.BYG.appState) return;
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(window.BYG.appState));
  clearTimeout(stateSyncTimer);
  stateSyncTimer = setTimeout(function () {
    if (!window.BYG.db || !window.BYG.user || window.location.protocol === "file:") return;
    window.BYG.db.setDoc(
      window.BYG.db.doc(window.BYG.db.instance, "users", window.BYG.user.uid, "appState", "platform"),
      window.BYG.appState,
      { merge: true }
    ).catch(function () {});
  }, 500);
}

function ensurePlatformUi() {
  if (document.getElementById("byg-platform-ui")) return;
  var style = document.createElement("style");
  style.id = "byg-platform-ui";
  style.textContent = ""
    + ".byg-toast-root{position:fixed;top:88px;right:20px;z-index:11000;display:flex;flex-direction:column;gap:10px;max-width:320px;}"
    + ".byg-toast{background:rgba(15,23,42,.96);color:#fff;padding:12px 14px;border-radius:14px;box-shadow:0 18px 45px -20px rgba(15,23,42,.55);font:500 13px/1.45 Inter,sans-serif;transform:translateY(-6px);opacity:0;animation:bygToastIn .2s ease forwards;}"
    + ".byg-toast[data-tone='success']{background:rgba(13,148,136,.96);}"
    + ".byg-toast[data-tone='warn']{background:rgba(234,88,12,.96);}"
    + ".byg-modal-backdrop{position:fixed;inset:0;z-index:11010;background:rgba(15,23,42,.52);display:flex;align-items:center;justify-content:center;padding:20px;}"
    + ".byg-modal{width:min(520px,100%);background:#fff;border-radius:22px;padding:24px;box-shadow:0 28px 65px -28px rgba(15,23,42,.45);font-family:Inter,sans-serif;white-space:pre-line;}"
    + ".byg-modal h3{margin:0 0 6px;font:700 22px/1.2 Poppins,Inter,sans-serif;color:#0f172a;}"
    + ".byg-modal p{margin:0;color:#64748b;font-size:14px;line-height:1.5;}"
    + ".byg-modal-grid{display:grid;gap:12px;margin-top:18px;}"
    + ".byg-modal-grid label{display:block;font-size:12px;font-weight:700;letter-spacing:.02em;color:#334155;margin-bottom:6px;}"
    + ".byg-modal-grid input,.byg-modal-grid textarea,.byg-modal-grid select{width:100%;border:1px solid #cbd5e1;border-radius:12px;padding:11px 12px;font:500 14px/1.4 Inter,sans-serif;color:#0f172a;}"
    + ".byg-modal-grid textarea{min-height:96px;resize:vertical;}"
    + ".byg-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px;}"
    + ".byg-modal-actions button{border:none;border-radius:12px;padding:10px 16px;font:600 14px/1 Inter,sans-serif;cursor:pointer;}"
    + ".byg-modal-actions .byg-secondary{background:#e2e8f0;color:#475569;}"
    + ".byg-modal-actions .byg-primary{background:linear-gradient(135deg,#f97316,#ea580c);color:#fff;box-shadow:0 14px 30px -18px rgba(249,115,22,.9);}"
    + ".byg-mood-card-selected{outline:4px solid rgba(20,184,166,.72);outline-offset:2px;transform:translateY(-2px);}"
    + ".byg-bookmark-active .material-icons{color:#f97316;}"
    + "@keyframes bygToastIn{to{opacity:1;transform:translateY(0);}}";
  document.head.appendChild(style);

  var toastRoot = document.createElement("div");
  toastRoot.id = "byg-toast-root";
  toastRoot.className = "byg-toast-root";
  document.body.appendChild(toastRoot);
}

function toast(message, tone) {
  ensurePlatformUi();
  var root = document.getElementById("byg-toast-root");
  if (!root) return;
  var el = document.createElement("div");
  el.className = "byg-toast";
  if (tone) el.dataset.tone = tone;
  el.textContent = message;
  root.appendChild(el);
  setTimeout(function () { el.remove(); }, 2600);
}

function openModal(config) {
  closeModal();
  ensurePlatformUi();
  var backdrop = document.createElement("div");
  backdrop.className = "byg-modal-backdrop";
  var fields = config.fields || [];
  backdrop.innerHTML = '<div class="byg-modal"><h3>' + escapeHtml(config.title || "Action") + '</h3><p>'
    + escapeHtml(config.description || "") + '</p><div class="byg-modal-grid"></div><div class="byg-modal-actions">'
    + '<button class="byg-secondary" type="button">Cancel</button><button class="byg-primary" type="button">'
    + escapeHtml(config.confirmLabel || "Save") + '</button></div></div>';

  var grid = backdrop.querySelector(".byg-modal-grid");
  fields.forEach(function (field) {
    var wrapper = document.createElement("div");
    var control = field.type === "textarea"
      ? '<textarea data-byg-field="' + field.name + '" placeholder="' + escapeHtml(field.placeholder || "") + '">' + escapeHtml(field.value || "") + '</textarea>'
      : '<input data-byg-field="' + field.name + '" type="' + escapeHtml(field.type || "text") + '" placeholder="' + escapeHtml(field.placeholder || "") + '" value="' + escapeHtml(field.value || "") + '"/>';
    wrapper.innerHTML = '<label>' + escapeHtml(field.label || field.name) + '</label>' + control;
    grid.appendChild(wrapper);
  });

  document.body.appendChild(backdrop);
  backdrop.addEventListener("click", function (event) { if (event.target === backdrop) closeModal(); });
  backdrop.querySelector(".byg-secondary").addEventListener("click", closeModal);
  backdrop.querySelector(".byg-primary").addEventListener("click", function () {
    var values = {};
    $all("[data-byg-field]", backdrop).forEach(function (field) {
      values[field.getAttribute("data-byg-field")] = field.value.trim();
    });
    Promise.resolve(config.onConfirm ? config.onConfirm(values) : null).then(closeModal);
  });
}

function closeModal() {
  var modal = document.querySelector(".byg-modal-backdrop");
  if (modal) modal.remove();
}

function hydrateSavedFields() {
  var pageState = ensurePageState();
  var fields = pageState.fields || {};
  $all("input, select, textarea").forEach(function (field) {
    var key = fieldKey(field);
    if (!key || fields[key] === undefined) return;
    if (field.type === "checkbox") field.checked = Boolean(fields[key]);
    else if (field.type === "radio") field.checked = field.value === fields[key];
    else field.value = fields[key];
  });
}

function hydrateProfileDefaults() {
  var savedEmail = localStorage.getItem("byg_user_email") || (window.BYG.user && window.BYG.user.email) || "";
  var emailField = document.getElementById("email") || document.getElementById("contact-email");
  if (emailField && !emailField.value && savedEmail) emailField.value = savedEmail;

  if (window.location.pathname.indexOf("/shared/settings") > -1) {
    var sharedProfile = window.BYG.appState.profile.shared || {};
    setFieldValue("first-name", sharedProfile.firstName || "Alex");
    setFieldValue("last-name", sharedProfile.lastName || "Traveler");
    setFieldValue("phone", sharedProfile.phone || "");
    setFieldValue("about", sharedProfile.about || "");
  }
}

function bindFieldPersistence() {
  $all("input, select, textarea").forEach(function (field) {
    if (field.dataset.bygPersist === "true" || isSensitiveField(field)) return;
    field.dataset.bygPersist = "true";
    var eventName = field.tagName === "SELECT" || field.type === "checkbox" || field.type === "radio" ? "change" : "input";
    field.addEventListener(eventName, queuePageSnapshot);
    if (/type language|type a region/i.test(field.placeholder || "")) {
      field.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" || !field.value.trim()) return;
        event.preventDefault();
        insertChipBeforeInput(field, field.value.trim());
        field.value = "";
        queuePageSnapshot();
      });
    }
  });
}

function queuePageSnapshot() {
  clearTimeout(pageSnapshotTimer);
  pageSnapshotTimer = setTimeout(function () {
    var pageState = ensurePageState();
    pageState.fields = collectFields();
    pageState.meta.updatedAt = new Date().toISOString();
    queueSync();
  }, 180);
}

function bindToggleButtons() {
  var pattern = /^(today|week|month|day|monthly|quarterly|weekly|specific dates|credit card|digital wallet|revenue|bookings|all|adventure|cultural|food|upcoming|planning|past trips)$/i;
  $all("button").forEach(function (button) {
    var label = cleanLabel(buttonText(button));
    if (!pattern.test(label) || button.dataset.bygToggle === "true") return;
    button.dataset.bygToggle = "true";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      var siblings = $all("button", button.parentElement).filter(function (candidate) {
        return candidate.parentElement === button.parentElement && pattern.test(cleanLabel(buttonText(candidate)));
      });
      siblings.forEach(function (candidate) { candidate.classList.remove("ring-2", "ring-primary", "bg-primary/10", "text-primary", "border-primary"); });
      button.classList.add("ring-2", "ring-primary", "bg-primary/10", "text-primary", "border-primary");
      ensurePageState().selections["toggle:" + slugify(siblings.map(function (candidate) { return cleanLabel(buttonText(candidate)); }).join("|"))] = label;
      queueSync();
    });
  });
}

function bindFallbackActions() {
  if (document.body.dataset.bygActions === "true") return;
  document.body.dataset.bygActions = "true";

  document.addEventListener("click", function (event) {
    var trigger = event.target.closest("button");
    if (!trigger || trigger.dataset.bygHandled === "true") return;
    if (trigger.closest("#byg-topbar") || trigger.closest("#byg-bottom-nav") || trigger.closest("#byg-rw") || trigger.closest(".byg-modal")) return;
    var text = buttonText(trigger);
    if (!text) return;

    if (/^cancel$/.test(text)) { event.preventDefault(); handleCancel(); return; }
    if (/save|update password|save draft|save preferences|save & continue/.test(text)) { event.preventDefault(); handleSave(trigger); return; }
    if (/download|export|print/.test(text)) { event.preventDefault(); handleExport(trigger); return; }
    if (/share/.test(text)) { event.preventDefault(); handleShare(); return; }
    if (/bookmark_border|favorite_border/.test(text)) { event.preventDefault(); toggleSaved(trigger); return; }
    if (/photo_camera|upload_file|cloud_upload/.test(text)) { event.preventDefault(); pickImage(trigger); return; }
    if (/generate with ai|auto_awesome/.test(text)) { event.preventDefault(); generateCopy(trigger); return; }
    if (/add custom|add slot|add new|create custom activity|invite member|add member|add client|new departure|add departure|block dates|send invite|new manual quote/.test(text)) { event.preventDefault(); handleCreate(trigger); return; }
    if (/^delete$|delete account/.test(text)) { event.preventDefault(); handleDelete(trigger); return; }
    if (/^close$|^remove /.test(text)) { event.preventDefault(); handleRemove(trigger); return; }
    if (text === "edit") { event.preventDefault(); toast("Edit mode is ready for this card.", "success"); return; }
    if (/swap now/.test(text)) { event.preventDefault(); handleSwap(); return; }
    if (/write review|edit review/.test(text)) { event.preventDefault(); handleReview(); return; }
    if (/view itinerary|review proposal|view quote|resume|rebook this vibe/.test(text)) { event.preventDefault(); navigate("tour"); return; }
    if (/modify booking/.test(text)) { event.preventDefault(); navigate("checkout"); return; }
    if (/plan a trip|start planning|find your trip|discover your travel dna|get started for free/.test(text)) { event.preventDefault(); navigate(window.BYG.appState.quiz.completed ? "vibe" : "quiz"); return; }
    if (/open map view|view full map|view all map/.test(text)) { event.preventDefault(); toast("Map view is ready for this itinerary.", "success"); return; }
    if (/message provider|message host|message all|follow up|reply/.test(text)) { event.preventDefault(); openMessageModal("Send Message", "Keep the trip moving with a quick update."); return; }
    if (/view plans/.test(text)) { event.preventDefault(); navigate("subscription"); return; }
    if (/change plan|manage seats|cancel subscription|connect with stripe|setup app|add phone number/.test(text)) { event.preventDefault(); handleSetupFlow(text); return; }
    if (/more_vert|more_horiz|mail/.test(text)) { event.preventDefault(); toast("Quick actions are now available from this card.", "success"); return; }
    if (/chevron_left|chevron_right|^previous$|^next$/.test(text)) { event.preventDefault(); handlePager(trigger, text); return; }
    if (/^sign out$|^logout$/.test(text)) { event.preventDefault(); signOut(); return; }
    if (/^notifications$/.test(text)) { event.preventDefault(); navigate("notifications"); return; }
  });
}

function initTravelerHome() {
  if (window.location.pathname.indexOf("/traveler/home") === -1) return;
  bindTextButtons(/find your trip|discover your travel dna|get started for free/i, function () {
    navigate(window.BYG.appState.quiz.completed ? "vibe" : "quiz");
  });
  bindTextButtons(/^sign out$/i, signOut);
}

function initQuiz() {
  if (window.location.pathname.indexOf("/public/quiz") === -1) return;
  var optionButtons = $all("main .grid button");
  if (optionButtons.length < 4) return;

  var questionTitle = $one("main h1");
  var questionSubtitle = $one("main p");
  var counter = $one("header .text-sm");
  var progress = $one(".bg-secondary.h-full") || $one("[class*='bg-secondary'][style]");
  var nextButton = findButton(/next question/i);
  var backButton = findButton(/^back$/i);
  var closeButton = findButton(/^close$/i);
  var quizState = window.BYG.appState.quiz;

  function renderQuestion() {
    var index = Math.max(0, Math.min(quizState.currentIndex || 0, QUIZ_QUESTIONS.length - 1));
    var question = QUIZ_QUESTIONS[index];
    var selected = quizState.answers[question.id];

    if (questionTitle) questionTitle.textContent = question.title;
    if (questionSubtitle) questionSubtitle.textContent = question.subtitle;
    if (counter) counter.textContent = "Question " + (index + 1) + " of " + QUIZ_QUESTIONS.length;
    if (progress) progress.style.width = (((index + 1) / QUIZ_QUESTIONS.length) * 100) + "%";

    optionButtons.forEach(function (button, optionIndex) {
      var option = question.options[optionIndex];
      var active = selected === option.title;
      button.innerHTML = '<div class="w-20 h-20 rounded-full bg-white/70 dark:bg-slate-900/30 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform duration-200"><span class="material-icons-round text-4xl">'
        + option.icon + '</span></div><h3 class="font-display text-xl font-semibold text-gray-800 dark:text-white mb-2">'
        + escapeHtml(option.title) + '</h3><p class="text-sm text-center text-gray-500 dark:text-gray-400 leading-relaxed">'
        + escapeHtml(option.description) + '</p>' + (active ? '<div class="absolute top-4 right-4 text-secondary"><span class="material-icons-round">check_circle</span></div>' : "");
      button.className = "group relative flex flex-col items-center p-8 bg-white dark:bg-card-dark rounded-xl shadow-sm border-2 transition-all duration-200 transform hover:-translate-y-1 " + (active ? "border-secondary shadow-xl" : "border-transparent hover:border-teal-200 dark:hover:border-teal-800");
      button.onclick = function (event) {
        event.preventDefault();
        quizState.answers[question.id] = option.title;
        queueSync();
        renderQuestion();
      };
      button.dataset.bygHandled = "true";
    });

    if (nextButton) nextButton.style.opacity = selected ? "1" : "0.65";
    if (backButton) backButton.style.visibility = index === 0 ? "hidden" : "visible";
  }

  if (nextButton) {
    nextButton.dataset.bygHandled = "true";
    nextButton.addEventListener("click", function (event) {
      event.preventDefault();
      var current = QUIZ_QUESTIONS[quizState.currentIndex || 0];
      if (!quizState.answers[current.id]) {
        toast("Pick the option that feels most like you first.", "warn");
        return;
      }
      if ((quizState.currentIndex || 0) >= QUIZ_QUESTIONS.length - 1) {
        quizState.completed = true;
        pushNotification({
          category: "System",
          title: "Travel DNA refreshed",
          body: "Your latest quiz answers are ready to power new destination matches.",
          ctaLabel: "Explore Matches",
          route: route("vibe")
        });
        queueSync();
        navigate("home");
        return;
      }
      quizState.currentIndex += 1;
      queueSync();
      renderQuestion();
    });
  }

  if (backButton) {
    backButton.dataset.bygHandled = "true";
    backButton.addEventListener("click", function (event) {
      event.preventDefault();
      quizState.currentIndex = Math.max(0, (quizState.currentIndex || 0) - 1);
      queueSync();
      renderQuestion();
    });
  }

  if (closeButton) {
    closeButton.dataset.bygHandled = "true";
    closeButton.addEventListener("click", function (event) {
      event.preventDefault();
      navigate("home");
    });
  }

  renderQuestion();
}

function initVibeSearch() {
  if (window.location.pathname.indexOf("/traveler/vibe-search") === -1) return;
  var moodGrid = $all("div.grid").filter(function (grid) { return (grid.className || "").indexOf("auto-rows") > -1; })[0];
  if (!moodGrid) return;

  var moodCards = Array.prototype.slice.call(moodGrid.children);
  var resultsLabel = $all("span").filter(function (span) { return /Results based on/i.test(span.textContent); })[0];
  var resultCards = $all("div").filter(function (card) {
    return card.querySelector("img") && /% Match/i.test(card.textContent) && (card.className || "").indexOf("rounded-xl") > -1;
  });
  var analyzeButton = findButton(/analyze my vibe/i);
  var clearButton = findButton(/clear selection/i);
  var sortButton = findButton(/sort by match/i);

  function moodLabel(card) {
    return $all("span", card).map(function (span) { return span.textContent.trim(); }).filter(Boolean).slice(-1)[0] || DEFAULT_MOOD;
  }

  function applyMoodSelection(label) {
    window.BYG.appState.vibe.selectedMood = label;
    moodCards.forEach(function (card) {
      card.classList.toggle("byg-mood-card-selected", moodLabel(card) === label);
    });
    if (resultsLabel) resultsLabel.textContent = 'Results based on "' + label + '"';
    queueSync();
  }

  moodCards.forEach(function (card) {
    card.addEventListener("click", function () { applyMoodSelection(moodLabel(card)); });
  });

  if (analyzeButton) {
    analyzeButton.dataset.bygHandled = "true";
    analyzeButton.addEventListener("click", function (event) {
      event.preventDefault();
      applyMoodSelection(window.BYG.appState.vibe.selectedMood || moodLabel(moodCards[0]));
      resultCards.sort(function (left, right) { return matchScore(right) - matchScore(left); }).forEach(function (card) {
        card.parentElement.appendChild(card);
      });
      pushNotification({
        category: "System",
        title: "Fresh vibe matches ready",
        body: "Your latest mood analysis is ready to review.",
        ctaLabel: "Review Proposal",
        route: route("tour")
      });
      toast("Matched your mood to a new set of destinations.", "success");
    });
  }

  if (clearButton) {
    clearButton.dataset.bygHandled = "true";
    clearButton.addEventListener("click", function (event) {
      event.preventDefault();
      moodCards.forEach(function (card) { card.classList.remove("byg-mood-card-selected"); });
      window.BYG.appState.vibe.selectedMood = "";
      if (resultsLabel) resultsLabel.textContent = "Results ready when you pick a mood";
      queueSync();
      toast("Selection cleared.");
    });
  }

  if (sortButton) {
    sortButton.dataset.bygHandled = "true";
    sortButton.addEventListener("click", function (event) {
      event.preventDefault();
      resultCards.sort(function (left, right) { return matchScore(right) - matchScore(left); }).forEach(function (card) {
        card.parentElement.appendChild(card);
      });
      toast("Sorted the destination cards by strongest match.", "success");
    });
  }

  applyMoodSelection(window.BYG.appState.vibe.selectedMood || moodLabel(moodCards[0]));
}

function initTourDetail() {
  if (window.location.pathname.indexOf("/traveler/tour-detail") === -1) return;
  var form = $one("form");
  var title = $one("h1");
  var price = $all("span").filter(function (span) { return /^\$\d/.test(span.textContent.trim()); })[0];

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var selects = $all("select", form);
      window.BYG.appState.bookingDraft = {
        title: title ? title.textContent.trim() : "Selected Experience",
        dates: selects[0] ? selects[0].value : "Flexible dates",
        guests: selects[1] ? selects[1].value : "2 Adults",
        amount: price ? price.textContent.trim() : "$1,499"
      };
      queueSync();
      navigate("checkout");
    });
  }

  bindTextButtons(/request quote/i, function () {
    pushNotification({
      category: "Quote",
      title: (title ? title.textContent.trim() : "Trip") + " quote requested",
      body: "We will notify you as soon as the host confirms dates and pricing.",
      ctaLabel: "View Quote",
      route: route("notifications")
    });
    toast("Quote request sent to the host.", "success");
  });

  bindTextButtons(/message host/i, function () {
    openMessageModal("Message Host", "Send a note to the host about this experience.");
  });
}

function initCheckout() {
  if (window.location.pathname.indexOf("/traveler/checkout") === -1) return;
  var paymentButtons = $all("button").filter(function (button) {
    return /credit card|digital wallet/.test(cleanLabel(buttonText(button)));
  });
  var selectedPayment = ensurePageState().selections.paymentMethod || "credit card";

  paymentButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      selectedPayment = cleanLabel(buttonText(button));
      ensurePageState().selections.paymentMethod = selectedPayment;
      paymentButtons.forEach(function (candidate) {
        candidate.classList.remove("ring-2", "ring-primary", "border-primary", "bg-primary/10");
      });
      button.classList.add("ring-2", "ring-primary", "border-primary", "bg-primary/10");
      queueSync();
    });
    if (cleanLabel(buttonText(button)) === selectedPayment) {
      button.classList.add("ring-2", "ring-primary", "border-primary", "bg-primary/10");
    }
  });

  var form = $one("form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var inputs = $all("input[type='text']", form);
    var cardNumber = (inputs[0] && inputs[0].value || "").replace(/\D/g, "");
    var expiry = inputs[1] ? inputs[1].value.trim() : "";
    var cvc = (inputs[2] && inputs[2].value || "").replace(/\D/g, "");
    var name = inputs[3] ? inputs[3].value.trim() : "";
    if (selectedPayment === "credit card" && (cardNumber.length < 12 || !expiry || cvc.length < 3 || name.length < 2)) {
      toast("Complete the payment details before confirming the booking.", "warn");
      return;
    }

    var draft = window.BYG.appState.bookingDraft || {};
    var confirmation = deepMerge(draft, {
      reference: draft.reference || ("TRP-" + Math.floor(10000 + Math.random() * 89999)),
      paymentMethod: selectedPayment,
      confirmedAt: new Date().toISOString(),
      last4: cardNumber ? cardNumber.slice(-4) : "wallet"
    });

    window.BYG.appState.bookingDraft = confirmation;
    window.BYG.appState.confirmedBookings = [confirmation].concat(window.BYG.appState.confirmedBookings || []).slice(0, 8);
    pushNotification({
      category: "System",
      title: confirmation.title + " confirmed",
      body: "Your booking reference is #" + confirmation.reference + ". Everything is saved to your trips.",
      ctaLabel: "View booking",
      route: route("bookingConfirm")
    });
    queueSync();
    navigate("bookingConfirm");
  });
}

function initBookingConfirm() {
  if (window.location.pathname.indexOf("/traveler/booking-confirm") === -1) return;
  var booking = window.BYG.appState.bookingDraft || (window.BYG.appState.confirmedBookings || [])[0];
  if (!booking) return;

  var title = $one("h1");
  if (title) title.textContent = booking.title || title.textContent;
  var reference = $all(".font-mono").filter(function (node) { return /TRP-/.test(node.textContent); })[0];
  if (reference) reference.textContent = "#" + booking.reference;

  $all("div.flex.gap-3").forEach(function (block) {
    var icon = $one(".material-icons", block);
    var content = block.children[1];
    if (!icon || !content || content.children.length < 3) return;
    if (icon.textContent.trim() === "calendar_today") {
      content.children[1].textContent = booking.dates || content.children[1].textContent;
      content.children[2].textContent = "Time confirmed after checkout";
    }
    if (icon.textContent.trim() === "group") {
      content.children[1].textContent = booking.guests || content.children[1].textContent;
      content.children[2].textContent = "Standard Ticket";
    }
    if (icon.textContent.trim() === "confirmation_number") {
      content.children[1].textContent = "#" + booking.reference;
      content.children[2].textContent = "Saved to Trips";
    }
  });

  bindTextButtons(/modify booking/i, function () { navigate("checkout"); });
  bindTextButtons(/message provider/i, function () {
    openMessageModal("Message Provider", "Send a quick note about your confirmed booking.");
  });
  bindTextButtons(/download ticket/i, function () {
    downloadFile(
      slugify((booking.title || "ticket")) + ".txt",
      "Before You Go Ticket\n\nBooking: " + (booking.title || "") + "\nReference: #" + booking.reference + "\nGuests: " + (booking.guests || "") + "\nDates: " + (booking.dates || "") + "\nPaid via: " + booking.paymentMethod,
      "text/plain"
    );
    toast("Ticket downloaded.", "success");
  });
}

function initNotifications() {
  if (window.location.pathname.indexOf("/traveler/notifications") === -1) return;
  renderStoredNotifications();
  bindTextButtons(/mark all as read/i, function () {
    (window.BYG.appState.notifications || []).forEach(function (item) { item.unread = false; });
    queueSync();
    renderStoredNotifications();
    updateNotificationDots();
    toast("All notifications are marked as read.", "success");
  });
  bindTextButtons(/reply/i, function () { openMessageModal("Reply", "Send a reply from your notification center."); });
  bindTextButtons(/review proposal|view quote|view flight details/i, function () { navigate("tour"); });
  bindTextButtons(/plan a trip/i, function () { navigate("vibe"); });
}

function initGavel() {
  if (window.location.pathname.indexOf("/traveler/gavel") === -1) return;
  bindTextButtons(/open group chat/i, function () { openMessageModal("Group Chat", "Share your thoughts with the group."); });
  bindTextButtons(/^close$/i, function () { navigate("travelerDashboard"); });

  $all("button").forEach(function (button, index) {
    if (!/vote yes|vote no|voted yes|voted no/.test(buttonText(button))) return;
    var card = closestVoteCard(button);
    if (!card) return;
    button.addEventListener("click", function (event) {
      event.preventDefault();
      var cardId = "vote-card-" + index;
      var voteState = window.BYG.appState.votes[cardId] || {
        percent: cardPercent(card),
        votes: cardVotes(card),
        choice: ""
      };
      voteState.choice = /yes/.test(buttonText(button)) ? "yes" : "no";
      voteState.percent = Math.max(0, Math.min(100, voteState.percent + (voteState.choice === "yes" ? 12 : -12)));
      voteState.votes += 1;
      window.BYG.appState.votes[cardId] = voteState;
      applyVoteState(card, voteState);
      queueSync();
      toast("Vote recorded for this itinerary option.", "success");
    });
  });
}

function initRoles() {
  if (window.location.pathname.indexOf("/shared/roles") === -1) return;
  bindTextButtons(/view plans/i, function () { navigate("subscription"); });
  bindTextButtons(/preferences/i, function () { navigate("settings"); });
  bindTextButtons(/apply to be a guide/i, function () {
    openModal({
      title: "Apply As Guide",
      description: "Tell us the specialty you want travelers to notice first.",
      fields: [{ name: "specialty", label: "Specialty", placeholder: "Food tours, hiking, photography..." }],
      confirmLabel: "Switch to Guide",
      onConfirm: function () {
        window.BYG.role = "guide";
        localStorage.setItem("byg_role", "guide");
        queueSync();
        navigate("guideDashboard");
      }
    });
  });
  bindTextButtons(/register as agency/i, function () {
    openModal({
      title: "Register Agency",
      description: "We will use this to seed your agency workspace.",
      fields: [{ name: "agency", label: "Agency Name", placeholder: "Nomad Adventures Co." }],
      confirmLabel: "Open Agency Dashboard",
      onConfirm: function () {
        window.BYG.role = "agency";
        localStorage.setItem("byg_role", "agency");
        queueSync();
        navigate("agencyDashboard");
      }
    });
  });
  bindTextButtons(/save preferences/i, function () {
    queuePageSnapshot();
    toast("Role preferences saved.", "success");
  });
}

function initPreviewAndAI() {
  bindTextButtons(/preview|public view|view public profile/i, function () {
    var fields = collectFields();
    var rows = Object.keys(fields).filter(Boolean).map(function (key) {
      return key.replace(/-/g, " ") + ": " + fields[key];
    }).slice(0, 10);
    openModal({
      title: "Profile Preview",
      description: rows.length ? rows.join("\n") : "Your saved changes will appear here once you add content.",
      confirmLabel: "Looks Good",
      onConfirm: function () {}
    });
  });
}

function handleSave(trigger) {
  queuePageSnapshot();
  syncProfileBuckets();
  if (/save & continue/.test(buttonText(trigger))) {
    toast("Draft saved. Taking you back to the dashboard.", "success");
    navigate(ctx.role === "agency" ? "agencyDashboard" : ctx.role === "guide" ? "guideDashboard" : "travelerDashboard");
    return;
  }
  if (/update password/.test(buttonText(trigger))) {
    toast("Security preferences updated.", "success");
    return;
  }
  toast("Your changes have been saved.", "success");
}

function handleCancel() {
  closeModal();
  hydrateSavedFields();
  toast("Restored the last saved state for this page.");
}

function handleExport(trigger) {
  if (/pdf|print/.test(buttonText(trigger))) {
    window.print();
    toast("Print view opened. Use Save as PDF if you need a file.", "success");
    return;
  }
  var lines = ["Title," + csvValue(document.title)];
  var fields = collectFields();
  Object.keys(fields).forEach(function (key) {
    lines.push(csvValue(key) + "," + csvValue(String(fields[key])));
  });
  downloadFile(slugify(document.title || "before-you-go") + ".csv", lines.join("\n"), "text/csv");
  toast("Export ready.", "success");
}

function handleShare() {
  var href = window.location.href;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(href).then(function () {
      toast("Page link copied to your clipboard.", "success");
    }).catch(function () { toast("Copy failed. The page link is still ready to share."); });
    return;
  }
  toast("Copy this link: " + href);
}

function handleCreate(trigger) {
  var text = buttonText(trigger);
  if (/add custom|add new/.test(text)) {
    openModal({
      title: "Add Item",
      description: "Create a new item for this section.",
      fields: [{ name: "label", label: "Label", placeholder: "Write a short label" }],
      confirmLabel: "Add",
      onConfirm: function (values) {
        if (!values.label) return;
        insertChipNearTrigger(trigger, values.label);
        queuePageSnapshot();
        toast("Added a new item.", "success");
      }
    });
    return;
  }

  if (/add slot/.test(text)) {
    openModal({
      title: "Add Availability Slot",
      description: "Use the same time format shown on the page.",
      fields: [
        { name: "start", label: "Start", placeholder: "09:00 AM" },
        { name: "end", label: "End", placeholder: "12:00 PM" }
      ],
      confirmLabel: "Add Slot",
      onConfirm: function (values) {
        if (!values.start || !values.end) return;
        insertChipNearTrigger(trigger, values.start + " - " + values.end);
        queuePageSnapshot();
        toast("Availability slot added.", "success");
      }
    });
    return;
  }

  openModal({
    title: "Create Something New",
    description: "We will save the intent and keep the next step moving.",
    fields: [{ name: "title", label: "Title", placeholder: "What should we call it?" }],
    confirmLabel: "Save",
    onConfirm: function (values) {
      pushNotification({
        category: "System",
        title: values.title || "New workflow created",
        body: "Your latest action is now saved and ready for follow-up.",
        ctaLabel: "Review Proposal",
        route: route("notifications")
      });
      toast("Saved. You can continue refining it from here.", "success");
    }
  });
}

function handleSwap() {
  pushNotification({
    category: "Alert",
    title: "Weather-safe option applied",
    body: "We saved the alternate plan so your trip can keep moving smoothly.",
    ctaLabel: "View booking",
    route: route("bookingConfirm")
  });
  toast("Swapped to the safer weather option.", "success");
}

function handleReview() {
  openModal({
    title: "Leave A Review",
    description: "Capture the highlight that stood out most from the experience.",
    fields: [
      { name: "headline", label: "Headline", placeholder: "What was memorable?" },
      { name: "review", label: "Review", type: "textarea", placeholder: "Share a short review..." }
    ],
    confirmLabel: "Publish Review",
    onConfirm: function () {
      pushNotification({
        category: "System",
        title: "Review saved",
        body: "Your notes are now attached to this trip and ready to revisit later.",
        ctaLabel: "View booking",
        route: route("bookingConfirm")
      });
      toast("Review saved.", "success");
    }
  });
}

function handleSetupFlow(label) {
  openModal({
    title: "Complete Setup",
    description: "We will save this change and keep your account in sync.",
    fields: [{ name: "details", label: "Details", placeholder: "Add the detail needed for this setup step" }],
    confirmLabel: "Save",
    onConfirm: function () {
      toast(label.replace(/\b\w/g, function (c) { return c.toUpperCase(); }) + " updated.", "success");
    }
  });
}

function handleDelete(trigger) {
  if (/delete account/.test(buttonText(trigger))) {
    signOut();
    toast("Account session cleared on this device.", "warn");
    return;
  }
  var removable = trigger.closest("tr") || trigger.closest(".group") || trigger.closest(".inline-flex") || trigger.closest("button");
  if (removable && removable !== trigger) {
    removable.remove();
    queuePageSnapshot();
    toast("Removed from the page.", "success");
  }
}

function handleRemove(trigger) {
  if (document.querySelector(".byg-modal-backdrop")) {
    closeModal();
    return;
  }
  var removable = trigger.closest(".inline-flex") || trigger.closest("button") || trigger.closest("span");
  if (removable && removable !== trigger && removable.parentElement) {
    removable.remove();
    queuePageSnapshot();
    return;
  }
  toast("Dismissed.");
}

function handlePager(trigger, text) {
  var direction = /left|previous/.test(text) ? -1 : 1;
  var scroller = trigger.closest("section,div");
  while (scroller && scroller !== document.body) {
    if ((scroller.className || "").indexOf("overflow") > -1) break;
    scroller = scroller.parentElement;
  }
  if (scroller && typeof scroller.scrollBy === "function") scroller.scrollBy({ left: direction * 280, behavior: "smooth" });
  else toast(direction > 0 ? "Moved to the next view." : "Moved to the previous view.");
}

function toggleSaved(trigger) {
  trigger.classList.toggle("byg-bookmark-active");
  var icon = $one(".material-icons", trigger);
  if (icon) icon.textContent = icon.textContent.trim() === "bookmark" ? "bookmark_border" : "bookmark";
  toast(icon && icon.textContent.trim() === "bookmark" ? "Saved to your shortlist." : "Removed from your shortlist.");
}

function pickImage(trigger) {
  var input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.style.display = "none";
  document.body.appendChild(input);
  input.addEventListener("change", function () {
    var file = input.files && input.files[0];
    if (!file) { input.remove(); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var targetImage = closestImageTarget(trigger);
      if (targetImage) targetImage.src = reader.result;
      queuePageSnapshot();
      toast("Visual updated for this section.", "success");
      input.remove();
    };
    reader.readAsDataURL(file);
  });
  input.click();
}

function generateCopy(trigger) {
  var textarea = trigger.closest("section,div");
  textarea = textarea && $one("textarea", textarea) || $one("textarea");
  if (!textarea || !window.BYG.callGemini) {
    toast("Pick a text section first so I know where to add the copy.", "warn");
    return;
  }
  var prompt = "Write concise, warm copy for the Before You Go travel platform. Context: " + document.title + ". Existing notes: " + JSON.stringify(collectFields());
  trigger.disabled = true;
  trigger.style.opacity = "0.6";
  window.BYG.callGemini(prompt, "You write polished, concise product copy for a travel marketplace.", { enableTools: false })
    .then(function (response) {
      textarea.value = (response.text || "").replace(/\*\*/g, "").trim();
      queuePageSnapshot();
      toast("Generated fresh copy for this section.", "success");
    })
    .catch(function () { toast("I could not generate copy right now. Try again in a moment.", "warn"); })
    .finally(function () {
      trigger.disabled = false;
      trigger.style.opacity = "1";
    });
}

function renderStoredNotifications() {
  var list = $all("main div").filter(function (node) {
    return (node.className || "").indexOf("space-y-4") > -1 && /flight ua453/i.test(node.textContent);
  })[0];
  if (!list) return;
  $all("[data-byg-generated-notification]", list).forEach(function (node) { node.remove(); });

  (window.BYG.appState.notifications || []).slice(0, 6).reverse().forEach(function (item) {
    var wrapper = document.createElement("div");
    wrapper.setAttribute("data-byg-generated-notification", item.id);
    wrapper.className = "group relative bg-white dark:bg-[#1a2c2a] rounded-xl p-5 shadow-sm border border-l-4 border-slate-100 dark:border-slate-700/50 border-l-primary hover:shadow-md transition-all";
    wrapper.innerHTML = '<div class="flex items-start gap-4"><div class="flex-shrink-0 mt-1"><div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><span class="material-icons">'
      + escapeHtml(notificationIcon(item.category)) + '</span></div></div><div class="flex-grow min-w-0"><div class="flex justify-between items-start"><h3 class="text-base font-semibold text-slate-900 dark:text-white pr-4">'
      + escapeHtml(item.title) + '</h3><span class="flex-shrink-0 text-xs text-slate-400">Now</span></div><p class="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">'
      + escapeHtml(item.body) + '</p><div class="mt-3 flex items-center gap-4"><span class="inline-flex items-center text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">'
      + escapeHtml(item.category) + '</span>' + (item.ctaLabel ? '<button class="text-sm font-medium text-primary hover:underline" data-byg-notification-route="' + escapeHtml(item.route || route("notifications")) + '">' + escapeHtml(item.ctaLabel) + '</button>' : "")
      + '</div></div>' + (item.unread ? '<div class="absolute top-5 right-5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-white dark:ring-[#1a2c2a]"></div>' : '') + '</div>';
    list.insertBefore(wrapper, list.firstChild);
  });

  $all("[data-byg-notification-route]", list).forEach(function (button) {
    button.onclick = function () { navigateTo(button.getAttribute("data-byg-notification-route")); };
  });
}

function pushNotification(notification) {
  notification.id = notification.id || ("n-" + Date.now());
  notification.unread = notification.unread !== false;
  window.BYG.appState.notifications = [notification].concat(window.BYG.appState.notifications || []).slice(0, MAX_NOTIFICATIONS);
  queueSync();
}

function updateNotificationDots() {
  var unread = (window.BYG.appState.notifications || []).filter(function (item) { return item.unread !== false; }).length;
  $all("span").forEach(function (node) {
    if ((node.className || "").indexOf("bg-red-500") > -1 && (node.className || "").indexOf("rounded-full") > -1) {
      node.style.display = unread ? "" : "none";
    }
  });
}

function syncProfileBuckets() {
  var fields = collectFields();
  if (window.location.pathname.indexOf("/shared/settings") > -1) {
    window.BYG.appState.profile.shared = deepMerge(window.BYG.appState.profile.shared, {
      firstName: fields["first-name"] || "",
      lastName: fields["last-name"] || "",
      email: fields.email || "",
      phone: fields.phone || "",
      about: fields.about || ""
    });
    queueSync();
  }
  if (window.location.pathname.indexOf("/guide/profile-builder") > -1) {
    window.BYG.appState.profile.guide = deepMerge(window.BYG.appState.profile.guide, {
      displayName: fields["display-name"] || "",
      tagline: fields.tagline || "",
      bio: fields.bio || ""
    });
    queueSync();
  }
  if (window.location.pathname.indexOf("/agency/profile-builder") > -1) {
    window.BYG.appState.profile.agency = deepMerge(window.BYG.appState.profile.agency, {
      agencyName: fields["agency-name"] || "",
      website: fields.website || "",
      contactEmail: fields["contact-email"] || "",
      mission: fields.mission || ""
    });
    queueSync();
  }
}

function openMessageModal(title, description) {
  openModal({
    title: title,
    description: description,
    fields: [
      { name: "subject", label: "Subject", placeholder: "Short context for the message" },
      { name: "message", label: "Message", type: "textarea", placeholder: "Write your message here..." }
    ],
    confirmLabel: "Send",
    onConfirm: function (values) {
      pushNotification({
        category: "Message",
        title: values.subject || "Message sent",
        body: values.message || "Your message is on its way.",
        ctaLabel: "Reply",
        route: route("notifications")
      });
      toast("Message sent.", "success");
    }
  });
}

function bindTextButtons(pattern, handler) {
  $all("button").filter(function (button) { return pattern.test(cleanLabel(buttonText(button))); }).forEach(function (button) {
    if (button.dataset.bygHandled === "true") return;
    button.dataset.bygHandled = "true";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      handler(button);
    });
  });
}

function navigate(key) { navigateTo(route(key)); }
function navigateTo(path) { if (path) window.location.href = path; }
function route(key) { return (ctx.basePath || "./") + (ROUTES[key] || ROUTES.travelerDashboard); }

function signOut() {
  localStorage.removeItem("byg_role");
  localStorage.removeItem("byg_user_email");
  if (window.BYG.auth && typeof window.BYG.auth.signOut === "function") {
    window.BYG.auth.signOut().catch(function () {}).finally(function () { navigate("signIn"); });
    return;
  }
  navigate("signIn");
}

function closestVoteCard(button) {
  var current = button;
  while (current && current !== document.body) {
    if (/vote yes|voted yes/.test(current.textContent.toLowerCase()) && /%/.test(current.textContent)) return current;
    current = current.parentElement;
  }
  return null;
}

function applyVoteState(card, state) {
  var percent = $all("span", card).filter(function (node) { return /^\d+%$/.test(node.textContent.trim()); })[0];
  if (percent) percent.textContent = state.percent + "%";
  var fill = $all("div", card).filter(function (node) { return /Votes/.test(node.textContent) && node.style && node.style.width; })[0];
  if (fill) {
    fill.style.width = state.percent + "%";
    fill.textContent = state.votes + " Votes";
  }
  $all("button", card).forEach(function (button) {
    var yes = /yes/.test(buttonText(button));
    button.classList.remove("bg-primary", "text-white", "opacity-60");
    if ((state.choice === "yes" && yes) || (state.choice === "no" && !yes)) button.classList.add("bg-primary", "text-white");
    else button.classList.add("opacity-60");
  });
}

function cardPercent(card) {
  var match = card.textContent.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 50;
}

function cardVotes(card) {
  var match = card.textContent.match(/(\d+)\s+Votes/i);
  return match ? parseInt(match[1], 10) : 1;
}

function insertChipBeforeInput(input, label) {
  var chip = document.createElement("span");
  chip.className = "inline-flex items-center px-2.5 py-1 rounded bg-primary/10 text-primary text-sm font-medium";
  chip.innerHTML = escapeHtml(label) + ' <button type="button" class="ml-1 hover:text-primary-dark"><span class="material-icons text-[14px]">close</span></button>';
  input.parentElement.insertBefore(chip, input);
}

function insertChipNearTrigger(trigger, label) {
  var chip = document.createElement("button");
  chip.type = "button";
  chip.className = "px-4 py-2 rounded-full text-sm font-medium bg-primary text-white shadow-sm shadow-primary/30 flex items-center gap-2";
  chip.innerHTML = escapeHtml(label) + ' <span class="material-icons text-[14px]">close</span>';
  trigger.parentElement.insertBefore(chip, trigger);
}

function closestImageTarget(trigger) {
  var current = trigger;
  while (current && current !== document.body) {
    var image = $one("img", current.parentElement || current);
    if (image) return image;
    current = current.parentElement;
  }
  return $one("img");
}

function collectFields() {
  var values = {};
  $all("input, select, textarea").forEach(function (field) {
    var key = fieldKey(field);
    if (!key || isSensitiveField(field)) return;
    if (field.type === "checkbox") values[key] = field.checked;
    else if (field.type === "radio") { if (field.checked) values[key] = field.value; }
    else values[key] = field.value;
  });
  return values;
}

function fieldKey(field) {
  return field.id || field.name || (field.placeholder ? slugify(field.placeholder).slice(0, 32) : "");
}

function setFieldValue(id, value) {
  var field = document.getElementById(id);
  if (field && !field.value) field.value = value;
}

function isSensitiveField(field) {
  var token = [field.type, field.id, field.name, field.placeholder].join(" ").toLowerCase();
  return /password|card|cvc|cvv|expiry/.test(token);
}

function notificationIcon(category) {
  if (/message/i.test(category)) return "chat";
  if (/quote/i.test(category)) return "description";
  if (/alert/i.test(category)) return "warning";
  return "check_circle";
}

function matchScore(card) {
  var match = card.textContent.match(/(\d+)%\s*Match/i);
  return match ? parseInt(match[1], 10) : 0;
}

function cleanLabel(value) {
  return (value || "").replace(/\s+/g, " ").trim().toLowerCase().replace(/\(\d+\)/g, "").trim();
}

function buttonText(button) {
  return cleanLabel((button && (button.getAttribute("aria-label") || button.textContent)) || "");
}

function findButton(pattern) {
  return $all("button").filter(function (button) { return pattern.test(buttonText(button)); })[0];
}

function csvValue(value) {
  return '"' + String(value || "").replace(/"/g, '""') + '"';
}

function downloadFile(name, content, type) {
  var blob = new Blob([content], { type: type || "text/plain" });
  var url = URL.createObjectURL(blob);
  var link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 500);
}

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
  return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeParse(raw) {
  try { return raw ? JSON.parse(raw) : {}; } catch (_) { return {}; }
}

function deepMerge(base, incoming) {
  if (!incoming) return base;
  if (Array.isArray(base) || Array.isArray(incoming)) return incoming;
  var output = {};
  Object.keys(base || {}).forEach(function (key) { output[key] = base[key]; });
  Object.keys(incoming || {}).forEach(function (key) {
    if (incoming[key] && typeof incoming[key] === "object" && !Array.isArray(incoming[key]) && output[key] && typeof output[key] === "object" && !Array.isArray(output[key])) output[key] = deepMerge(output[key], incoming[key]);
    else output[key] = incoming[key];
  });
  return output;
}

function getPageKey() {
  var parts = (window.location.pathname || "").split("/").filter(Boolean);
  if (!parts.length) return "home";
  return (parts.length > 1 ? parts[parts.length - 2] : "root") + "-" + parts[parts.length - 1].replace(".html", "");
}

function $one(selector, root) { return (root || document).querySelector(selector); }
function $all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

window.BYGPlatformExperience = { init: init };

})();
