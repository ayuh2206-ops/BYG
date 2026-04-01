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
  pastTrips: "pages/traveler/past-trips.html",
  gavel: "pages/traveler/gavel.html",
  weatherSwap: "pages/traveler/weather-swap.html",
  settings: "pages/shared/settings.html",
  roles: "pages/shared/roles.html",
  subscription: "pages/shared/subscription.html",
  security: "pages/shared/security.html",
  payStatus: "pages/shared/payment-status.html",
  payout: "pages/shared/payout-setup.html",
  signIn: "pages/public/signin.html",
  guideClients: "pages/guide/clients.html",
  guideAvail: "pages/guide/availability.html",
  guideProfile: "pages/guide/profile-builder.html",
  agencyAnalytics: "pages/agency/analytics.html",
  agencyTour: "pages/agency/tour-builder.html",
  agencyCalendar: "pages/agency/calendar.html",
  agencyBookings: "pages/agency/participants.html",
  agencyTeam: "pages/agency/team.html",
  agencyProfile: "pages/agency/profile-builder.html"
};

var QUIZ_QUESTIONS = [
  { id:"morning",title:"What kind of morning person are you?",subtitle:"This helps us gauge how active your itinerary should be.",options:[{icon:"wb_sunny",title:"Sunrise Hiker",description:"Up before the sun to catch the first light on the peaks."},{icon:"local_cafe",title:"Coffee Dreamer",description:"Slow starts with a latte and people watching."},{icon:"snooze",title:"No Alarm Needed",description:"I wake up naturally whenever my body is ready."},{icon:"fitness_center",title:"Early Burn",description:"A workout or run is the best way to start the day."}]},
  { id:"tempo",title:"How do you like your travel days to feel?",subtitle:"We use this to balance structure with spontaneity.",options:[{icon:"bolt",title:"Packed & Electric",description:"I want every hour to feel alive and intentional."},{icon:"self_improvement",title:"Calm & Spacious",description:"Leave room to wander, breathe, and reset."},{icon:"shuffle",title:"Balanced",description:"A few anchor moments with plenty of flexibility."},{icon:"groups",title:"Social Momentum",description:"I like my plans to orbit around people and energy."}]},
  { id:"scene",title:"Which setting feels most like you right now?",subtitle:"Your instinctive choice helps us shape your destination mix.",options:[{icon:"nights_stay",title:"Neon City",description:"Street food, late nights, and sensory overload."},{icon:"terrain",title:"Alpine Escape",description:"Crisp air, elevation, and cinematic landscapes."},{icon:"forest",title:"Forest Retreat",description:"Green silence, cabins, and grounding walks."},{icon:"beach_access",title:"Island Slowdown",description:"Salt air, easy afternoons, and turquoise water."}]},
  { id:"food",title:"What role should food play in the trip?",subtitle:"Cuisine is often the fastest route to a memorable itinerary.",options:[{icon:"ramen_dining",title:"Major Theme",description:"Food should be one of the core reasons to go."},{icon:"restaurant",title:"Curated Highlights",description:"A few unforgettable meals are enough for me."},{icon:"bakery_dining",title:"Local Casual",description:"I care more about neighborhood spots than fine dining."},{icon:"emoji_food_beverage",title:"Nice Bonus",description:"Good food matters, but it does not need to lead."}]},
  { id:"style",title:"How should this next trip leave you feeling?",subtitle:"This final signal sharpens the recommendation tone.",options:[{icon:"auto_awesome",title:"Re-inspired",description:"I want to come back full of new ideas and energy."},{icon:"spa",title:"Restored",description:"I need softness, ease, and recovery time."},{icon:"camera_alt",title:"Story-Rich",description:"Give me strong visuals and shareable moments."},{icon:"explore",title:"Changed",description:"I want a place that stretches how I think and feel."}]},
  { id:"transit",title:"How do you prefer to get around?",subtitle:"Determines how we map out your route.",options:[{icon:"directions_walk",title:"Walking Everywhere",description:"I love exploring on foot at my own pace."},{icon:"subway",title:"Public Transit",description:"Immersing in the local commuter lifestyle."},{icon:"car_rental",title:"Rental Car",description:"I prefer total freedom and scenic drives."},{icon:"local_taxi",title:"Taxis/Rideshares",description:"Quick, easy, and direct from point A to B."}]},
  { id:"packing",title:"What's your packing style?",subtitle:"Helps us suggest suitable activities.",options:[{icon:"backpack",title:"Carry-on Only",description:"Minimalist and highly mobile at all times."},{icon:"luggage",title:"Checked Bag Ready",description:"I bring options for every possible occasion."},{icon:"shopping_bag",title:"Just Buy It There",description:"I pack extreme light and shop locally."},{icon:"work",title:"Professional",description:"Clean, organized, and somewhat structured."}]},
  { id:"planning",title:"How much planning do you like?",subtitle:"Sets the tone for our itinerary builder.",options:[{icon:"schedule",title:"Minute-by-minute",description:"Everything perfectly mapped out in advance."},{icon:"event_note",title:"Anchor Reservations",description:"Just the big dinners and flights sorted."},{icon:"signpost",title:"See Where the Wind Blows",description:"A very loose idea of what to do each day."},{icon:"casino",title:"Total Spontaneity",description:"I literally decide when I wake up that day."}]},
  { id:"groupsize",title:"Ideal travel group size?",subtitle:"Shapes the scale of standard recommendations.",options:[{icon:"person",title:"Solo Mission",description:"Just me, my thoughts, and total freedom."},{icon:"favorite",title:"Couples Retreat",description:"A romantic or tight-knit duo getaway."},{icon:"group",title:"Small Squad",description:"3-5 close friends or family members."},{icon:"groups_3",title:"Large Crowd",description:"The more the merrier! Big energetic groups."}]},
  { id:"budget",title:"What's your budget philosophy?",subtitle:"Helps target appropriately priced options.",options:[{icon:"diamond",title:"Luxury",description:"Five-star absolute comfort from start to finish."},{icon:"balance",title:"Value-focused",description:"Great quality without the ridiculous markups."},{icon:"savings",title:"Shoestring",description:"Hostels, street food, and free walking tours."},{icon:"star_half",title:"Splurge & Save",description:"Cheap stays but heavy spending on experiences."}]},
  { id:"terrain",title:"Which terrain calls to you?",subtitle:"A deeper dive into geography preference.",options:[{icon:"landscape",title:"Mountains",description:"High altitudes and dramatic peaks."},{icon:"beach_access",title:"Beaches",description:"Soft sand and crashing waves."},{icon:"location_city",title:"City Streets",description:"Concrete jungles, neon signs, and alleys."},{icon:"eco",title:"Deep Jungle",description:"Lush canopies and exotic wildlife."}]},
  { id:"activity",title:"How active are you on trips?",subtitle:"Calibrates the physical exertion needed.",options:[{icon:"kitesurfing",title:"Adrenaline Junkie",description:"Extreme sports and pushing limits."},{icon:"hiking",title:"Moderate Hiking",description:"A decent 3 hour trail with a nice view."},{icon:"directions_walk",title:"Casual Walks",description:"Strolling through museums and parks."},{icon:"pool",title:"Poolside Lounging",description:"Zero cardio. Strictly relaxation."}]},
  { id:"evening",title:"What's your evening vibe?",subtitle:"For those post-sunset recommendations.",options:[{icon:"nightlife",title:"Clubbing",description:"Out until the sun decides to come up."},{icon:"sports_bar",title:"Cozy Pubs",description:"Good drinks, quiet tones, deep talks."},{icon:"restaurant_menu",title:"Nice Dinner",description:"A beautiful meal, then back to the room."},{icon:"theater_comedy",title:"Culture/Shows",description:"Catching local theater or a live music gig."}]},
  { id:"adapt",title:"How do you handle plan changes?",subtitle:"Gives us insight on managing itinerary stress.",options:[{icon:"celebration",title:"Bring It On",description:"Changes just mean more unexpected adventure!"},{icon:"waves",title:"Roll With It",description:"I can easily pivot when things go wrong."},{icon:"psychology",title:"A Bit Stressed",description:"I'll adapt, but I definitely need a moment."},{icon:"error",title:"Absolute Panic",description:"I strictly need things to go exactly as planned."}]},
  { id:"goal",title:"Main goal of this trip?",subtitle:"The core driving force behind going away.",options:[{icon:"wifi_off",title:"Disconnect",description:"Unplugging completely from the digital world."},{icon:"school",title:"Learn & Evolve",description:"Soaking in profound cultural lessons."},{icon:"flight_takeoff",title:"Thrill Seeking",description:"Escaping boredom with fast pacing."},{icon:"volunteer_activism",title:"Bonding",description:"Deepening relationships with my travel partners."}]}
];

// ===== INIT =====
function init(options) {
  ctx = deepMerge(ctx, options || {});
  return ensureState().then(function () {
    ensurePlatformUi();
    hydrateSavedFields();
    hydrateProfileDefaults();
    bindFieldPersistence();
    bindFallbackActions();
    initTravelerHome(); initTravelerDashboard(); initQuiz(); initVibeSearch();
    initTourDetail(); initCheckout(); initBookingConfirm(); initNotifications();
    initGavel(); initWeatherSwap(); initPastTrips();
    initGuideDashboard(); initGuideClients(); initGuideProfileBuilder(); initGuideAvailability();
    initAgencyDashboard(); initAgencyTourBuilder(); initAgencyBookings(); initAgencyTeam(); initAgencyAnalytics();
    initRoles(); initSettingsPages(); initPreviewAndAI();
    updateNotificationDots();
  });
}

