# BeforeYouGo - AI Travel Platform

## Quick Start

1. Clone this repo
2. Copy `js/env.config.js` and fill in your API keys
3. Push to GitHub → Vercel auto-deploys

## API Keys Needed

| Service | Free Tier | Get Key |
|---------|-----------|---------|
| Firebase | Generous free tier | [Console](https://console.firebase.google.com) |
| Gemini AI | Free tier available | [AI Studio](https://aistudio.google.com/apikey) |
| OpenWeatherMap | 1,000 calls/day | [API](https://openweathermap.org/api) |
| Google Maps | $200/month credit | [Console](https://console.cloud.google.com) |
| Google Custom Search | 100 queries/day | [Docs](https://developers.google.com/custom-search/v1/overview) |
| ExchangeRate API | 1,500 calls/month | [Site](https://www.exchangerate-api.com/) |

## Project Structure

```
├── index.html                 # Landing page
├── 404.html                   # Error page
├── vercel.json                # Deployment config
├── js/
│   ├── env.config.js          # API keys (edit this!)
│   └── shared.js              # Platform core (auth, AI, APIs)
├── pages/
│   ├── public/                # Sign in, quiz, legal pages
│   ├── traveler/              # Traveler dashboard & flows
│   ├── guide/                 # Guide dashboard & flows
│   ├── agency/                # Agency dashboard & flows
│   └── shared/                # Settings, subscription, etc.
├── images/                    # Design references
├── .env.example               # Environment variable template
└── MAPPING_REPORT.md          # Image → HTML mapping
```

## Pages (35 total)

### Public (7)
- Before You Go - AI Travel Planner: `index.html`
- Sign In: `pages/public/signin.html`
- Find Your Travel DNA: `pages/public/quiz.html`
- Terms of Service: `pages/public/terms.html`
- About Us: `pages/public/about.html`
- Page Not Found: `404.html`
- Cookie Policy: `pages/public/cookies.html`

### Traveler (10)
- Dashboard: `pages/traveler/dashboard.html`
- Home: `pages/traveler/home.html`
- Vibe Search: `pages/traveler/vibe-search.html`
- Group Voting: `pages/traveler/gavel.html`
- Tour Details: `pages/traveler/tour-detail.html`
- Past Trips: `pages/traveler/past-trips.html`
- Weather Swap: `pages/traveler/weather-swap.html`
- Booking Confirmed: `pages/traveler/booking-confirm.html`
- Checkout: `pages/traveler/checkout.html`
- Notifications: `pages/traveler/notifications.html`

### Guide (4)
- Guide Dashboard: `pages/guide/dashboard.html`
- Profile Builder: `pages/guide/profile-builder.html`
- Availability: `pages/guide/availability.html`
- Client Portfolio: `pages/guide/clients.html`

### Agency (8)
- Agency Dashboard: `pages/agency/dashboard.html`
- Analytics: `pages/agency/analytics.html`
- Calendar: `pages/agency/calendar.html`
- Profile Builder: `pages/agency/profile-builder.html`
- Tour Builder: `pages/agency/tour-builder.html`
- Team Management: `pages/agency/team.html`
- Tour Participants: `pages/agency/participants.html`
- Mobile Analytics: `pages/agency/mobile-analytics.html`

### Settings (6)
- Account Settings: `pages/shared/settings.html`
- Role Settings: `pages/shared/roles.html`
- Subscription: `pages/shared/subscription.html`
- Security & Privacy: `pages/shared/security.html`
- Payment Status: `pages/shared/payment-status.html`
- Payout Setup: `pages/shared/payout-setup.html`

## Features

- 🔐 Firebase Authentication (email/password + anonymous)
- 🤖 Gemini AI with Function Calling (images, weather, currency)
- 🌤 Live Weather Forecasts
- 💱 Real-time Currency Exchange
- 📸 Google Image Search for destinations
- 💬 AI Travel Buddy floating chat widget
- 🔄 Role switching (Traveler/Guide/Agency)
- 📱 Responsive design
