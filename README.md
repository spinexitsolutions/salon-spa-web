# Solène — Salon & Spa Atelier

A mobile-first salon & spa website with an editorial "beauty magazine" design language (Archivo variable: ultra-condensed headlines + ultra-wide labels; plum, blush & Klein-blue palette) with a built-in **Studio OS** admin panel (CRM + CMS). Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion and Lenis.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Admin panel: **`/admin`** (demo login `admin@solene.studio` / `solene123` — there's an Autofill button on the login screen).

## Website

| Feature | Notes |
| --- | --- |
| Intro animation | 3 styles (Bloom / Frame / Minimal), wordmark, caption, images and duration all set from admin. `/?intro=1` forces replay. |
| Navigation | Desktop: vertical side rail with live clock, open/closed status, scroll gauge and a "Book now" tab. Mobile: app-style bottom tab bar with a raised Book button. The menu is a full-screen magazine "Index" (table of contents with page numbers and dotted leaders). |
| Masthead hero | Brand name auto-fitted to the full width that condenses into place, an issue/date line, a section strap, a live "Today's openings" ticket built from opening hours and existing bookings, a figure image with a blinds reveal, and a priced service index. |
| Velocity marquee | Speed and skew react to how fast you scroll. |
| Philosophy | Words light up as you scroll, and image pills open up inside the sentence. |
| Price list | Printed-menu style rows with dotted leaders; each row unfolds inline with image, description and Reserve. |
| Signature rituals | Sticky scrollytelling: the image and big index number change as each ritual takes focus; titles condense when active. |
| Team, gallery (filter + shared-element lightbox), memberships, testimonials carousel, offers with copyable codes, journal, FAQ, CTA with callback request | |
| Online booking | Service → artist → date/slot → details. Checks staff clashes, applies offer codes, saves to the CRM, gives a booking reference, an .ics calendar file and a WhatsApp share. |
| Gift cards | Live 3D-tilt card preview, 4 designs; orders appear in the CRM. |
| Contact | Enquiry form → leads, hours with today highlighted, Google Map. |
| Motion | Headings condense from wide to ultra-condensed as they scroll in, images open with a blinds shutter, blocks clip-wipe in, and the page background shifts between milk and blush per section. Smooth scroll, WhatsApp button, newsletter, reduced-motion support. |

## Studio OS (admin)

- **Dashboard** — revenue (last 30 days), today's bookings, 14-day revenue chart, top services, cancellation rate, upcoming appointments, latest leads.
- **CRM**
  - Appointments: list + week calendar, search/filter, inline status change, create/edit/delete, one-click WhatsApp confirmation.
  - Clients: lifetime spend, visits, tags, private notes, visit history, CSV export.
  - Leads & enquiries: contact / callback / newsletter inbox, status pipeline, convert to client.
  - Gift cards: codes, balances, redeem.
- **CMS** — services, categories, team, gallery, testimonials, memberships, offers, journal, FAQs, numbers. Drag to reorder, publish/hide, duplicate, upload images or paste URLs.
- **Homepage builder** — drag to reorder sections, show/hide any section, edit hero text and image, announcement bar. Includes a live mobile/desktop preview.
- **Intro animation** — style, text, timing, images, once-per-session, live preview.
- **Brand & theme** — name, 5 palette presets (Plum & Klein, Oxblood, Forest, Lilac Night, Tangerine) plus custom colours, 3 sans display typefaces (Archivo Condensed, Bricolage, Syne), corner radius, and toggles for smooth scroll, cursor and grain.
- **Business settings** — contact, WhatsApp, opening hours (these drive the booking slots and the live open/closed status), socials, SEO, admin credentials, and JSON export/import/reset.

## Architecture

- `lib/store.ts` — one Zustand store (persisted to `localStorage`) holds all content and CRM data, so the demo runs on any static host. Admin changes sync live to other open tabs and to the preview iframe.
- `lib/seed.ts` — demo content and generated CRM data.
- `lib/schemas.ts` — field definitions that drive the generic CMS editor.
- `components/sections/*` — homepage sections, rendered in the order set by the homepage builder.

> **Going to production:** swap the persisted store for a database (Supabase, Postgres or Firebase) and real authentication. The store's action API (`patch`, `upsert`, `remove`, `move`) maps directly onto CRUD endpoints.

Images: Unsplash.