// ===== STATE =====
function ensureState() {
  if (window.BYG.appState) return Promise.resolve(window.BYG.appState);
  if (stateLoadPromise) return stateLoadPromise;
  stateLoadPromise = Promise.resolve().then(function () {
    var ns = deepMerge(getDefaultState(), safeParse(localStorage.getItem(APP_STATE_KEY)));
    if (window.BYG.db && window.BYG.user && window.location.protocol !== "file:") {
      return window.BYG.db.getDoc(window.BYG.db.doc(window.BYG.db.instance,"users",window.BYG.user.uid,"appState","platform")).then(function(s){if(s.exists())ns=deepMerge(ns,s.data());window.BYG.appState=ns;return ns;}).catch(function(){window.BYG.appState=ns;return ns;});
    }
    window.BYG.appState = ns; return ns;
  });
  return stateLoadPromise;
}
function getDefaultState() {
  return {version:2,pageState:{},profile:{shared:{},guide:{},agency:{}},quiz:{currentIndex:0,answers:{},completed:false},vibe:{selectedMood:DEFAULT_MOOD,bookmarks:[]},bookingDraft:null,confirmedBookings:[],notifications:[],votes:{},trips:[],quotes:[],reviews:[],activeTab:{}};
}
function ensurePageState() {
  var k=getPageKey();if(!window.BYG.appState.pageState[k])window.BYG.appState.pageState[k]={selections:{},formData:{}};return window.BYG.appState.pageState[k];
}
function queueSync() {
  clearTimeout(stateSyncTimer);localStorage.setItem(APP_STATE_KEY,JSON.stringify(window.BYG.appState));
  stateSyncTimer=setTimeout(function(){if(!window.BYG.db||!window.BYG.user||window.location.protocol==="file:")return;window.BYG.db.setDoc(window.BYG.db.doc(window.BYG.db.instance,"users",window.BYG.user.uid,"appState","platform"),window.BYG.appState,{merge:true}).catch(function(){});},800);
}

// ===== UI: Toast, Modal, Context Menu =====
function ensurePlatformUi() {
  if (document.getElementById("byg-toast-container")) return;
  var c=document.createElement("div");c.id="byg-toast-container";c.style.cssText="position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;";document.body.appendChild(c);
  var m=document.createElement("div");m.id="byg-context-menu";m.style.cssText="position:fixed;z-index:9998;display:none;";document.body.appendChild(m);
  document.addEventListener("click",function(e){if(!e.target.closest("#byg-context-menu"))hideContextMenu();});
}
function toast(msg,tone) {
  var c=document.getElementById("byg-toast-container");if(!c)return;var bg={success:"#14b8a5",warn:"#f59e0b",error:"#ef4444"}[tone]||"#1e293b";
  var el=document.createElement("div");el.style.cssText="pointer-events:auto;color:white;padding:12px 20px;border-radius:12px;font-size:14px;font-family:Lexend,sans-serif;box-shadow:0 8px 32px rgba(0,0,0,0.18);max-width:380px;animation:slideUp .3s ease;background:"+bg;
  el.textContent=msg;c.appendChild(el);setTimeout(function(){el.remove();},3200);
}

function openModal(cfg) {
  closeModal();
  var bd=document.createElement("div");bd.className="byg-modal";bd.style.cssText="position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);animation:fadeIn .2s ease;";
  var fh="";
  (cfg.fields||[]).forEach(function(f){
    var lbl='<label style="display:block;font-size:13px;font-weight:600;color:#64748b;margin-bottom:4px">'+f.label+'</label>';
    var st='style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:Lexend,sans-serif;"';
    if(f.type==="select"){var opts=(f.options||[]).map(function(o){return'<option value="'+o.value+'"'+(o.selected?' selected':'')+'>'+o.label+'</option>';}).join("");fh+='<div style="margin-top:12px">'+lbl+'<select data-byg-field="'+f.name+'" '+st+' style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:Lexend,sans-serif;background:white;">'+opts+'</select></div>';}
    else if(f.type==="textarea"){fh+='<div style="margin-top:12px">'+lbl+'<textarea data-byg-field="'+f.name+'" rows="3" placeholder="'+(f.placeholder||'')+'" '+st+' style="width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;font-family:Lexend,sans-serif;resize:vertical;">'+(f.value||'')+'</textarea></div>';}
    else if(f.type==="date"){fh+='<div style="margin-top:12px">'+lbl+'<input type="date" data-byg-field="'+f.name+'" value="'+(f.value||'')+'" '+st+'></div>';}
    else if(f.type==="number"){fh+='<div style="margin-top:12px">'+lbl+'<input type="number" data-byg-field="'+f.name+'" value="'+(f.value||'')+'" placeholder="'+(f.placeholder||'')+'" min="'+(f.min||0)+'" '+st+'></div>';}
    else if(f.type==="radio-cards"){fh+='<div style="margin-top:12px"><label style="display:block;font-size:13px;font-weight:600;color:#64748b;margin-bottom:8px">'+f.label+'</label><div style="display:grid;grid-template-columns:repeat('+(f.columns||3)+',1fr);gap:8px">';(f.options||[]).forEach(function(o){fh+='<button type="button" data-byg-radio="'+f.name+'" data-value="'+o.value+'" style="padding:12px;border:2px solid #e2e8f0;border-radius:12px;text-align:center;cursor:pointer;background:white;transition:all .2s"><span class="material-icons" style="display:block;font-size:24px;color:#14b8a5;margin-bottom:4px">'+(o.icon||'check')+'</span><span style="font-size:13px;font-weight:600;color:#334155">'+o.label+'</span>'+(o.desc?'<span style="display:block;font-size:11px;color:#94a3b8;margin-top:2px">'+o.desc+'</span>':'')+'</button>';});fh+='</div></div>';}
    else{fh+='<div style="margin-top:12px">'+lbl+'<input type="text" data-byg-field="'+f.name+'" value="'+(f.value||'')+'" placeholder="'+(f.placeholder||'')+'" '+st+'></div>';}
  });
  var secBtn=cfg.secondaryLabel?'<button class="byg-secondary" style="flex:1;padding:12px;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:Lexend,sans-serif;background:white;color:#64748b">'+cfg.secondaryLabel+'</button>':'';
  bd.innerHTML='<div style="background:white;border-radius:20px;padding:28px;width:100%;max-width:'+(cfg.maxWidth||'440px')+';max-height:85vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,0.15);animation:slideUp .3s ease"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><h3 style="font-size:20px;font-weight:700;color:#0f172a;font-family:Lexend,sans-serif">'+cfg.title+'</h3><button class="byg-modal-close" style="background:none;border:none;cursor:pointer;padding:4px"><span class="material-icons" style="color:#94a3b8;font-size:22px">close</span></button></div>'+(cfg.description?'<p style="color:#64748b;font-size:14px;line-height:1.5;margin-top:4px;white-space:pre-line">'+cfg.description+'</p>':'')+(cfg.customHtml||'')+fh+'<div style="display:flex;gap:10px;margin-top:20px">'+secBtn+'<button class="byg-primary" style="flex:1;padding:12px;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:Lexend,sans-serif;color:white;background:linear-gradient(135deg,#F97316,#EA580C);box-shadow:0 4px 14px rgba(249,115,22,0.3)">'+(cfg.confirmLabel||'Confirm')+'</button></div></div>';
  document.body.appendChild(bd);
  $all("[data-byg-radio]",bd).forEach(function(btn){btn.addEventListener("click",function(){var g=btn.getAttribute("data-byg-radio");$all('[data-byg-radio="'+g+'"]',bd).forEach(function(b){b.style.borderColor="#e2e8f0";b.style.background="white";});btn.style.borderColor="#F97316";btn.style.background="rgba(249,115,22,0.06)";});});
  bd.querySelector(".byg-modal-close").addEventListener("click",function(){closeModal();});
  bd.addEventListener("click",function(e){if(e.target===bd)closeModal();});
  bd.querySelector(".byg-primary").addEventListener("click",function(){
    var vals={};$all("[data-byg-field]",bd).forEach(function(f){vals[f.getAttribute("data-byg-field")]=f.value;});
    $all("[data-byg-radio]",bd).forEach(function(b){if(b.style.borderColor==="rgb(249, 115, 22)")vals[b.getAttribute("data-byg-radio")]=b.getAttribute("data-value");});
    closeModal();if(cfg.onConfirm)cfg.onConfirm(vals);
  });
  if(cfg.secondaryLabel){bd.querySelector(".byg-secondary").addEventListener("click",function(){closeModal();if(cfg.onSecondary)cfg.onSecondary();});}
}
function closeModal(){$all(".byg-modal").forEach(function(m){m.remove();});}

