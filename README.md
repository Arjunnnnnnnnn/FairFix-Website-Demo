# FairFix-Website
# Bayti Care

Build a modern, premium, fully responsive marketing website + interactive demo for [APP NAME], an AI-powered home repair assistant built for Qatar. This is for a school hackathon under the theme "Public Services and Government Systems", aligned with Qatar National Vision 2030. The site must look like a polished, funded startup, not a school project.

=== THE PRODUCT ===
One-liner: "Point your phone at the problem. We tell you what's wrong, what it should cost, and who can fix it safely."

Problem: Residents and institutions in Qatar struggle to find trustworthy maintenance help. Much of the market is informal: unverified workers, unclear pricing, surprise charges at the door, and no accountability when a job goes wrong. Consumer protection and licensing exist on paper but are hard to enforce in everyday repairs.

Solution flow:
1. Snap: user takes a photo or short video of the problem (leaking pipe, AC blowing warm air, broken socket).
2. Diagnose: AI identifies the likely issue and rates urgency: "Safe to wait", "Fix today", or "Switch it off now".
3. Fair price: shows a Qatar-specific fair price range in QAR for that exact job.
4. Fix: if simple, gives a short safe DIY guide. If not, matches the user with a verified technician from a licensed company and LOCKS the quote before they arrive. Any extra work must be approved in-app.
5. Verify: when the technician arrives, the user scans their QR code to confirm name, photo, company, and approved trades.
6. Accountability: job record, before/after photos, rating, and a 30-day re-fix guarantee.

Why not just ChatGPT/Gemini: general AI can guess the problem but doesn't know Doha prices, can't send a verified technician, and can't hold anyone accountable. "The AI is the front door. The real product is trusted local price data and verified technicians."

Key features: AI photo diagnosis, urgency rating, fair price ranges, locked quotes, verified technician QR check, multilingual support (Arabic, English, Hindi, Urdu, Malayalam, Tagalog) with voice input, annual AC care plans, 30-day guarantee, complaint and dispute trail.

Revenue model: free for residents. Income from (1) 10-15% commission on booked jobs, (2) annual AC Care Plans for households, (3) monthly "Verified Partner" subscription for licensed maintenance companies, (4) business accounts for landlords, property managers and schools (future).

Qatar National Vision 2030 alignment:
- Economic Development: a fair, transparent, formal service sector; supports licensed local businesses.
- Social Development: safer homes, consumer protection, and fair, verified work for technicians.
- Human Development: multilingual access for Qatar's diverse population.
- Environmental Development: preventive AC maintenance reduces energy waste.

=== PAGE STRUCTURE (single long landing page with smooth scroll + sticky nav) ===
1. Navbar: logo, links (How it works, Features, Demo, Pricing, For Technicians, Vision 2030), language toggle (EN / AR), CTA button "Try the demo".
2. Hero: bold headline, subheadline, two CTAs ("Try the AI demo", "See how it works"), and a realistic phone mockup showing the diagnosis screen (photo of an AC unit, result card: "Likely low refrigerant", urgency badge, fair price "180-260 QAR", "Book verified technician" button). Subtle floating cards around the phone ("Verified technician", "Quote locked", "30-day guarantee").
3. Problem section: 3 pain-point cards with icons: "Who's at my door?", "Why did the price double?", "Who do I call when it goes wrong?".
4. How it works: 5-step animated timeline (Snap, Diagnose, Fair price, Fix, Verify).
5. Interactive demo (most important section): user uploads an image OR picks from 4 sample problems (AC not cooling, leaking sink, tripping breaker, clogged drain). Show a short "analyzing" animation, then a result card with: diagnosis, urgency badge (green/amber/red), fair price range in QAR, DIY tips or "Book a verified technician", and a mock technician card with photo, name, company, rating, and a QR code. Use realistic mock data; no real backend required. If an AI API is available, wire it up; otherwise use the sample responses.
6. Features grid: 6-8 cards with icons and one-line descriptions.
7. "Why not just ChatGPT?" comparison table: General AI chatbot vs informal market vs [APP NAME], rows: Diagnoses the problem, Knows Doha prices, Sends a verified technician, Locks the price, Verifies identity at the door, Guarantee, Multilingual.
8. Pricing: three cards: "Free" (diagnosis, fair prices, booking), "AC Care Plan" (yearly, pre-summer servicing, priority booking in peak season, mark as "Most popular"), "Business" (landlords, property managers, schools; "Contact us"). Use placeholder QAR prices clearly labelled as sample.
9. For Technicians and Companies: benefits of joining as a Verified Partner: pre-diagnosed leads, fair pay, verified profile that builds reputation, protection against fake bookings.
10. Vision 2030 section: four pillar cards in maroon accent, each explaining how [APP NAME] contributes.
11. Impact/roadmap: a simple timeline (Hackathon prototype, Pilot in Doha with partner companies, AC Care Plans launch, Business accounts, GCC expansion). Do NOT invent statistics; any numbers must be labelled "projected" or "sample".
12. FAQ accordion: Is it free? How are technicians verified? What if the price changes on site? What languages are supported? Is my data safe? (address hidden until booking confirmed, masked phone numbers).
13. Final CTA band + footer with team name, school (DPS-Modern Indian School, Doha), hackathon credit, social icons.

=== DESIGN DIRECTION ===
- Feel: premium, trustworthy, calm, modern. Think Apple product page meets a fintech app.
- Colors: deep navy or near-black background sections alternating with clean off-white sections; primary accent Qatar maroon (#8A1538); secondary accent a soft teal or warm gold for highlights; green/amber/red only for urgency badges.
- Typography: a clean geometric sans for headings (e.g., Plus Jakarta Sans or Sora), Inter for body, and an Arabic-friendly font (e.g., IBM Plex Sans Arabic or Cairo) for the AR version.
- Big, confident headings; generous whitespace; rounded corners (16-24px); soft shadows; subtle glassmorphism on floating cards.
- Motion: smooth fade/slide-in on scroll, hover lift on cards, animated counters only for labelled sample numbers, a satisfying "analyzing" scanner animation in the demo. Keep animations tasteful and fast.
- Subtle Qatari touches: a faint geometric/mashrabiya-inspired pattern in section backgrounds; avoid clichés like camels or excessive skyline imagery.
- Icons: a consistent outline icon set (e.g., Lucide).
- Full light and dark mode support.
- Arabic toggle must switch to proper RTL layout, not just translated text.
- Mobile-first: everything must look great on a phone, since judges may open it on one.
- Accessibility: good color contrast, readable font sizes, alt text, keyboard-navigable.

=== TECHNICAL ===
- Clean, well-structured components.
- All demo data stored in one easy-to-edit file so we can change prices, technicians, and diagnoses quickly.
- Fast loading, no broken images; use illustrations or generated placeholders instead of random stock photos.
- No login required for the demo.

Deliver the complete site, then list what we should customize before presenting (name, prices, team info, demo data).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a611faf7-e6f9-4450-8fb7-ebee9ceb0402).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
