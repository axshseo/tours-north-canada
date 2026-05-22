# 🇨🇦 PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project:** Tours North (The Ultimate Canadian Travel Engine)  
**Version:** 3.0 (Enterprise-Scale)  
**Target Launch:** 2026 Category Leader  
**Status:** Active Development

---

## 1. Executive Vision

To build the world's most advanced, secure, and culturally authentic travel platform for Canada. Tours North is not a directory; it is an **Intelligent Discovery Engine**. We will outperform global competitors (Viator, GetYourGuide) by leveraging hyper-local intelligence, proprietary data taxonomy, and a "Safety-First" brand promise.

**The Promise:** *"Unlocking the True North through design-forward exploration and inventory-driven technology."*

---

## 2. Core Pillars of Differentiation

1. **Unapologetically Canadian**: Prioritizing Indigenous tourism, bilingual (EN/FR) deep support, TICO/Consumer protection compliance, and Land Acknowledgements.
2. **9-Layer Data Taxonomy**: A proprietary sorting engine that understands Human Intent (e.g., "Escape & Reset") better than standard keyword search.
3. **Local Intelligence**: Integrating "Travel Hacks" (Transit secrets, budget tips) directly alongside "Bookable Products" to build domain authority.
4. **Omnichannel Sync**: A "Headless" architecture where a single Supabase database powers the Web, Mobile App, and AI Concierge instantly.

---

## 3. The 9-Layer Data Taxonomy (The Brain)

All code logic must adhere to this hierarchy:

| Layer | Name | Examples |
|-------|------|----------|
| **L1** | **Intent** | See & Do, Move Around, Escape & Reset, Learn & Discover, Play & Thrill |
| **L2** | **Category** | Attractions, Guided Tours, Day Trips, Transport, Wellness |
| **L3** | **Operational** | Walking Tours, Heli-tours, Cruises, Entry Tickets |
| **L4** | **Functional** | Land, Air, Water, Indoor, Outdoor |
| **L5** | **Collections** | Only-in-Canada, Winter-Warriors, Urban-Explorer, Indigenous-Heritage |
| **L6** | **Sub-Collections** | Aurora Hunting, Polar Bears, Poutine Trails, Underground Cities |
| **L7** | **Persona** | Families, Solo Travelers, Couples, Luxury Seekers |
| **L8** | **Context** | Seasonality, Weather-Dependency, Accessibility (Wheelchair/Stroller) |
| **L9** | **Revenue** | Bundle Logic (e.g., "City Pass Eligible") |

### Implementation Rules:
- Every product MUST have L1, L2, L4, L7, and L8 assigned.
- L5/L6 (Collections) are optional but power premium editorial curation.
- L9 (Bundle Logic) is essential for upsell automation.

---

## 4. User Experience (UX) & Design System (2026 Aesthetic)

### 4.1 Visual Language: "Minimalist Wilderness"

**Color Palette:**
- **Primary Color:** Deep Forest Green `#064e3b` – Authority & Nature
- **Action Color:** Maple Red `#b91c1c` – Urgency & Identity
- **Highlight:** Neon Moss `#a3e635` – Tech & Modernity
- **Background:** Snow White `#f8fafc` with subtle topographic SVG patterns

**Typography:**
- **Headlines:** Syne (Bold/ExtraBold) – Editorial feel
- **Body:** Inter (Medium/Regular) – UI clarity

**Animation Principles:**
- Parallax scrolling for depth
- Skeleton loaders (shimmer effect) for perceived speed
- Micro-animations on hover (3D lift, glass shine)
- Scroll reveal system (fade-in-up with stagger)

### 4.2 Key UI Components (The 40+ Component Library)

1. **Glassmorphism Navigation**: Sticky header with `backdrop-blur-xl`
2. **Bento Grid Layouts**: Asymmetrical grids for destinations and collections
3. **"Shelf" Architecture**: Horizontal snap-scroll carousels for inventory categories
4. **Antigravity Motion**: Elements (like badges or hero images) float slowly to create depth
5. **Masonry Grids**: Numbered "Top 10" lists with overlapping text layers
6. **Trust Blocks**: Reusable components showing "Verified Operator," "Insured," and "Secure Pay"
7. **9-Layer Badge System**: Dynamic badges showing L7 Personas, L8 Context, L4 Types
8. **Predictive Search Bar**: Spotlight-style modal with categorized results
9. **FOMO Indicators**: Pulse animations for low inventory
10. **AI Concierge Chat**: Floating assistant with quick-help suggestions

