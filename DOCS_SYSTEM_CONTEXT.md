# DOCS_SYSTEM_CONTEXT: Tours North
*The Single Source of Truth for the 9-Layer Headless Engine*

## 1. Product Requirements Document (PRD)
**Project Version:** 2.0 (Headless Transformation)  
**Status:** In-Development / Refinement  
**Founder & Lead Architect:** Akash Anand  

### 1.1 Vision Statement
To revolutionize the North American travel market by providing a secure, data-driven, and highly curated discovery engine for Canadian adventures. Tours North replaces generic "directory" sites with an intelligent platform that understands human intent and prioritizes traveler security.

### 1.2 Objective
To build a scalable, multi-platform ecosystem (Web + Mobile App) using a Single Source of Truth (Supabase) and a 9-Layer Taxonomy to automate 600+ high-converting SEO pages.

## 2. Target Audience (Layer 7: Personas)
*   **The Solo Explorer:** Focus on transit hacks, safety protocols, and budget-conscious "hidden gems."
*   **The Family Foundation:** Focus on stroller-friendly paths, educational "Must-Sees," and security-verified guides.
*   **The Luxury Seeker:** Focus on high-ticket "Exclusively Canadian" items like heli-skiing and private aurora viewings.
*   **The Adventure Core:** Focus on high-adrenaline, weather-dependent wilderness expeditions.

## 3. The 9-Layer Taxonomy Logic
| Layer | Name | Description | Example |
| :--- | :--- | :--- | :--- |
| **L1** | **Intent** | High-level traveler motivation | Escape & Reset vs. Play & Thrill |
| **L2/3**| **Category** | Transactional & Operational vertical | Attractions, Food Tours, Adventure |
| **L4** | **Functional**| Physical Context | Land, Air, Water, Indoor, Mountain |
| **L5/6**| **Marketing**| Vibe & Sub-collections | Only-in-Canada, Winter-Warriors |
| **L7** | **Persona** | Traveler Segment | Solo, Family, Luxury, Couples |
| **L8** | **Context** | Real-time / Dynamic Factors | Weather safe, Seasonality, Accessibility |
| **L9** | **Revenue** | Commercial & Bundling logic | "Complete the Set" upsell logic |

## 4. Technical Specifications
*   **IDE:** Google Antigravity (IDX) for cloud-based, multi-platform development.
*   **Database:** Supabase (PostgreSQL) with Row-Level Security (RLS) enabled.
*   **Frontend:** HTML5, Tailwind CSS (Custom "Canadian Wilderness" Theme), Alpine.js (Logic).
*   **Design System:** Primary Palette: `#064e3b` (Forest Green), `#b91c1c` (Maple Red), `#f8fafc` (Snow White).
*   **Style:** Glassmorphism and Bento Grids.

## 5. Architectural Mandate
Whenever coding for Tours North, always adhere to this context:
1. **Headless Hydration:** Every product page is a "Spoke" pulling from the Supabase "Hub" via `tour-renderer.js`.
2. **Design Integrity:** Maintain the "Canadian Wilderness" aesthetic (High-quality imagery, Syne typography, premium spacing).
3. **Data Integrity:** Values must be traversed via the `getValueByPath` logic to support schema evolution.

## 6. Systemic Funnel Flow
- **Entry:** SEO Guide (Hacks) or Home Page.
- **Education:** Provincial Hub → City Hub.
- **Selection:** Interactive Filtered Grid.
- **Transaction:** Product Page with Sticky Booking Widget.

## 7. Content & SEO Strategy
- **Hub-and-Spoke:** 13 Provincial Hubs -> 30+ City Hubs -> 600+ individual Tour Spokes.
- **Answer Engine Opt (AEO):** Every guide include a "60-Second AI Summary" box.