function showContextMenu(x,y,items) {
  hideContextMenu();var menu=document.getElementById("byg-context-menu");if(!menu)return;
  var h='<div style="background:white;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,0.15);border:1px solid #e2e8f0;min-width:180px;overflow:hidden;animation:slideUp .15s ease">';
  items.forEach(function(item){if(item.divider){h+='<div style="height:1px;background:#f1f5f9;margin:4px 0"></div>';return;}var color=item.danger?"#ef4444":"#334155";h+='<button data-ctx-action="'+item.action+'" style="display:flex;align-items:center;gap:10px;width:100%;padding:10px 16px;border:none;background:white;cursor:pointer;font-size:13px;font-weight:500;color:'+color+';font-family:Lexend,sans-serif;text-align:left;transition:background .15s" onmouseenter="this.style.background=\'#f8fafc\'" onmouseleave="this.style.background=\'white\'"><span class="material-icons" style="font-size:18px;color:'+(item.danger?'#ef4444':'#94a3b8')+'">'+item.icon+'</span>'+item.label+'</button>';});
  h+='</div>';menu.innerHTML=h;menu.style.display="block";
  var left=Math.min(x,window.innerWidth-200-16),top=Math.min(y,window.innerHeight-200-16);menu.style.left=left+"px";menu.style.top=top+"px";
  $all("[data-ctx-action]",menu).forEach(function(btn){btn.addEventListener("click",function(e){e.stopPropagation();hideContextMenu();var it=items.filter(function(i){return i.action===btn.getAttribute("data-ctx-action");})[0];if(it&&it.handler)it.handler();});});
}
function hideContextMenu(){var m=document.getElementById("byg-context-menu");if(m){m.style.display="none";m.innerHTML="";}}

// ===== TRIP CRUD =====
function createTrip(d){var t=deepMerge({id:"trip-"+Date.now(),title:d.title||"New Trip",destination:d.destination||"",type:d.type||"diy",status:"planning",startDate:d.startDate||"",endDate:d.endDate||"",travelers:d.travelers||1,createdAt:new Date().toISOString()},d);window.BYG.appState.trips=[t].concat(window.BYG.appState.trips||[]);pushNotification({category:"Trip",title:"Trip created: "+t.title,body:t.destination+" — start adding activities!",ctaLabel:"View trip",route:route("tour")});queueSync();return t;}
function createQuote(d){var q=deepMerge({id:"quote-"+Date.now(),status:"new",createdAt:new Date().toISOString()},d);window.BYG.appState.quotes=[q].concat(window.BYG.appState.quotes||[]);queueSync();return q;}

// ===== TRAVELER: Home =====
function initTravelerHome(){if(window.location.pathname.indexOf("/traveler/home")===-1)return;bindTextButtons(/find your trip|discover your travel dna|get started for free/i,function(){navigate(window.BYG.appState.quiz.completed?"vibe":"quiz");});}

// ===== TRAVELER: Dashboard =====
function initTravelerDashboard(){
  if(window.location.pathname.indexOf("/traveler/dashboard")===-1)return;
  // Create New Trip
  bindTextButtons(/create new trip/i,function(){
    openModal({title:"Create a New Trip",description:"Choose how you want to plan your next adventure.",maxWidth:"520px",
      fields:[{name:"destination",label:"Where to?",placeholder:"e.g. Kyoto, Japan"},{name:"title",label:"Trip Name",placeholder:"e.g. Golden Week in Kyoto"},{name:"startDate",label:"Start Date",type:"date"},{name:"endDate",label:"End Date",type:"date"},{name:"travelers",label:"Travelers",type:"number",value:"1",min:1},{name:"type",label:"Planning Style",type:"radio-cards",columns:3,options:[{value:"diy",icon:"edit_note",label:"DIY",desc:"Plan it yourself"},{value:"guided",icon:"tour",label:"Hire Guide",desc:"Expert-led"},{value:"agency",icon:"business",label:"Book Tour",desc:"Pre-packaged"}]}],
      confirmLabel:"Create Trip",onConfirm:function(v){if(!v.destination){toast("Please enter a destination.","warn");return;}createTrip({title:v.title||v.destination+" Trip",destination:v.destination,startDate:v.startDate,endDate:v.endDate,travelers:parseInt(v.travelers)||1,type:v.type||"diy"});toast("Trip created! Let's start planning.","success");if(v.type==="guided")navigate("home");else if(v.type==="agency")navigate("home");else navigate("vibe");}});
  });
  // Tab filters
  var tabCont=$all("div").filter(function(d){return d.children.length>=2&&/upcoming/i.test(d.textContent)&&/planning/i.test(d.textContent)&&d.querySelector("button");})[0];
  var cardGrid=$one(".grid.grid-cols-1");
  if(tabCont&&cardGrid){
    var tabs=$all("button",tabCont);var cards=$all(":scope > *",cardGrid);
    tabs.forEach(function(tab){tab.addEventListener("click",function(){
      tabs.forEach(function(t){t.classList.remove("border-primary","text-primary","font-semibold");t.classList.add("border-transparent","text-slate-500");});
      tab.classList.remove("border-transparent","text-slate-500");tab.classList.add("border-primary","text-primary","font-semibold");
      var label=cleanLabel(buttonText(tab));
      cards.forEach(function(card){var st=card.querySelector("[class*='uppercase']");var status=st?cleanLabel(st.textContent):"";
        if(/upcoming/.test(label))card.style.display=/confirmed|upcoming|active/.test(status)?"":"none";
        else if(/planning/.test(label))card.style.display=/planning|draft/.test(status)?"":"none";
        else if(/past/.test(label))card.style.display=/completed|past|cancelled/.test(status)?"":"none";
        else card.style.display="";
      });
    });});
  }
  // View Itinerary / Resume
  bindTextButtons(/view itinerary/i,function(){window.BYG.appState.bookingDraft=window.BYG.appState.bookingDraft||{};window.BYG.appState.bookingDraft.title="Bali Retreat";queueSync();navigate("tour");});
  bindTextButtons(/^resume$/i,function(){navigate("vibe");});
  // Context menus on more_vert
  $all("button").filter(function(b){return/^more_vert$/.test(buttonText(b).trim());}).forEach(function(btn){
    btn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();
      var card=btn.closest("[class*='rounded-xl']")||btn.closest("[class*='rounded-2xl']");
      var tEl=card?card.querySelector("h3"):null;var tripTitle=tEl?tEl.textContent.trim():"this trip";
      var rect=btn.getBoundingClientRect();
      showContextMenu(rect.left,rect.bottom+4,[
        {icon:"visibility",label:"View Details",action:"view",handler:function(){navigate("tour");}},
        {icon:"edit",label:"Edit Trip",action:"edit",handler:function(){openModal({title:"Edit: "+tripTitle,fields:[{name:"title",label:"Trip Name",value:tripTitle},{name:"startDate",label:"Start Date",type:"date"},{name:"endDate",label:"End Date",type:"date"}],confirmLabel:"Save Changes",onConfirm:function(v){toast(tripTitle+" updated.","success");if(v.title&&tEl)tEl.textContent=v.title;queueSync();}});}},
        {icon:"group_add",label:"Invite Travelers",action:"invite",handler:function(){openModal({title:"Invite to "+tripTitle,fields:[{name:"email",label:"Email",placeholder:"friend@email.com"}],confirmLabel:"Send Invite",onConfirm:function(v){if(v.email){pushNotification({category:"Trip",title:"Invite sent",body:v.email+" invited to "+tripTitle,ctaLabel:"View",route:route("gavel")});toast("Invitation sent to "+v.email,"success");}}});}},
        {icon:"share",label:"Share Trip",action:"share",handler:handleShare},
        {divider:true},
        {icon:"delete",label:"Delete Trip",action:"delete",danger:true,handler:function(){openModal({title:"Delete "+tripTitle+"?",description:"This will permanently remove the trip. This cannot be undone.",confirmLabel:"Delete Trip",onConfirm:function(){if(card){card.style.transition="opacity .3s,transform .3s";card.style.opacity="0";card.style.transform="scale(0.95)";setTimeout(function(){card.remove();},300);}toast(tripTitle+" deleted.","success");}});}}
      ]);
    });
  });
  // Carousel
  var sc=$one(".flex.overflow-x-auto");
  bindTextButtons(/^chevron_left$/i,function(){if(sc)sc.scrollBy({left:-320,behavior:"smooth"});});
  bindTextButtons(/^chevron_right$/i,function(){if(sc)sc.scrollBy({left:320,behavior:"smooth"});});
  bindTextButtons(/^notifications$/i,function(){navigate("notifications");});
}