---

## 5. Functional Requirements (Technical Specs)

### 5.1 The "City Hub" Engine

**Dynamic Hydration:**
- Pages must load as skeletons and hydrate via `db-engine.js` fetching from Supabase
- Concurrent data fetching for all shelves (Promise.all pattern)

**Smart Filtering:**
- Filter by Layer 4 (Indoor/Outdoor)
- Filter by Layer 7 (Who are you with?)
- Filter by Layer 8 (Is it raining?)

**Live Map View:**
- Leaflet.js integration using PostGIS coordinates
- "Tours Near Me" proximity search
- Custom Maple Red pins with popup badges

### 5.2 The Search Engine

**Logic:**
- Full-Text Search using Supabase GIN indexes (Title + Description + Category)
- Exposes `window.performPredictiveSearch(query)` globally

**UI:**
- "Spotlight" style modal search with instant results
- Categorized dropdown: Destinations, Tour Matches, Type Suggestions
- "Trending" badges for popular searches

**Implementation:**
- Wired to hero search bar on all city hubs
- Debounced input (300ms)
- Click-outside dismiss

### 5.3 The Product Page

**Sticky Booking Widget:**
- Desktop: Right-rail sidebar
- Mobile: Bottom-bar with slide-up modal

**Dynamic Pricing:**
- Price updates in real-time from DB
- Show original price + discount if applicable

**FOMO Logic:**
- If `inventory < 10`, show "Selling Fast" pulse animation
- Live viewer count: "3 others viewing now"

**Trust Elements:**
- Safety Verified badge
- Free cancellation policy
- Insurance included
- TICO compliance seal

### 5.4 Schema.org Structured Data

**Required on all pages:**
- Homepage: `WebSite` + `Organization` + `SearchAction`
- City Hubs: `ItemList` with `TouristTrip` elements
- Product Pages: `TouristTrip` with full details (price, duration, provider)
- Collection Pages: `Collection` with curated items

---

## 6. Technical Stack & Infrastructure

### Core Stack:
- **IDE:** Google Antigravity (IDX)
- **Frontend:** HTML5, Tailwind CSS, Alpine.js
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Security:** RLS (Row Level Security) Enabled
- **DevOps:** GitHub Actions (CI/CD) with Security Scanning & Lighthouse Audits
- **Mobile:** PWA Manifest (Installable App)

### JavaScript Architecture:
- **`db-engine.js`**: Supabase client + 9-layer taxonomy mapper
- **`tours-north-api.js`**: High-level API functions (getCityInventory, getTopRatedTours, etc.)
- **`search.js`**: Predictive search engine
- **`personalization.js`**: Recently viewed + AI concierge
- **`global-header.js`**: Dynamic navigation with inventory-driven menus
- **`fomo.js`**: Real-time "pulse" notifications
- **`conversion-popups.js`**: Exit intent + discount modals

### Database Views:
- **`vw_experiences_by_persona`**: Flattened 9-layer view for fast queries
- **RPC Functions:**
  - `get_nearest_experiences(lat, lng, limit)`: PostGIS proximity
  - Future: `get_bundle_suggestions(experience_id)`

---

## 7. Business & Monetization Logic

### 7.1 The "Sales Pulse"
- Real-time notifications ("Someone from Ottawa just booked X") to drive social proof
- Powered by `fomo.js` with random interval (60-180s)

### 7.2 The "Partner Portal"
- B2B Dashboard for tour operators to view their own traffic/sales stats
- Admin role in Supabase RLS
- Analytics: Views, Clicks, Bookings, Revenue

### 7.3 Affiliate/Direct Hybrid
- System must support both:
  - **Direct:** Stripe checkout integration
  - **Affiliate:** External deep-links (Viator/Headout) for inventory scaling
- Deep-link tracking via UTM parameters

### 7.4 Bundle Logic (L9)
- Auto-suggest combos: "Book CN Tower + Toronto Harbour Cruise = Save 15%"
- Stored in `eligible_bundles` JSONB array
- Cross-sell IDs for "Customers also booked..."