// ===== TRAVELER: Vibe Search =====
function initVibeSearch(){
  if(window.location.pathname.indexOf("/traveler/vibe-search")===-1)return;
  var moodGrid=$all("div.grid").filter(function(g){return(g.className||"").indexOf("auto-rows")>-1;})[0];if(!moodGrid)return;
  var moodCards=$all(":scope > div",moodGrid);
  var resultsLabel=$all("span").filter(function(s){return/Results based on/i.test(s.textContent);})[0];
  var resultCards=$all("div").filter(function(c){return(c.querySelector("[class*='bg-green']")||c.querySelector("[class*='bg-amber']")||c.querySelector("[class*='bg-blue']"))&&c.querySelector("img")&&c.querySelector("h3");});
  function moodLabel(c){return $all("span",c).map(function(s){return s.textContent.trim();}).filter(Boolean).slice(-1)[0]||DEFAULT_MOOD;}
  function applyMood(label){window.BYG.appState.vibe.selectedMood=label;moodCards.forEach(function(c){c.style.outline="";});moodCards.filter(function(c){return moodLabel(c)===label;}).forEach(function(c){c.style.outline="3px solid #F97316";c.style.outlineOffset="2px";});if(resultsLabel)resultsLabel.textContent="Results based on: "+label;queueSync();}
  moodCards.forEach(function(c){c.style.cursor="pointer";c.addEventListener("click",function(){applyMood(moodLabel(c));});});
  if(window.BYG.appState.vibe.selectedMood!==DEFAULT_MOOD)applyMood(window.BYG.appState.vibe.selectedMood);
  var analyzeBtn=findButton(/analyze my vibe/i);if(analyzeBtn){analyzeBtn.addEventListener("click",function(e){e.preventDefault();analyzeBtn.innerHTML='<span class="material-icons animate-spin text-base mr-1">sync</span> Analyzing...';setTimeout(function(){resultCards.sort(function(a,b){return matchScore(b)-matchScore(a);}).forEach(function(c){c.parentElement.appendChild(c);});analyzeBtn.innerHTML='<span class="material-icons text-base mr-1">check</span> Updated';toast("Results re-ranked by your vibe.","success");setTimeout(function(){analyzeBtn.textContent="Analyze My Vibe";},2000);},800);});}
  var clearBtn=findButton(/clear selection/i);if(clearBtn){clearBtn.addEventListener("click",function(e){e.preventDefault();moodCards.forEach(function(c){c.style.outline="";});window.BYG.appState.vibe.selectedMood=DEFAULT_MOOD;if(resultsLabel)resultsLabel.textContent="Results based on: "+DEFAULT_MOOD;queueSync();toast("Selection cleared.","success");});}
  var sortBtn=findButton(/sort by match/i);if(sortBtn){sortBtn.addEventListener("click",function(e){e.preventDefault();resultCards.sort(function(a,b){return matchScore(b)-matchScore(a);}).forEach(function(c){c.parentElement.appendChild(c);});toast("Sorted by match percentage.","success");});}
  // Bookmarks
  $all("button").filter(function(b){return/bookmark/.test(buttonText(b));}).forEach(function(btn){btn.addEventListener("click",function(e){e.preventDefault();var icon=btn.querySelector(".material-icons");if(!icon)return;if(icon.textContent==="bookmark_border"){icon.textContent="bookmark";icon.style.color="#F97316";toast("Saved to bookmarks.","success");}else{icon.textContent="bookmark_border";icon.style.color="";toast("Removed from bookmarks.","success");}queueSync();});});
  bindTextButtons(/show more matches/i,function(){resultCards.forEach(function(c){c.style.display="";});toast("Showing all matches.","success");});
}

// ===== TRAVELER: Tour Detail =====
function initTourDetail(){
  if(window.location.pathname.indexOf("/traveler/tour-detail")===-1)return;
  var price=$all("span").filter(function(s){return/^\$\d/.test(s.textContent.trim());})[0];
  var title=$one("h1")||$one("h2");
  var draft={title:title?title.textContent.trim():"Experience",price:price?price.textContent.trim():"$450",dates:"",guests:""};
  var form=$one("form");if(form){form.addEventListener("submit",function(e){e.preventDefault();$all("input,select",form).forEach(function(i){if(/date/i.test(i.name||i.placeholder||""))draft.dates=i.value;if(/guest|travel/i.test(i.name||i.placeholder||""))draft.guests=i.value;});if(!draft.dates){toast("Please select travel dates.","warn");return;}draft.reference="TRP-"+Math.floor(10000+Math.random()*89999);window.BYG.appState.bookingDraft=draft;queueSync();navigate("checkout");});}
  bindTextButtons(/^book now$/i,function(){draft.reference="TRP-"+Math.floor(10000+Math.random()*89999);draft.dates=draft.dates||"Flexible Dates";draft.guests=draft.guests||"2 Travelers";window.BYG.appState.bookingDraft=draft;queueSync();navigate("checkout");});
  bindTextButtons(/request quote/i,function(){openModal({title:"Request a Quote",description:"The host will respond within 24 hours.",fields:[{name:"dates",label:"Preferred Dates",type:"date"},{name:"guests",label:"Guests",type:"number",value:"2",min:1},{name:"message",label:"Special Requests",type:"textarea",placeholder:"Dietary needs, accessibility..."}],confirmLabel:"Send Request",onConfirm:function(v){createQuote({tourTitle:draft.title,dates:v.dates,guests:v.guests,message:v.message});pushNotification({category:"Quote",title:"Quote requested for "+draft.title,body:"You'll hear back within 24 hours.",ctaLabel:"View",route:route("notifications")});toast("Quote request sent!","success");}});});
  bindTextButtons(/message host/i,function(){openMessageModal("Message Host","Send a note about "+draft.title);});
  bindTextButtons(/view full itinerary/i,function(){toast("Full itinerary expanded.","success");});
  bindTextButtons(/^share$/i,handleShare);
  $all("button").filter(function(b){return/^favorite_border$/.test(buttonText(b).trim());}).forEach(function(btn){btn.addEventListener("click",function(e){e.preventDefault();var i=btn.querySelector(".material-icons");if(i.textContent==="favorite_border"){i.textContent="favorite";i.style.color="#ef4444";toast("Added to favorites!","success");}else{i.textContent="favorite_border";i.style.color="";toast("Removed from favorites.","success");}});});
}

// ===== TRAVELER: Checkout =====
function initCheckout(){
  if(window.location.pathname.indexOf("/traveler/checkout")===-1)return;
  var payBtns=$all("button").filter(function(b){return/credit card|digital wallet/.test(cleanLabel(buttonText(b)));});
  var sel=ensurePageState().selections.paymentMethod||"credit card";
  payBtns.forEach(function(b){b.addEventListener("click",function(e){e.preventDefault();sel=cleanLabel(buttonText(b));ensurePageState().selections.paymentMethod=sel;payBtns.forEach(function(c){c.classList.remove("ring-2","ring-primary","border-primary","bg-primary/10");});b.classList.add("ring-2","ring-primary","border-primary","bg-primary/10");queueSync();});if(cleanLabel(buttonText(b))===sel)b.classList.add("ring-2","ring-primary","border-primary","bg-primary/10");});
  var form=$one("form");if(!form)return;
  form.addEventListener("submit",function(e){e.preventDefault();var inputs=$all("input[type='text']",form);var cn=(inputs[0]&&inputs[0].value||"").replace(/\D/g,"");var exp=inputs[1]?inputs[1].value.trim():"";var cvc=(inputs[2]&&inputs[2].value||"").replace(/\D/g,"");var nm=inputs[3]?inputs[3].value.trim():"";
    if(sel==="credit card"&&(cn.length<12||!exp||cvc.length<3||nm.length<2)){toast("Complete all payment details.","warn");return;}
    var d=window.BYG.appState.bookingDraft||{};var conf=deepMerge(d,{reference:d.reference||("TRP-"+Math.floor(10000+Math.random()*89999)),paymentMethod:sel,confirmedAt:new Date().toISOString(),last4:cn?cn.slice(-4):"wallet"});
    window.BYG.appState.bookingDraft=conf;window.BYG.appState.confirmedBookings=[conf].concat(window.BYG.appState.confirmedBookings||[]).slice(0,8);
    pushNotification({category:"System",title:conf.title+" confirmed",body:"Booking #"+conf.reference+" saved.",ctaLabel:"View",route:route("bookingConfirm")});queueSync();navigate("bookingConfirm");
  });
}

// ===== TRAVELER: Booking Confirm =====
function initBookingConfirm(){
  if(window.location.pathname.indexOf("/traveler/booking-confirm")===-1)return;
  var bk=window.BYG.appState.bookingDraft||(window.BYG.appState.confirmedBookings||[])[0];if(!bk)return;
  var title=$one("h1");if(title)title.textContent=bk.title||title.textContent;
  var ref=$all(".font-mono").filter(function(n){return/TRP-/.test(n.textContent);})[0];if(ref)ref.textContent="#"+bk.reference;
  bindTextButtons(/modify booking/i,function(){navigate("checkout");});
  bindTextButtons(/message provider/i,function(){openMessageModal("Message Provider","Send a note about booking #"+bk.reference);});
  bindTextButtons(/download ticket/i,function(){downloadFile(slugify(bk.title||"ticket")+".txt","Before You Go Ticket\n\nTrip: "+(bk.title||"")+"\nRef: #"+bk.reference+"\nGuests: "+(bk.guests||"")+"\nDates: "+(bk.dates||"")+"\nPaid: "+bk.paymentMethod,"text/plain");});
}

// ===== TRAVELER: Notifications =====
function initNotifications(){
  if(window.location.pathname.indexOf("/traveler/notifications")===-1)return;
  renderStoredNotifications();
  bindTextButtons(/mark all as read/i,function(){(window.BYG.appState.notifications||[]).forEach(function(i){i.unread=false;});queueSync();renderStoredNotifications();updateNotificationDots();toast("All marked as read.","success");});
  bindTextButtons(/reply/i,function(){openMessageModal("Reply","Send a reply from notifications.");});
  bindTextButtons(/review proposal|view quote/i,function(){navigate("tour");});
  bindTextButtons(/view flight details/i,function(){navigate("tour");});
  bindTextButtons(/plan a trip/i,function(){navigate(window.BYG.appState.quiz.completed?"vibe":"quiz");});
}

// ===== TRAVELER: Gavel =====
function initGavel(){
  if(window.location.pathname.indexOf("/traveler/gavel")===-1)return;
  bindTextButtons(/open group chat/i,function(){openMessageModal("Group Chat","Share your thoughts about these options.");});
  bindTextButtons(/^close$/i,function(){navigate("travelerDashboard");});
  $all("button").forEach(function(btn,idx){if(!/vote yes|vote no|voted yes|voted no/.test(buttonText(btn)))return;var card=closestVoteCard(btn);if(!card)return;
    btn.addEventListener("click",function(e){e.preventDefault();var id="vote-"+idx;var vs=window.BYG.appState.votes[id]||{percent:cardPercent(card),votes:cardVotes(card),choice:""};vs.choice=/yes/.test(buttonText(btn))?"yes":"no";vs.percent=Math.max(0,Math.min(100,vs.percent+(vs.choice==="yes"?12:-12)));vs.votes+=1;window.BYG.appState.votes[id]=vs;applyVoteState(card,vs);queueSync();toast("Vote recorded! "+vs.votes+" total.","success");});
  });
}