---

## 8. Success Metrics (KPIs)

### Performance:
- **Speed:** Sub-1-second First Contentful Paint (FCP)
- **Mobile Score:** Lighthouse 90+ on Performance & Accessibility
- **Uptime:** 99.9% availability

### SEO:
- **Indexing:** 100% coverage on Google Search Console for all 600+ pages
- **Rankings:** Top 3 for "[City] Tours" queries in Canada
- **CTR:** >5% from organic search

### Trust:
- **Security:** "A" grade on Mozilla Security Headers test
- **SSL:** A+ on SSL Labs
- **Privacy:** GDPR/PIPEDA compliant

### Conversion:
- **Path:** <3 clicks from Home Page to Checkout
- **Cart Abandonment:** <30% (industry avg: 70%)
- **Mobile Conversion:** >40% of total bookings

---

## 9. Development Workflow

### Before coding ANY feature:
1. **Reference this PRD** to ensure alignment with the Category Leader vision
2. **Check the 9-Layer Taxonomy** for proper data classification
3. **Use the Design System** (colors, typography, components)
4. **Validate against Success Metrics** (Will this improve speed/SEO/conversion?)

### Code Review Checklist:
- [ ] Follows 9-layer taxonomy structure
- [ ] Uses design system colors/fonts
- [ ] Loads with skeleton state
- [ ] Includes Schema.org markup
- [ ] Has L7/L8 badge system
- [ ] Mobile-responsive
- [ ] Passes Lighthouse audit (90+)

---

## 10. Phase Roadmap

### Phase 1: Foundation (✅ Complete)
- Supabase setup + 9-layer schema
- Toronto Hub MVP
- PostGIS map integration
- Search engine v1

### Phase 2: Scale (In Progress)
- Replicate Toronto Hub to 30+ cities
- Advanced filtering sidebar
- Product page template
- Checkout flow

### Phase 3: Intelligence (Planned)
- AI recommendation engine
- Personalization (recently viewed, persona detection)
- Dynamic pricing
- Bundle suggestions

### Phase 4: Monetization (Future)
- Partner portal
- Affiliate tracking
- Revenue dashboards
- A/B testing framework

---

## 11. Competitive Analysis

| Feature | Tours North | Viator | GetYourGuide |
|---------|-------------|--------|--------------|
| 9-Layer Taxonomy | ✅ | ❌ | ❌ |
| PostGIS Map Search | ✅ | ⚠️ Basic | ⚠️ Basic |
| Canadian-First | ✅ | ❌ | ❌ |
| Indigenous Tourism | ✅ | ❌ | ❌ |
| Local Intelligence | ✅ | ❌ | ❌ |
| PWA | ✅ | ❌ | ⚠️ Limited |
| Safety-First Branding | ✅ | ⚠️ | ⚠️ |

---

## 12. Brand Voice & Messaging

### Tone:
- **Confident but friendly** (not corporate)
- **Educational** (teach users about Canada)
- **Empowering** (you can explore safely)

### Key Messages:
- "100% Verified Canadian Experiences"
- "Book with Confidence — Safety Verified, Insured, TICO Protected"
- "Discover the True North — Beyond the Tourist Traps"
- "Indigenous-Led, Locally-Sourced, Seasonally-Curated"

### Copy Examples:
- ❌ Bad: "Tours and activities in Toronto"
- ✅ Good: "100+ curated Toronto adventures — from the Iconic 10 to hidden Kensington flavor haunts"

---

## Appendix A: Glossary

- **City Hub**: A destination page (e.g., toronto.html) that aggregates all experiences for that city
- **Shelf**: A horizontal scrolling carousel of products (e.g., "Foodie Playbook")
- **9-Layer Taxonomy**: Our proprietary data classification system (L1-L9)
- **PostGIS**: PostgreSQL extension for geographic queries
- **GIN Index**: Generalized Inverted Index for full-text search
- **RLS**: Row Level Security in Supabase for data access control
- **FOMO**: Fear of Missing Out (urgency/scarcity tactics)
- **PWA**: Progressive Web App (installable like native app)

---

**Last Updated:** February 17, 2026  
**Owner:** Tours North Development Team  
**Next Review:** March 2026