// ===== TRAVELER: Weather Swap =====
function initWeatherSwap(){
  if(window.location.pathname.indexOf("/traveler/weather-swap")===-1)return;
  bindTextButtons(/ignore warning|keep original/i,function(){toast("Original plan kept.","success");navigate("tour");});
  bindTextButtons(/swap now/i,function(){toast("Activity swapped! Itinerary updated.","success");pushNotification({category:"Alert",title:"Itinerary updated",body:"Weather-affected activity replaced.",ctaLabel:"View trip",route:route("tour")});queueSync();setTimeout(function(){navigate("tour");},1200);});
  bindTextButtons(/view all map|view full map/i,function(){toast("Map view showing all alternatives.","success");});
}

// ===== TRAVELER: Past Trips =====
function initPastTrips(){
  if(window.location.pathname.indexOf("/traveler/past-trips")===-1)return;
  bindTextButtons(/write review|edit review/i,function(){handleReview();});
  bindTextButtons(/rebook this vibe/i,function(){toast("Loading vibe from this trip...","success");navigate("vibe");});
  bindTextButtons(/view full itinerary history/i,function(){toast("Full itinerary expanded.","success");});
  bindTextButtons(/view all/i,function(){navigate("pastTrips");});
}

// ===== GUIDE: Dashboard =====
function initGuideDashboard(){
  if(window.location.pathname.indexOf("/guide/dashboard")===-1)return;
  bindTextButtons(/new manual quote/i,function(){
    openModal({title:"Create Manual Quote",description:"Build a custom quote for a traveler.",maxWidth:"520px",
      fields:[{name:"clientName",label:"Client Name",placeholder:"e.g. Sarah Mitchell"},{name:"clientEmail",label:"Email",placeholder:"sarah@email.com"},{name:"destination",label:"Destination",placeholder:"e.g. Tokyo, Japan"},{name:"dates",label:"Trip Dates",type:"date"},{name:"guests",label:"Group Size",type:"number",value:"2",min:1},{name:"price",label:"Price ($)",type:"number",placeholder:"e.g. 2500"},{name:"notes",label:"Notes",type:"textarea",placeholder:"Trip details, inclusions..."}],
      confirmLabel:"Create Quote",onConfirm:function(v){if(!v.clientName||!v.destination){toast("Client name and destination required.","warn");return;}createQuote({clientName:v.clientName,destination:v.destination,dates:v.dates,price:v.price,status:"quoted"});pushNotification({category:"Quote",title:"Quote for "+v.clientName,body:v.destination+" — $"+(v.price||"TBD"),ctaLabel:"View",route:route("guideClients")});toast("Quote created for "+v.clientName+".","success");}});
  });
  bindTextButtons(/follow up/i,function(){openMessageModal("Follow Up","Send a follow-up message about their trip inquiry.");});
  bindTextButtons(/view itinerary/i,function(){navigate("tour");});
  $all("button").filter(function(b){return/^edit$/.test(buttonText(b).trim());}).forEach(function(b){b.addEventListener("click",function(e){e.preventDefault();navigate("guideProfile");});});
  bindTextButtons(/^notifications$/i,function(){navigate("notifications");});
}

// ===== GUIDE: Clients =====
function initGuideClients(){
  if(window.location.pathname.indexOf("/guide/clients")===-1)return;
  var pubBtn=findButton(/public view/i),prvBtn=findButton(/private crm|table_chart/i);
  if(pubBtn&&prvBtn){pubBtn.addEventListener("click",function(e){e.preventDefault();pubBtn.classList.add("bg-primary","text-white");prvBtn.classList.remove("bg-primary","text-white");toast("Public portfolio view.","success");});prvBtn.addEventListener("click",function(e){e.preventDefault();prvBtn.classList.add("bg-primary","text-white");pubBtn.classList.remove("bg-primary","text-white");toast("Private CRM view.","success");});}
  bindTextButtons(/start planning/i,function(){navigate("tour");});
  bindTextButtons(/add client/i,function(){openModal({title:"Add New Client",fields:[{name:"name",label:"Name",placeholder:"Full name"},{name:"email",label:"Email",placeholder:"client@email.com"},{name:"destination",label:"Interested In",placeholder:"e.g. Bali"},{name:"status",label:"Status",type:"select",options:[{value:"lead",label:"Lead"},{value:"quoted",label:"Quoted"},{value:"booked",label:"Booked"}]}],confirmLabel:"Add Client",onConfirm:function(v){if(!v.name){toast("Name required.","warn");return;}toast(v.name+" added.","success");queueSync();}});});
  bindTextButtons(/status: all|filter_list/i,function(){openModal({title:"Filter Clients",fields:[{name:"status",label:"Status",type:"select",options:[{value:"all",label:"All",selected:true},{value:"active",label:"Active"},{value:"lead",label:"Leads"},{value:"completed",label:"Completed"}]}],confirmLabel:"Apply",onConfirm:function(v){toast("Showing: "+v.status,"success");}});});
  $all("button").filter(function(b){return/^more_vert$/.test(buttonText(b).trim());}).forEach(function(btn){btn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();var row=btn.closest("tr,[class*='flex']");var nEl=row?row.querySelector("h4,[class*='font-semibold']"):null;var name=nEl?nEl.textContent.trim():"client";var r=btn.getBoundingClientRect();showContextMenu(r.left,r.bottom+4,[{icon:"chat",label:"Message "+name,action:"msg",handler:function(){openMessageModal("Message "+name,"Send a message about their trip.");}},{icon:"description",label:"Create Itinerary",action:"itin",handler:function(){navigate("tour");}},{icon:"receipt_long",label:"Send Quote",action:"quote",handler:function(){toast("Opening quote builder for "+name,"success");}},{divider:true},{icon:"archive",label:"Archive",action:"archive",handler:function(){toast(name+" archived.","success");}}]);});});
  bindTextButtons(/^previous$/i,function(){toast("Previous page.","success");});bindTextButtons(/^next$/i,function(){toast("Next page.","success");});
}

// ===== GUIDE: Profile Builder =====
function initGuideProfileBuilder(){
  if(window.location.pathname.indexOf("/guide/profile-builder")===-1)return;
  bindTextButtons(/add custom/i,function(){openModal({title:"Add Custom Specialty",fields:[{name:"s",label:"Specialty",placeholder:"e.g. Wildlife Photography"}],confirmLabel:"Add",onConfirm:function(v){if(v.s)toast('"'+v.s+'" added.','success');}});});
  bindTextButtons(/add slot|add_circle/i,function(){openModal({title:"Add Availability Slot",fields:[{name:"day",label:"Day",type:"select",options:[{value:"mon",label:"Monday"},{value:"tue",label:"Tuesday"},{value:"wed",label:"Wednesday"},{value:"thu",label:"Thursday"},{value:"fri",label:"Friday"},{value:"sat",label:"Saturday"},{value:"sun",label:"Sunday"}]},{name:"from",label:"From",placeholder:"9:00 AM"},{name:"to",label:"To",placeholder:"5:00 PM"}],confirmLabel:"Add Slot",onConfirm:function(v){toast("Slot added for "+v.day+".","success");queueSync();}});});
}

// ===== GUIDE: Availability =====
function initGuideAvailability(){
  if(window.location.pathname.indexOf("/guide/availability")===-1)return;
  bindTextButtons(/block dates/i,function(){openModal({title:"Block Dates",description:"Mark dates as unavailable.",fields:[{name:"from",label:"From",type:"date"},{name:"to",label:"To",type:"date"},{name:"reason",label:"Reason (optional)",placeholder:"Personal travel..."}],confirmLabel:"Block Dates",onConfirm:function(v){if(!v.from){toast("Select a start date.","warn");return;}toast("Dates blocked.","success");queueSync();}});});
}

// ===== AGENCY: Dashboard =====
function initAgencyDashboard(){
  if(window.location.pathname.indexOf("/agency/dashboard")===-1)return;
  bindTextButtons(/add departure/i,function(){openModal({title:"Add Tour Departure",maxWidth:"480px",fields:[{name:"tour",label:"Tour",type:"select",options:[{value:"bali",label:"Bali Temple & Rice Terrace"},{value:"tokyo",label:"Tokyo Street Food Adventure"},{value:"swiss",label:"Swiss Alps Wellness Retreat"}]},{name:"date",label:"Departure Date",type:"date"},{name:"capacity",label:"Max Participants",type:"number",value:"12",min:1},{name:"price",label:"Price/Person ($)",type:"number",placeholder:"e.g. 899"}],confirmLabel:"Add Departure",onConfirm:function(v){if(!v.date){toast("Select a date.","warn");return;}pushNotification({category:"System",title:"Departure added",body:v.tour+" on "+v.date,ctaLabel:"View",route:route("agencyCalendar")});queueSync();toast("Departure scheduled for "+v.date+".","success");}});});
  bindTextButtons(/open map view/i,function(){toast("Map view showing all tour locations.","success");});
  bindTextButtons(/^monthly$/i,function(){toast("Monthly view.","success");});bindTextButtons(/^quarterly$/i,function(){toast("Quarterly view.","success");});
  bindTextButtons(/^view all$/i,function(){navigate("agencyAnalytics");});
  bindTextButtons(/^notifications$/i,function(){navigate("notifications");});
  bindTextButtons(/^filter_list$/i,function(){openModal({title:"Filter Dashboard",fields:[{name:"status",label:"Status",type:"select",options:[{value:"all",label:"All",selected:true},{value:"confirmed",label:"Confirmed"},{value:"pending",label:"Pending"}]}],confirmLabel:"Apply",onConfirm:function(){toast("Filters applied.","success");}});});
}

// ===== AGENCY: Tour Builder =====
function initAgencyTourBuilder(){
  if(window.location.pathname.indexOf("/agency/tour-builder")===-1)return;
  bindTextButtons(/save draft/i,function(){queuePageSnapshot();syncProfileBuckets();toast("Tour draft saved.","success");});
  bindTextButtons(/publish to marketplace|rocket_launch/i,function(){openModal({title:"Publish Tour?",description:"This makes your tour visible to all travelers.\n\nEnsure all days have activities, pricing is set, and photos are uploaded.",confirmLabel:"Publish Now",secondaryLabel:"Save as Draft",onConfirm:function(){pushNotification({category:"System",title:"Tour published!",body:"Your tour is now live.",ctaLabel:"View",route:route("agencyTour")});queueSync();toast("Tour published!","success");},onSecondary:function(){queuePageSnapshot();toast("Saved as draft.","success");}});});
  bindTextButtons(/create custom activity/i,function(){openModal({title:"Create Custom Activity",fields:[{name:"name",label:"Activity Name",placeholder:"e.g. Sunrise Yoga"},{name:"duration",label:"Duration",placeholder:"e.g. 2 hours"},{name:"category",label:"Category",type:"select",options:[{value:"adventure",label:"Adventure"},{value:"cultural",label:"Cultural"},{value:"food",label:"Food & Drink"},{value:"wellness",label:"Wellness"}]},{name:"desc",label:"Description",type:"textarea",placeholder:"What makes this special?"}],confirmLabel:"Add to Tour",onConfirm:function(v){if(!v.name){toast("Name required.","warn");return;}toast('"'+v.name+'" added.','success');queueSync();}});});
  bindTextButtons(/add day|add_circle/i,function(){toast("New day added to itinerary.","success");});
  bindTextButtons(/auto_awesome/i,function(){toast("Generating AI suggestions...","success");setTimeout(function(){toast("3 activities suggested!","success");},1500);});
  $all("button").filter(function(b){return/^add "/.test(buttonText(b));}).forEach(function(btn){btn.addEventListener("click",function(e){e.preventDefault();var a=buttonText(btn).replace(/^add "/i,"").replace(/"$/,"");toast('"'+a+'" added.','success');btn.disabled=true;btn.style.opacity="0.5";btn.textContent="\u2713 Added";});});
  bindTextButtons(/view full map/i,function(){toast("Map view showing all tour stops.","success");});
}

// ===== AGENCY: Bookings =====
function initAgencyBookings(){
  if(window.location.pathname.indexOf("/agency/participants")===-1)return;
  bindTextButtons(/export report|download/i,function(){var rows=[["Name","Tour","Date","Status","Amount"]];$all("tr").forEach(function(tr){var cells=$all("td",tr);if(cells.length>=3)rows.push(cells.map(function(td){return csvValue(td.textContent.trim());}));});if(rows.length<2){rows.push(["Sarah Mitchell","Bali Tour","Oct 15","Confirmed","$899"]);rows.push(["James Rodriguez","Tokyo Food","Nov 2","Pending","$1250"]);}downloadFile("bookings-export.csv",rows.map(function(r){return r.join(",");}).join("\n"),"text/csv");toast("Bookings exported.","success");});
  bindTextButtons(/message all|^send$/i,function(){openModal({title:"Message All Participants",fields:[{name:"subject",label:"Subject",placeholder:"Pre-trip info"},{name:"message",label:"Message",type:"textarea",placeholder:"Updates, packing lists, meeting points..."}],confirmLabel:"Send to All",onConfirm:function(v){if(!v.message){toast("Write a message.","warn");return;}toast("Message sent to all.","success");}});});
  bindTextButtons(/^filter$/i,function(){openModal({title:"Filter Bookings",fields:[{name:"status",label:"Status",type:"select",options:[{value:"all",label:"All",selected:true},{value:"confirmed",label:"Confirmed"},{value:"pending",label:"Pending"}]}],confirmLabel:"Apply",onConfirm:function(v){toast("Showing: "+v.status,"success");}});});
  $all("button").filter(function(b){return/^edit$/.test(buttonText(b).trim());}).forEach(function(btn){btn.addEventListener("click",function(e){e.preventDefault();var row=btn.closest("tr");var name=row?(row.querySelector("td")||{}).textContent.trim():"participant";openModal({title:"Edit: "+name,fields:[{name:"status",label:"Status",type:"select",options:[{value:"confirmed",label:"Confirmed"},{value:"pending",label:"Pending"},{value:"cancelled",label:"Cancelled"}]},{name:"notes",label:"Notes",type:"textarea"}],confirmLabel:"Update",onConfirm:function(){toast(name+" updated.","success");queueSync();}});});});
  $all("button").filter(function(b){return/^mail$/.test(buttonText(b).trim());}).forEach(function(btn){btn.addEventListener("click",function(e){e.preventDefault();var row=btn.closest("tr");var name=row?(row.querySelector("td")||{}).textContent.trim():"participant";openMessageModal("Message "+name,"Send a direct message.");});});
  bindTextButtons(/^chevron_left$/i,function(){toast("Previous page.","success");});bindTextButtons(/^chevron_right$/i,function(){toast("Next page.","success");});
}

// ===== AGENCY: Team =====
function initAgencyTeam(){
  if(window.location.pathname.indexOf("/agency/team")===-1)return;
  bindTextButtons(/invite member|add member|send invite/i,function(){openModal({title:"Invite Team Member",fields:[{name:"name",label:"Name",placeholder:"Maria Santos"},{name:"email",label:"Email",placeholder:"maria@agency.com"},{name:"role",label:"Role",type:"select",options:[{value:"admin",label:"Admin"},{value:"manager",label:"Manager"},{value:"guide",label:"Guide"},{value:"support",label:"Support"}]}],confirmLabel:"Send Invite",onConfirm:function(v){if(!v.email){toast("Email required.","warn");return;}pushNotification({category:"System",title:"Invite sent to "+v.name,body:v.email+" as "+v.role,ctaLabel:"View",route:route("agencyTeam")});toast("Invite sent to "+v.email,"success");queueSync();}});});
}

// ===== AGENCY: Analytics =====
function initAgencyAnalytics(){
  if(window.location.pathname.indexOf("/agency/analytics")===-1)return;
  bindTextButtons(/export|download/i,function(){downloadFile("analytics.csv","Metric,Value\nBookings,47\nRevenue,$42350\nRating,4.8\nConversion,23%","text/csv");toast("Analytics exported.","success");});
}

// ===== SHARED: Roles =====
function initRoles(){
  if(window.location.pathname.indexOf("/shared/roles")===-1)return;
  bindTextButtons(/view plans/i,function(){navigate("subscription");});
  bindTextButtons(/apply to be a guide/i,function(){openModal({title:"Apply As Guide",fields:[{name:"specialty",label:"Specialty",placeholder:"Food tours, hiking..."}],confirmLabel:"Switch to Guide",onConfirm:function(){window.BYG.role="guide";localStorage.setItem("byg_role","guide");queueSync();navigate("guideDashboard");}});});
  bindTextButtons(/register as agency/i,function(){openModal({title:"Register Agency",fields:[{name:"agency",label:"Agency Name",placeholder:"Nomad Adventures Co."}],confirmLabel:"Open Agency Dashboard",onConfirm:function(){window.BYG.role="agency";localStorage.setItem("byg_role","agency");queueSync();navigate("agencyDashboard");}});});
  bindTextButtons(/save preferences/i,function(){queuePageSnapshot();toast("Preferences saved.","success");});
}

// ===== SHARED: Settings =====
function initSettingsPages(){
  if(window.location.pathname.indexOf("/shared/security")>-1){bindTextButtons(/update password/i,function(){toast("Password updated.","success");});}
  if(window.location.pathname.indexOf("/shared/subscription")>-1){
    bindTextButtons(/change plan|upgrade plan/i,function(){openModal({title:"Change Plan",fields:[{name:"plan",label:"Select Plan",type:"radio-cards",columns:3,options:[{value:"free",icon:"explore",label:"Free",desc:"Basic DIY"},{value:"pro",icon:"star",label:"Pro $9/mo",desc:"AI + guides"},{value:"team",icon:"groups",label:"Team $29/mo",desc:"Agency tools"}]}],confirmLabel:"Change Plan",onConfirm:function(v){toast("Plan changed to "+(v.plan||"selected")+".","success");queueSync();}});});
    bindTextButtons(/cancel subscription/i,function(){openModal({title:"Cancel Subscription?",description:"You'll lose Pro features at end of billing period.",confirmLabel:"Cancel",secondaryLabel:"Keep Plan",onConfirm:function(){toast("Subscription cancelled.","success");},onSecondary:function(){toast("Plan stays active!","success");}});});
  }
  if(window.location.pathname.indexOf("/shared/payout")>-1){bindTextButtons(/connect with stripe|manage on stripe|setup/i,function(){openModal({title:"Connect Stripe",description:"Link your Stripe account to receive payouts.",confirmLabel:"Connect",onConfirm:function(){toast("Stripe connection initiated.","success");}});});}
}
function initPreviewAndAI(){
  bindTextButtons(/preview|public view|view public profile/i,function(){var f=collectFields();var rows=Object.keys(f).filter(Boolean).map(function(k){return k.replace(/-/g," ")+": "+f[k];}).slice(0,10);openModal({title:"Profile Preview",description:rows.length?"How visitors see your profile:\n\n"+rows.join("\n"):"Add content to see a preview.",confirmLabel:"Looks Good",onConfirm:function(){}});});
}

// ===== QUIZ =====
function initQuiz(){
  if(window.location.pathname.indexOf("/quiz")===-1)return;
  var qc=$all("div").filter(function(d){return/morning person/i.test(d.textContent)&&d.querySelector("button");})[0];if(!qc)qc=$one("main")||document.body;
  var opts=$all("button",qc).filter(function(b){return b.querySelector(".material-icons")&&b.textContent.length>10&&!/next|back|close|start/i.test(buttonText(b));});
  var next=findButton(/next|continue|see results/i)||findButton(/arrow_forward/i);
  var back=findButton(/back|previous/i)||findButton(/arrow_back/i);
  var closeBtn=findButton(/^close$/i);
  if(opts.length<4)return;
  function render(){
    var q=QUIZ_QUESTIONS[window.BYG.appState.quiz.currentIndex];if(!q)return;
    var tEl=qc.querySelector("h1,h2"),sEl=qc.querySelector("p");
    var counterEl=document.getElementById("byg-quiz-counter");
    if(tEl)tEl.textContent=q.title;if(sEl)sEl.textContent=q.subtitle;
    if(counterEl)counterEl.textContent = "Question "+(window.BYG.appState.quiz.currentIndex+1)+" of "+QUIZ_QUESTIONS.length;
    opts.forEach(function(btn,i){if(i>=q.options.length){btn.style.display="none";return;}btn.style.display="";var o=q.options[i];var icon=btn.querySelector(".material-icons-round")||btn.querySelector(".material-icons");if(icon)icon.textContent=o.icon;var spans=$all("span",btn).filter(function(s){return s!==icon;});if(spans[0])spans[0].textContent=o.title;if(spans[1])spans[1].textContent=o.description;
      btn.onclick=function(e){e.preventDefault();window.BYG.appState.quiz.answers[q.id]=i;opts.forEach(function(b){b.style.outline="";});btn.style.outline="3px solid #F97316";btn.style.outlineOffset="2px";queueSync();setTimeout(function(){if(window.BYG.appState.quiz.currentIndex<QUIZ_QUESTIONS.length-1){window.BYG.appState.quiz.currentIndex++;render();}},400);};
    });
    var saved=window.BYG.appState.quiz.answers[q.id];if(saved!==undefined&&opts[saved]){opts[saved].style.outline="3px solid #F97316";opts[saved].style.outlineOffset="2px";}
    var prog=$one("[class*='h-1'][class*='bg-'],[class*='h-2'][class*='bg-']");if(prog)prog.style.width=((window.BYG.appState.quiz.currentIndex+1)/QUIZ_QUESTIONS.length*100)+"%";
  }
  if(next){next.addEventListener("click",function(e){e.preventDefault();var q=QUIZ_QUESTIONS[window.BYG.appState.quiz.currentIndex];if(q&&window.BYG.appState.quiz.answers[q.id]===undefined){toast("Pick an option first.","warn");return;}if(window.BYG.appState.quiz.currentIndex<QUIZ_QUESTIONS.length-1){window.BYG.appState.quiz.currentIndex++;render();}else{window.BYG.appState.quiz.completed=true;queueSync();if(window.BYG&&window.BYG.user&&window.BYG.db){window.BYG.db.updateDoc(window.BYG.db.doc(window.BYG.db.instance,"users",window.BYG.user.uid),{travelDNA:window.BYG.appState.quiz.answers}).catch(function(e){console.error("Failed to save TravelDNA",e);});}pushNotification({category:"System",title:"Travel DNA revealed!",body:"Explore destinations matched to your vibe.",ctaLabel:"Explore",route:route("vibe")});toast("Quiz complete!","success");navigate("vibe");}});}
  if(back){back.addEventListener("click",function(e){e.preventDefault();if(window.BYG.appState.quiz.currentIndex>0){window.BYG.appState.quiz.currentIndex--;render();}});}
  if(closeBtn){closeBtn.addEventListener("click",function(e){e.preventDefault();queueSync();navigate("travelerDashboard");});}
  render();
}

// ===== FALLBACK ACTIONS =====
function bindFallbackActions(){
  if(document.body.dataset.bygActions==="true")return;document.body.dataset.bygActions="true";
  document.addEventListener("click",function(e){
    var t=e.target.closest("button");if(!t||t.dataset.bygHandled==="true")return;
    if(t.closest("#byg-topbar")||t.closest("#byg-bottom-nav")||t.closest("#byg-rw")||t.closest(".byg-modal")||t.closest("#byg-context-menu"))return;
    var txt=buttonText(t);if(!txt||t.dataset.bygBound==="true")return;
    if(/^cancel$/.test(txt)){e.preventDefault();handleCancel();return;}
    if(/save|update password|save draft|save preferences|save & continue/.test(txt)){e.preventDefault();handleSave(t);return;}
    if(/^share$/.test(txt)){e.preventDefault();handleShare();return;}
    if(/photo_camera|upload_file|cloud_upload/.test(txt)){e.preventDefault();pickImage(t);return;}
    if(/generate with ai/.test(txt)){e.preventDefault();generateCopy(t);return;}
    if(/^delete$|delete account/.test(txt)){e.preventDefault();handleDelete(t);return;}
    if(/^close$/.test(txt)){e.preventDefault();handleRemove(t);return;}
    if(/^sign out$|^logout$/.test(txt)){e.preventDefault();signOut();return;}
    if(/^more_vert$|^more_horiz$/.test(txt)){e.preventDefault();toast("Actions available.","success");return;}
  });
}

// ===== ACTION HANDLERS =====
function handleSave(t){queuePageSnapshot();syncProfileBuckets();if(/save & continue/.test(buttonText(t))){toast("Saved. Returning to dashboard.","success");navigate(ctx.role==="agency"?"agencyDashboard":ctx.role==="guide"?"guideDashboard":"travelerDashboard");return;}if(/update password/.test(buttonText(t))){toast("Password updated.","success");return;}toast("Changes saved.","success");}
function handleCancel(){closeModal();hydrateSavedFields();toast("Changes discarded.","success");}
function handleShare(){var h=window.location.href;if(navigator.share){navigator.share({title:document.title,url:h}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(h).then(function(){toast("Link copied!","success");}).catch(function(){toast("Copy failed.","warn");});}}
function handleDelete(t){openModal({title:"Delete Account?",description:"This permanently removes your account. Cannot be undone.",confirmLabel:"Delete",secondaryLabel:"Cancel",onConfirm:function(){toast("Account deletion initiated.","success");setTimeout(function(){signOut();},2000);},onSecondary:function(){toast("Cancelled.","success");}});}
function handleRemove(t){var card=t.closest("[class*='rounded']");if(card){card.style.transition="opacity .3s,transform .3s";card.style.opacity="0";card.style.transform="scale(0.95)";setTimeout(function(){card.remove();},300);toast("Removed.","success");}}
function handleReview(){openModal({title:"Write a Review",fields:[{name:"rating",label:"Rating",type:"radio-cards",columns:5,options:[{value:"1",icon:"star",label:"1"},{value:"2",icon:"star",label:"2"},{value:"3",icon:"star",label:"3"},{value:"4",icon:"star",label:"4"},{value:"5",icon:"star",label:"5"}]},{name:"title",label:"Title",placeholder:"Sum up your experience"},{name:"review",label:"Review",type:"textarea",placeholder:"What did you love?"}],confirmLabel:"Submit",onConfirm:function(v){if(!v.review){toast("Write your review.","warn");return;}window.BYG.appState.reviews.push({id:"rev-"+Date.now(),rating:v.rating,content:v.review,createdAt:new Date().toISOString()});pushNotification({category:"System",title:"Review submitted",body:"Thanks for sharing!",ctaLabel:"View",route:route("pastTrips")});queueSync();toast("Review submitted!","success");}});}
function toggleSaved(t){var i=t.querySelector(".material-icons");if(!i)return;if(i.textContent.indexOf("_border")===-1){i.textContent+="_border";i.style.color="";toast("Removed.","success");}else{i.textContent=i.textContent.replace("_border","");i.style.color="#F97316";toast("Saved!","success");}}
function pickImage(t){var input=document.createElement("input");input.type="file";input.accept="image/*";input.style.display="none";document.body.appendChild(input);input.addEventListener("change",function(){if(!input.files.length)return;var r=new FileReader();r.onload=function(){var img=closestImageTarget(t);if(img)img.src=r.result;toast("Photo updated.","success");queueSync();};r.readAsDataURL(input.files[0]);input.remove();});input.click();}
function generateCopy(t){t.disabled=true;t.innerHTML='<span class="material-icons animate-spin text-base mr-1">sync</span> Generating...';setTimeout(function(){t.disabled=false;t.innerHTML='<span class="material-icons text-base mr-1">auto_awesome</span> Generate with AI';toast("AI content generated.","success");},1500);}

// ===== NOTIFICATIONS =====
function renderStoredNotifications(){var list=$all("main div").filter(function(n){return n.children.length>2&&/notification|alert|update/i.test(n.textContent)&&n.querySelector("[class*='rounded']");})[0];if(!list)return;$all("[data-byg-generated-notification]",list).forEach(function(n){n.remove();});(window.BYG.appState.notifications||[]).slice(0,6).reverse().forEach(function(item){var card=document.createElement("div");card.dataset.bygGeneratedNotification="true";card.className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:shadow-md transition-shadow";card.innerHTML='<div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style="background:linear-gradient(135deg,rgba(249,115,22,0.15),rgba(20,184,166,0.1))"><span class="material-icons text-lg" style="color:#F97316">'+notificationIcon(item.category)+'</span></div><div class="flex-1 min-w-0"><p class="font-semibold text-sm text-slate-900">'+escapeHtml(item.title)+'</p><p class="text-xs text-slate-500 mt-0.5">'+escapeHtml(item.body)+'</p></div>'+(item.ctaLabel?'<button data-byg-notification-route="'+(item.route||"")+'" class="text-xs font-semibold text-teal-500 hover:text-orange-500 flex-shrink-0">'+escapeHtml(item.ctaLabel)+'</button>':'');list.prepend(card);});$all("[data-byg-notification-route]",list).forEach(function(b){b.onclick=function(){navigateTo(b.getAttribute("data-byg-notification-route"));};});}
function pushNotification(n){n.id="notif-"+Date.now();n.unread=true;n.createdAt=new Date().toISOString();window.BYG.appState.notifications=[n].concat(window.BYG.appState.notifications||[]).slice(0,MAX_NOTIFICATIONS);updateNotificationDots();queueSync();}
function updateNotificationDots(){var u=(window.BYG.appState.notifications||[]).filter(function(i){return i.unread!==false;}).length;$all("span").forEach(function(n){if(n.className.indexOf("bg-red")>-1&&n.className.indexOf("rounded-full")>-1&&n.offsetWidth<16)n.style.display=u>0?"":"none";});}
function openMessageModal(title,desc){openModal({title:title,description:desc,fields:[{name:"message",label:"Message",type:"textarea",placeholder:"Type your message..."}],confirmLabel:"Send",onConfirm:function(v){if(!v.message){toast("Type a message.","warn");return;}pushNotification({category:"Message",title:"Message sent",body:v.message.substring(0,60)+(v.message.length>60?"...":""),ctaLabel:"View",route:route("notifications")});toast("Message sent!","success");}});}

// ===== PERSISTENCE =====
function hydrateSavedFields(){var ps=ensurePageState();$all("input,select,textarea").forEach(function(f){var k=fieldKey(f);if(!k||isSensitiveField(f))return;var s=ps.formData[k];if(s!==undefined)f.value=s;});}
function hydrateProfileDefaults(){var r=ctx.role||"traveler";var b=(window.BYG.appState.profile||{})[r==="guide"?"guide":r==="agency"?"agency":"shared"]||{};Object.keys(b).forEach(function(k){setFieldValue(k,b[k]);});}
function bindFieldPersistence(){$all("input,select,textarea").forEach(function(f){var k=fieldKey(f);if(!k||isSensitiveField(f))return;f.addEventListener(f.tagName==="SELECT"?"change":"input",function(){ensurePageState().formData[k]=f.value;queueSync();});if(f.tagName==="INPUT"&&f.type==="text"){f.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();queuePageSnapshot();toast("Saved.","success");}});}});}
function queuePageSnapshot(){clearTimeout(pageSnapshotTimer);pageSnapshotTimer=setTimeout(function(){var ps=ensurePageState();$all("input,select,textarea").forEach(function(f){var k=fieldKey(f);if(k&&!isSensitiveField(f))ps.formData[k]=f.value;});queueSync();},100);}
function syncProfileBuckets(){var r=ctx.role||"traveler";var b=r==="guide"?"guide":r==="agency"?"agency":"shared";window.BYG.appState.profile[b]=deepMerge(window.BYG.appState.profile[b]||{},collectFields());queueSync();}

// ===== NAV =====
function navigate(k){navigateTo(route(k));}function navigateTo(p){if(p)window.location.href=p;}function route(k){return(ctx.basePath||"./")+( ROUTES[k]||ROUTES.travelerDashboard);}
function signOut(){localStorage.removeItem(APP_STATE_KEY);localStorage.removeItem("byg_role");if(window.BYG&&window.BYG.auth){window.BYG.auth.signOut().catch(function(){}).finally(function(){navigate("signIn");});}else{navigate("signIn");}}

// ===== UTILS =====
function bindTextButtons(pat,handler){$all("button").filter(function(b){return pat.test(cleanLabel(buttonText(b)));}).forEach(function(b){b.dataset.bygBound="true";b.addEventListener("click",function(e){e.preventDefault();handler.call(b);});});}
function closestVoteCard(b){var el=b;while(el&&el!==document.body){if(el.querySelector&&el.querySelector("[class*='h-2'][style*='width']"))return el;el=el.parentElement;}return null;}
function applyVoteState(card,s){var p=$all("span",card).filter(function(n){return/^\d+%$/.test(n.textContent.trim());})[0];var v=$all("span",card).filter(function(n){return/Votes/.test(n.textContent);})[0];var f=$all("div",card).filter(function(n){return n.style&&n.style.width;})[0];if(p)p.textContent=s.percent+"%";if(v)v.textContent=s.votes+" Votes";if(f)f.style.width=s.percent+"%";$all("button",card).forEach(function(b){var t=buttonText(b);if(s.choice==="yes"&&/yes/i.test(t)){b.innerHTML='<span class="material-icons mr-1">thumb_up</span> Voted Yes';b.classList.add("bg-green-100","text-green-700");}if(s.choice==="no"&&/no/i.test(t)){b.innerHTML='<span class="material-icons mr-1">thumb_down</span> Voted No';b.classList.add("bg-red-100","text-red-700");}});}
function cardPercent(c){var s=$all("span",c).filter(function(n){return/^\d+%$/.test(n.textContent.trim());})[0];return s?parseInt(s.textContent):50;}
function cardVotes(c){var s=$all("span",c).filter(function(n){return/\d+\s*Votes/i.test(n.textContent);})[0];return s?parseInt(s.textContent):0;}
function closestImageTarget(t){var el=t;while(el&&el!==document.body){var img=el.querySelector("img");if(img)return img;el=el.parentElement;}return null;}
function collectFields(){var d={};$all("input,select,textarea").forEach(function(f){var k=fieldKey(f);if(k&&!isSensitiveField(f)&&f.value)d[k]=f.value;});return d;}
function fieldKey(f){return f.id||f.name||f.getAttribute("data-byg-field")||"";}
function setFieldValue(id,v){var f=document.getElementById(id)||document.querySelector("[name='"+id+"']");if(f&&v)f.value=v;}
function isSensitiveField(f){return/password|card|cvv|cvc|ssn|secret|token/i.test(f.name+f.id+(f.placeholder||""));}
function notificationIcon(c){return{Quote:"request_quote",Trip:"flight_takeoff",Alert:"warning",Message:"chat",System:"info"}[c]||"notifications";}
function matchScore(c){var b=c.querySelector("[class*='bg-green'],[class*='bg-amber'],[class*='bg-blue']");return b?parseInt(b.textContent)||50:50;}
function cleanLabel(v){return(v||"").replace(/\s+/g," ").trim().toLowerCase();}
function buttonText(b){if(!b)return"";var c=b.cloneNode(true);$all("img,svg",c).forEach(function(n){n.remove();});return(c.textContent||"").replace(/\s+/g," ").trim();}
function findButton(p){return $all("button").filter(function(b){return p.test(buttonText(b));})[0];}
function csvValue(v){return'"'+String(v||"").replace(/"/g,'""')+'"';}
function downloadFile(name,content,type){var b=new Blob([content],{type:type||"text/plain"});var u=URL.createObjectURL(b);var a=document.createElement("a");a.href=u;a.download=name;a.style.display="none";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},500);}
function slugify(v){return(v||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function escapeHtml(v){return(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function safeParse(r){try{return JSON.parse(r)||{};}catch(e){return {};}}
function deepMerge(a,b){var o={};Object.keys(a||{}).forEach(function(k){o[k]=a[k];});Object.keys(b||{}).forEach(function(k){if(typeof a[k]==="object"&&typeof b[k]==="object"&&!Array.isArray(a[k])&&!Array.isArray(b[k])){o[k]=deepMerge(a[k],b[k]);}else if(b[k]!==undefined){o[k]=b[k];}});return o;}
function getPageKey(){return window.location.pathname.replace(/^\/|\/$/g,"").replace(/\//g,"-")||"index";}
function $one(s,r){return(r||document).querySelector(s);}
function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

// ===== ANIMATIONS =====
(function(){if(document.getElementById("byg-pe-anims"))return;var s=document.createElement("style");s.id="byg-pe-anims";s.textContent="@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}.animate-spin{animation:spin 1s linear infinite}";document.head.appendChild(s);})();

// ===== EXPOSE & AUTO-INIT =====
window.BYGPlatformExperience={init:init,toast:toast,navigate:navigate,openModal:openModal,createTrip:createTrip,pushNotification:pushNotification};
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",function(){autoInit();},{once:true});}else{autoInit();}
function autoInit(){var p=window.location.pathname;var bp="./";if(p.indexOf("/pages/")>-1){var d=p.split("/pages/")[1].split("/").length;bp="../".repeat(d);}var isPublic=p.indexOf("/public/")>-1||p.endsWith("index.html")||p==="/"||p.endsWith("404.html");var role=localStorage.getItem("byg_role")||"traveler";init({basePath:bp,isPublicPage:isPublic,role:role});}

})();
