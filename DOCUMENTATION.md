# Xipra Technology — Complete Software Requirement & Technical Documentation

> **Status legend used throughout this document**
> - ✅ **Implemented & wired** — feature is complete and working end‑to‑end.
> - 🟡 **Backend/Admin only** — data & admin management exist, but the public website does **not** yet read this data (still shows static/curated content).
> - ⛔ **Not implemented** — explicitly not built yet.

This document describes the entire Xipra Technology platform in full technical detail: every page, module, workflow, database table, API endpoint, security control, storage bucket, and integration. It is written so a new developer can understand and continue the project without any additional context.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Complete Website Structure](#3-complete-website-structure)
4. [Public Website Features](#4-public-website-features)
5. [Admin Panel](#5-admin-panel)
6. [Complete CMS](#6-complete-cms)
7. [Certificate Management System](#7-certificate-management-system)
8. [Media Library](#8-media-library)
9. [Products Module](#9-products-module)
10. [Portfolio Module](#10-portfolio-module)
11. [Technology Module](#11-technology-module)
12. [Contact Module](#12-contact-module)
13. [Internship Module](#13-internship-module)
14. [Database](#14-database)
15. [Storage](#15-storage)
16. [Authentication](#16-authentication)
17. [API Documentation](#17-api-documentation)
18. [Security](#18-security)
19. [UI/UX Features](#19-uiux-features)
20. [Complete User Workflow](#20-complete-user-workflow)
21. [Project Architecture](#21-project-architecture)
22. [Future Scalability](#22-future-scalability)
23. [Final Project Summary](#23-final-project-summary)

---

## 1. Project Overview

### 1.1 Project Name
**Xipra Technology** — a premium corporate website and content platform for a software development & IT training company based in Himmatnagar, Gujarat, India.

### 1.2 Project Purpose
The platform serves three purposes simultaneously:

1. **Marketing website** — presents the company's brand, services, products, portfolio, and technology expertise with a high‑end, animated, 3D‑enhanced user experience.
2. **Lead & application capture** — collects contact enquiries and internship applications from the public, stores them in a database, and notifies the company by email.
3. **Certificate authenticity system** — issues verifiable training/internship certificates. Each certificate carries a unique QR code; anyone (typically a student or an employer) can verify a certificate by number or by scanning the QR, then preview, download, and print the official PDF.

The website is fully manageable from an **Admin Panel / CMS** so the business owner can operate it without editing source code.

### 1.3 Target Users
| User type | What they do |
|-----------|--------------|
| **Visitors / prospective clients** | Browse services, products, portfolio, technology stack; submit contact enquiries. |
| **Students / interns** | Apply for internships; verify, download and print their certificates. |
| **Employers / third parties** | Verify the authenticity of a Xipra certificate presented to them. |
| **Company administrators** | Manage all content, certificates, applications, and messages via the Admin Panel. |

### 1.4 Business Goal
- Establish a premium, trustworthy brand presence online.
- Generate qualified leads (contact + internship funnels).
- Provide a **tamper‑resistant, self‑service certificate verification** system that builds credibility for the company's training programs.
- Give non‑technical staff full control of website content and operations.

### 1.5 Website Type
A **server‑rendered, full‑stack web application** (not a static site). It combines:
- A public marketing website (mostly static/animated pages with two DB‑driven pages).
- A set of public REST APIs (forms + certificate verification).
- A secured Admin Panel + CMS.
- A relational database and cloud object storage backend.

### 1.6 Main Features
- Premium animated public website with light/dark themes and 3D hero.
- Certificate issuance with **auto‑generated unique QR codes**.
- Public certificate verification (by number or QR) with **PDF preview / download / print**.
- Contact & internship forms with validation, database persistence, and email notifications.
- A complete Admin Panel with dashboard, statistics, recent activity, and CRUD for every business entity.
- Content Management System for the Home and About pages (text + images editable from admin).
- JWT‑based admin authentication with protected routes.
- Cloud PostgreSQL database (Supabase) + cloud object storage (Supabase Storage).
- Security: input validation, rate limiting, spam honeypots, private file storage, and verified‑only access to sensitive documents.

---

## 2. Technology Stack

Every technology below is currently used in the codebase (`package.json`), with the rationale for each.

### 2.1 Frontend
| Technology | Version | Why it is used |
|-----------|---------|----------------|
| **Next.js (App Router)** | 15.5.21 | Full‑stack React framework. Provides file‑based routing, server components, server‑side rendering, API route handlers, image optimization, and middleware — everything the project needs in one framework. |
| **React** | 19.1.0 | Component‑based UI library that Next.js builds on. |
| **TypeScript** | 5.x | Static typing across the whole codebase (frontend, API, services, Prisma types) — catches errors at build time and documents data shapes. |
| **Tailwind CSS** | 4.x (`@tailwindcss/postcss`) | Utility‑first styling used for the entire design system, responsive layout, and theming. |
| **tw-animate-css** | 1.4.0 | Extra CSS animation utilities layered on Tailwind. |
| **Turbopack** | (Next dev flag) | Fast dev bundler (`next dev --turbopack`) for near‑instant hot reload. |

### 2.2 Animations & 3D
| Technology | Why |
|-----------|-----|
| **Framer Motion** (`framer-motion` 12) | Declarative animations: page transitions, scroll‑reveal, counters, hero entrance, modal transitions. Used across nearly every component. |
| **GSAP** was removed; **Lenis** (`lenis` 1.3) | Smooth‑scroll engine wrapping the whole site (`SmoothScrollProvider`). |
| **Three.js** (`three` 0.185) + **@react-three/fiber** + **@react-three/drei** + **maath** | WebGL 3D. Powers the animated floating‑shapes hero background (`FloatingShapes3D`). Loaded lazily / client‑only to avoid blocking first paint. |

### 2.3 Backend
| Technology | Why |
|-----------|-----|
| **Next.js API Route Handlers** | All backend endpoints live under `src/app/api/**/route.ts`. No separate server process. |
| **Node.js runtime** | Route handlers that touch the database, storage, email, or filesystem declare `export const runtime = "nodejs"`. |
| **Service layer** (`src/lib/services/*`) | Business logic (Prisma queries + storage + email) is isolated from HTTP handlers so it is reusable and testable. |

### 2.4 Database
| Technology | Why |
|-----------|-----|
| **PostgreSQL on Supabase** | Managed cloud Postgres. Chosen for reliability, JSON support, native enums, and tight integration with Supabase Storage. Migrated from a former local MySQL setup. |
| **Supavisor session pooler** | The app connects through Supabase's IPv4 **session pooler** (`aws-0-ap-northeast-1.pooler.supabase.com:5432`) because the direct `db.<ref>.supabase.co` host is IPv6‑only. Session mode supports prepared statements and migrations. |

### 2.5 ORM
| Technology | Why |
|-----------|-----|
| **Prisma ORM** 7.9 | Type‑safe database client and schema/migration tool. `@prisma/client` generates a fully typed client into `src/generated/prisma`. |
| **@prisma/adapter-pg** + **pg** 8 | Prisma 7 driver adapter using `node-postgres`. Configured with TLS (`ssl: { rejectUnauthorized: false }`) for Supabase. |

### 2.6 Storage
| Technology | Why |
|-----------|-----|
| **Supabase Storage** (`@supabase/supabase-js` 2) | Cloud object storage for all uploads. A **private** bucket holds certificate PDFs/images; **public** buckets hold website images (products, portfolio, logos, etc.). Accessed server‑side with the service (secret) key. Migrated from a former local‑disk storage layer. |

### 2.7 Authentication
| Technology | Why |
|-----------|-----|
| **JWT via `jose`** 6 | Edge‑compatible JWT signing/verification (HS256). Chosen over `jsonwebtoken` because `jose` runs in the Next.js middleware (Edge) runtime. |
| **bcryptjs** 3 | Password hashing (12 salt rounds) for admin accounts. |
| **HTTP‑only cookies** | The JWT is stored in a `httpOnly`, `SameSite=Lax`, `Secure`‑in‑production cookie — not accessible to client JavaScript (XSS‑resistant). |

### 2.8 Email Service
| Technology | Why |
|-----------|-----|
| **Nodemailer** 9 | Sends SMTP email for contact & internship notifications and student confirmations. Fully configured via environment variables; if SMTP is unset, sending is skipped gracefully (forms still store data). |

### 2.9 QR Code Library
| Technology | Why |
|-----------|-----|
| **qrcode** 1.5 | Generates certificate QR‑code PNGs **on demand** (server‑side) encoding the verification URL. No files are stored — the QR is deterministic from the certificate number. |

### 2.10 Validation
| Technology | Why |
|-----------|-----|
| **Zod** 4 | Runtime schema validation for every API input (auth, forms, CRUD, content). Provides typed parsing and structured field errors. |

### 2.11 UI Component Primitives & Icons
| Technology | Why |
|-----------|-----|
| **@base-ui/react** | Headless, accessible primitives (e.g., `Button` with a polymorphic `render` prop). |
| **class-variance-authority** + **clsx** + **tailwind-merge** | Compose Tailwind class variants safely (the `cn()` helper). |
| **lucide-react** | Primary icon set (outline icons) across the whole UI. |
| **react-icons** | Secondary brand icons (WhatsApp, phone, envelope on the contact page). |
| **shadcn** | Tailwind component tokens/utilities import (`shadcn/tailwind.css`). |

### 2.12 Theme
| Technology | Why |
|-----------|-----|
| **next-themes** 0.4 | Light/Dark theme with system detection, applied via a `class` attribute; default theme is **dark**. `suppressHydrationWarning` prevents SSR/CSR mismatch. |

### 2.13 Tooling
| Technology | Why |
|-----------|-----|
| **tsx** | Runs TypeScript scripts directly (`prisma/seed.ts`, `scripts/supabase-buckets.ts`). |
| **dotenv** | Loads `.env` for Prisma CLI and standalone scripts. |
| **ESLint** + `eslint-config-next` | Linting during `next build`. |

### 2.14 Deployment
- **Current state:** runs locally via `npm run dev` (Turbopack) or `npm run build` + `npm start` (production Node server). Database and storage are already **cloud‑hosted on Supabase**.
- **Deploy target (not yet configured):** the app is a standard Next.js server app and is ready to deploy to **Vercel** or any Node host. No deployment platform config (e.g., `vercel.json`) exists yet — see §23.

---

## 3. Complete Website Structure

The app uses Next.js **route groups** to give the public site and the admin panel separate root layouts:

```
src/app/
├── (site)/                     ← Public website (own layout: Navbar, Footer, smooth scroll, 3D noise overlay)
│   ├── page.tsx                ← Home            (DB-wired: hero + stats)
│   ├── about/page.tsx          ← About           (DB-wired: full page)
│   ├── technology/page.tsx     ← Technology      (static content)
│   ├── products/page.tsx       ← Products        (static content)
│   ├── portfolio/page.tsx      ← Portfolio       (static content)
│   ├── verify-certificate/page.tsx ← Verify      (live API + QR auto-load)
│   ├── internship/page.tsx     ← Internship form (live API)
│   ├── contact/page.tsx        ← Contact form    (live API)
│   ├── layout.tsx              ← Public root layout
│   └── template.tsx            ← Page-transition wrapper (Framer Motion)
├── admin/
│   ├── login/page.tsx          ← Admin login (public within /admin)
│   ├── page.tsx                ← redirects to /admin/dashboard
│   ├── layout.tsx              ← Admin root layout (ThemeProvider, no public chrome)
│   └── (dashboard)/            ← Protected admin shell (Sidebar + Topbar)
│       ├── layout.tsx          ← Reads session, renders AdminShell
│       ├── dashboard/page.tsx
│       ├── certificates/page.tsx
│       ├── internships/page.tsx
│       ├── contacts/page.tsx
│       ├── products/page.tsx
│       ├── portfolio/page.tsx
│       ├── technology/page.tsx
│       ├── settings/page.tsx
│       └── content/{page,home,about}/page.tsx
└── api/                        ← All backend endpoints (see §17)
```

### 3.1 Global public chrome (applies to every public page)
Defined in `src/app/(site)/layout.tsx`:
- **`ThemeProvider`** (next-themes), default **dark**, system detection enabled.
- **Global SVG noise overlay** — a fixed, `pointer-events-none`, low‑opacity fractal‑noise texture over the whole viewport for a premium film‑grain feel.
- **`SmoothScrollProvider`** — wraps content with Lenis smooth scrolling.
- **`Navbar`** — top navigation.
- **`Footer`** — site footer (see §4.11).
- **`FloatingActions`** — floating action buttons (e.g., quick contact/scroll).
- **`template.tsx`** — every route transition animates with a short fade/slide via Framer Motion.
- Fonts: **Geist Sans** + **Geist Mono** (via `next/font/google`).

### 3.2 Home page (`/`) ✅ (hero + stats DB‑wired)
A single server component that composes section components and loads editable content from the DB (`getHomeContent()`), passing it to the hero and statistics sections.

Sections in order:
1. **HeroSection** ✅ *DB‑wired* — full‑screen hero.
   - **3D background:** `FloatingShapes3D` (Three.js) — floating glass cubes + wireframe octahedrons, lit with colored directional/spot lights; loaded client‑only via `next/dynamic` (`ssr:false`).
   - **Aurora animated gradient** overlay (Framer Motion looping radial gradients) + bottom fade to background.
   - **Mouse parallax:** moving the mouse updates CSS variables (`--mouse-x/y`) translating the hero content subtly.
   - **Badge pill** (editable text) with a pinging primary dot.
   - **Headline** in three editable parts: prefix + gradient‑highlighted word + suffix (e.g., "Build The **Future** With Xipra").
   - **Description** paragraph (editable).
   - **Two CTA buttons** (editable label + link): primary (shimmer hover, arrow) and secondary (glass style).
   - **Scroll indicator** (bouncing chevron) that parallaxes/fades on scroll.
2. **StatisticsSection** ✅ *DB‑wired* — four (editable) animated counters that spring from 0 → value when scrolled into view, each with a `+` suffix and label (e.g., "500+ Projects Completed").
3. **ServicesSection** 🟡 *static* — service offerings cards.
4. **WhyChooseUsSection** 🟡 *static*.
5. **TechnologyPreview** 🟡 *static* — teaser of the tech stack.
6. **ProductsPreview** 🟡 *static* — featured products (uses `next/image`).
7. **PortfolioPreview** 🟡 *static* — featured projects (uses `next/image`).
8. **InternshipPreview** 🟡 *static* — internship CTA with image.
9. **CtaSection** 🟡 *static* — closing call‑to‑action.

> **Note:** Only the **Hero** and **Statistics** sections read from the CMS. Sections 3–9 render curated static content (see §6 and §23).

### 3.3 About page (`/about`) ✅ fully DB‑wired
A thin **server component** (`about/page.tsx`) calls `getAboutContent()` and renders the `AboutContent` client component with the data. Every text/image below is editable in the Admin CMS:
- **Hero banner:** badge, split gradient headline, description.
- **Company Introduction:** an image (editable URL/upload) with a floating "Years of Excellence" stat badge; a heading + subtitle + multiple paragraphs.
- **Mission & Vision:** two glass cards (Target / Eye icons) with editable body text.
- **Our Journey:** a vertical alternating timeline of milestones (editable `year`, `title`, `desc`).
- **Achievements:** a 4‑card grid; icons are fixed by position (Trophy/Users/Globe/Briefcase), text editable.
- **Why Choose Us:** a checklist of editable bullet points.
- **CTA banner:** "Start Your Digital Transformation" (static shared component).

### 3.4 Technology page (`/technology`) 🟡 static
Client component with hardcoded categories and technology entries rendered as animated cards. The **admin can manage technology categories/technologies in the database**, but this public page does not yet consume that data (see §11, §23).

### 3.5 Products page (`/products`) 🟡 static
Client component with a hardcoded `products` array (title, description, image, category). Cards use `next/image`, hover elevation, category tags. Admin CRUD exists in the DB but is not yet read here (see §9, §23).

### 3.6 Portfolio page (`/portfolio`) 🟡 static
Client component with a hardcoded `projects` array and a category filter bar (`All / Website / ERP / Software / Mobile App`). Animated masonry‑style cards with hover overlays, tech tags, and links. Admin CRUD exists in the DB but is not yet read here (see §10, §23).

### 3.7 Verify Certificate page (`/verify-certificate`) ✅ live
- **Search bar:** the student enters a certificate number and clicks "Verify Now" (loading spinner while verifying).
- **QR auto‑load:** if the URL contains `?number=XYZ` (i.e., the visitor scanned a QR), the page auto‑fills and auto‑verifies on mount.
- **Success state:** a two‑column result — details card (student name, course, certificate number, issue date, duration, colored **status pill**) + a preview card.
  - **Preview card:** embeds the certificate **PDF in an `<iframe>`**; if there is no PDF but a certificate image exists, it shows the image; otherwise a stylized fallback graphic.
  - **Download PDF** (opens the file with `?download=1`) and **Print Certificate** (invokes the embedded PDF's print, falling back to `window.print()`).
- **Not‑found state:** a polished "Certificate Not Found" screen with the searched ID.
- **Error state:** inline error banner (e.g., rate‑limited or network error).

### 3.8 Internship page (`/internship`) ✅ live form
- **Left:** program overview + a benefits list (6 animated cards).
- **Right (sticky):** the **application form** — Full Name, Email, Mobile, Education, Gender (select), Apply‑For‑Course (select), Address (textarea), plus a hidden **honeypot** field.
- On submit: client validates required fields, POSTs to `/api/public/internship`, shows a spinner, then a success or error banner. Fields reset on success.

### 3.9 Contact page (`/contact`) ✅ live form
- **Left:** the **message form** — Full Name, Mobile, Email, Subject, Message, plus a hidden honeypot. Floating‑label inputs.
- **Right:** company contact info (phones, emails, two office addresses, business hours — **currently hardcoded**), a map placeholder, and quick‑action buttons (WhatsApp / Call / Email).
- On submit: POSTs to `/api/public/contact` with loading/success/error states; resets on success.

### 3.10 Admin pages
See §5 and §6. All admin pages share the `AdminShell` (sidebar + topbar) and are protected by middleware.

---

## 4. Public Website Features

### 4.1 Light Theme ✅
Defined in `globals.css` under `:root` using OKLCH color tokens (soft blue‑tinted white background, deep charcoal‑blue foreground, brand‑blue primary). Every component uses semantic tokens (`bg-background`, `text-foreground`, `border-border`, `text-primary`, …) so both themes work automatically.

### 4.2 Dark Theme ✅ (default)
Defined under `.dark` with deep blue‑charcoal backgrounds and light foreground. `next-themes` toggles the `dark` class on `<html>`. There is a global theme transition (`transition-property: background-color, border-color, color, box-shadow`) for smooth switching.

### 4.3 Responsive Design ✅
Mobile‑first Tailwind breakpoints (`sm md lg xl`) throughout. Grids collapse to single columns, the navbar and admin sidebar become drawer/menu on small screens, images use `max-width:100%`, and wide tables scroll horizontally in their own containers.

### 4.4 Animations & Transitions ✅
- **Page transitions:** `template.tsx` fade/slide on every route change.
- **Scroll reveal:** Framer Motion `whileInView` on cards/sections.
- **Counters:** spring‑animated statistics.
- **Hero:** 3D shapes, aurora gradient, mouse parallax, entrance animations.
- **Smooth scrolling:** Lenis.
- **Micro‑interactions:** button shimmer, hover scale/elevation, pinging dots, bouncing scroll indicator.

### 4.5 Hero ✅ (editable)
See §3.2 — 3D animated background + editable badge/headline/description/CTAs.

### 4.6 Technology (public) 🟡
Static presentation of the company's stack (see §3.4).

### 4.7 Portfolio (public) 🟡
Static, filterable project gallery (see §3.6).

### 4.8 Products (public) 🟡
Static product showcase (see §3.5).

### 4.9 Contact ✅
Public form fully wired to the backend (validation → DB → SMTP). See §12.

### 4.10 Internship ✅
Public form fully wired (validation → DB → SMTP to company + confirmation to student). See §13.

### 4.11 Certificate Verification ✅
Full public verify flow with PDF preview/download/print and QR auto‑load. See §7.

### 4.12 Footer 🟡
`src/components/layout/Footer.tsx` renders navigation columns (Web Development, Web Designing, Mobile Development, Internship links), contact details, social links, and copyright — **all currently hardcoded**. A "Footer CMS" is **not** implemented (see §23).

### 4.13 SEO 🟡
- Static per‑app metadata: the public root layout sets `title` and `description`; the admin layout sets `robots: { index:false }`.
- The `SiteSetting` table stores `seoTitle`, `seoDescription`, `seoKeywords`, and the admin Settings page can edit them, **but the public pages do not yet consume these values** (no dynamic `<head>` from `SiteSetting`, no Open Graph image wiring). See §23.

---

## 5. Admin Panel

### 5.1 Shell & navigation ✅
`AdminShell` = **Sidebar** + **Topbar** + main content.
- **Sidebar** (`Sidebar.tsx`): brand mark + nav items → Dashboard, **Pages** (content CMS), Certificates, Internships, Messages, Products, Portfolio, Technology, Settings. Active route highlighted. Collapses to an off‑canvas drawer on mobile (overlay + slide).
- **Topbar** (`Topbar.tsx`): mobile menu button, "Welcome, {admin name}", and a **Logout** button (POSTs `/api/admin/auth/logout`, redirects to login).
- The `(dashboard)/layout.tsx` server component reads the current admin from the session cookie and passes the name into the shell.

### 5.2 Dashboard page ✅
`admin/(dashboard)/dashboard/page.tsx` is a server component (`force-dynamic`) that calls three services in parallel.

**Stat cards (6)** — `getDashboardStats()` returns live counts:
- Total Certificates
- Internship Applications
- Contact Messages
- Products
- Portfolio Projects
- Technologies

**Recent Activity** — `getRecentActivity(8)` merges the latest certificates, internship applications, and contact messages into one time‑sorted feed, each with an icon, title, subtitle, and relative "time ago".

**Quick Actions** — shortcut cards linking to create flows: New Certificate, New Product, New Project, New Technology.

**Latest Certificates** — `getLatestCertificates(5)` lists the newest certificates with student, number, course, **PDF/QR badges**, status badge, and time.

> **Charts:** ⛔ Not implemented. The dashboard uses numeric stat cards + lists, not graphical charts (see §23).

### 5.3 Permissions / roles ✅ (role‑ready)
- The `Admin.role` enum is `SUPER_ADMIN | ADMIN`; the seeded account is `SUPER_ADMIN`.
- **Every** admin API handler calls `requireAdmin()` (defense in depth) in addition to middleware protection.
- Role‑based *differentiation* of capabilities (e.g., restricting some actions to `SUPER_ADMIN`) is **not** yet enforced — the schema and helpers are ready for it, but all authenticated admins currently have full access.

---

## 6. Complete CMS

The CMS spans two mechanisms: **entity CRUD** (certificates, products, portfolio, technology, contacts, internships) and **page content** (Home/About via a `PageContent` JSON store).

### 6.1 Home CMS ✅ (partial coverage)
`admin/(dashboard)/content/home` — edits the `home` `PageContent` row.
- **Hero:** badge text, title prefix / highlighted / suffix, description, primary button (label+link), secondary button (label+link).
- **Statistics:** an editable list of `{ value, label }` counters (add/remove/reorder by editing).
- **Save** → `PUT /api/admin/content/home` (Zod‑validated). A "View page" link opens `/`.
> Covers Hero + Statistics only. Services/previews/CTA sections are **not** editable yet (see §23).

### 6.2 About CMS ✅ (full coverage)
`admin/(dashboard)/content/about` — edits the `about` `PageContent` row: hero (badge/title/description); intro (image upload, badge value/label, heading, subtitle, paragraph list); mission; vision; journey timeline list; achievements list; "why choose us" list. **Save** → `PUT /api/admin/content/about`. Every field is reflected on the public `/about` page.

### 6.3 Technology CMS 🟡 (admin CRUD only)
`admin/(dashboard)/technology` — two tabs:
- **Categories:** create/edit/delete `TechnologyCategory` (name, icon, display order).
- **Technologies:** create/edit/delete `Technology` (name, category, icon, description, order).
Data is stored in Postgres. **The public `/technology` page does not yet render this data.**

### 6.4 Product CMS 🟡 (admin CRUD only)
`admin/(dashboard)/products` — full CRUD with search + pagination. Fields: title, category, description, image (upload to Supabase public bucket), features (one per line), active flag, display order. **The public `/products` page does not yet render this data.**

### 6.5 Portfolio CMS 🟡 (admin CRUD only)
`admin/(dashboard)/portfolio` — full CRUD with search + pagination. Fields: title, category, client, description, cover image (upload), gallery images (multi‑upload), project URL, featured flag, order, and **technologies used** (multi‑select linked to the Technology table). **The public `/portfolio` page does not yet render this data.**

### 6.6 Certificate CMS ✅
See §7 — full CRUD + PDF + optional image + auto QR, fully wired to the public verify flow.

### 6.7 Media Library ⛔ Not implemented
There is no standalone Media Library module (no browse/search/replace/delete gallery of all assets). Individual modules have their own upload widgets, and all uploads go to Supabase Storage, but a central library UI does not exist. See §8 and §23.

### 6.8 Site Settings CMS 🟡 (storage + admin editing; not consumed publicly)
`admin/(dashboard)/settings` edits the single `SiteSetting` row: company name, logo (upload), phone numbers (list), emails (list), addresses (list), social links (platform+URL list), and SEO fields (title, description, keywords). **These values are saved but not yet read by the public footer / contact page / `<head>`.**

### 6.9 Footer CMS ⛔ Not implemented
Footer content is hardcoded in `Footer.tsx`; there is no footer content model or editor.

### 6.10 SEO CMS 🟡 (fields only)
SEO fields exist on `SiteSetting` and are editable, but not applied to public metadata (see §4.13).

### 6.11 Contact CMS ✅ (management)
`admin/(dashboard)/contacts` — view all messages (search + pagination), open a detail modal (name, email, phone, subject, message), change **status** (Unread/Read/Replied), and delete. Reply is done outside the system (email/phone) — the status models that workflow.

### 6.12 Internship CMS ✅ (management)
`admin/(dashboard)/internships` — view all applications (search + pagination), open a detail modal (all submitted fields incl. education/gender/address), change **status** (Pending/Reviewed/Accepted/Rejected), delete, and **Export CSV**.

---

## 7. Certificate Management System

This is the platform's flagship feature. Full lifecycle from admin issuance to student verification.

### 7.1 Data model
- **`Certificate`**: `certificateNumber` (unique, case‑insensitive), `studentName`, `course`, `duration`, `issueDate`, `status` (ACTIVE/REVOKED/EXPIRED), `remarks` (notes), `qrCodePath` (the QR route), `imagePath`/`imageType` (optional image in private storage), timestamps.
- **`CertificateFile`**: one‑to‑many PDFs attached to a certificate (`fileName`, `filePath` = private bucket object key, `fileType`, `fileSize`).
- **`VerificationLog`**: every verification attempt (see §7.7).

### 7.2 How the admin creates a certificate
1. Admin opens **Certificates → Add Certificate**.
2. Enters number, student, course, duration, issue date, status, optional remarks.
3. On save → `POST /api/admin/certificates`:
   - **Case‑insensitive duplicate check** (`assertCertificateNumberUnique`) → returns **409** if the number already exists in any letter case.
   - Creates the row and immediately stores the deterministic **QR route** in `qrCodePath`.
4. The certificate now exists; the modal switches to "edit" mode so files/image can be attached.

### 7.3 How PDF upload works
- In the edit modal, admin clicks **Upload PDF** → `POST /api/admin/certificates/[id]/files` (multipart).
- `savePrivatePdf()` validates: MIME must be `application/pdf`, size ≤ `MAX_UPLOAD_SIZE_MB` (10 MB), and the bytes must start with the **`%PDF-` magic number**.
- The file is uploaded to the **private `certificates` Supabase bucket** at key `certificates/<uuid>.pdf`; a `CertificateFile` row records it.
- **Replace** = delete the existing file (trash icon) then upload a new one. **Delete** = `DELETE /api/admin/certificates/[id]/files/[fileId]` (removes DB row + storage object).
- **Preview/Download in admin:** links point to `GET /api/admin/certificates/[id]/files/[fileId]/download` (auth‑gated; streams from Supabase; `?download=1` forces attachment).

### 7.4 Optional certificate image
- Admin can upload a JPG/PNG/WEBP image (`POST /api/admin/certificates/[id]/image`) stored **privately** in `certificate-images/<uuid>`. Used as a preview fallback if no PDF exists. Delete via `DELETE` on the same route.

### 7.5 How the QR code works
- Each certificate has a unique QR that encodes: `NEXT_PUBLIC_APP_URL + /verify-certificate?number=<certificateNumber>`.
- The QR PNG is generated **on demand** by `GET /api/public/certificates/[number]/qr` (using the `qrcode` library) — it is **not** stored on disk, so it always reflects the current number and works in any environment.
- Admin actions in the modal: **View QR**, **Download QR** (`?download=1`), **Regenerate QR** (`POST /api/admin/certificates/[id]/qrcode` — recomputes the route; also auto‑syncs if the certificate number changes).
- Belongs to exactly one certificate; the route returns **404** if the number does not exist.

### 7.6 How students verify
Two entry paths, both landing on `/verify-certificate`:
1. **Manual:** the student types the certificate number and clicks Verify.
2. **QR scan:** scanning opens `/verify-certificate?number=...`; the page auto‑verifies on load.

The page calls `POST /api/public/verify` → `verifyCertificate()`:
- **Case‑insensitive exact match** on `certificateNumber` (Prisma `mode:"insensitive"`).
- Writes a **VerificationLog** row (success or failure) with IP + user agent + timestamp.
- Returns the public certificate DTO (student, course, duration, issue date, status) plus `hasFile`/`fileUrl` and `hasImage`/`imageUrl` — **only if the certificate is ACTIVE**.

### 7.7 Audit logging
Every verify attempt (hit or miss) inserts a `VerificationLog` (`certificateNumber`, `certificateId?`, `success`, `ipAddress`, `userAgent`, `createdAt`). Provides an audit trail and supports brute‑force analysis.

### 7.8 How students preview / download / print
Only for **ACTIVE** certificates that have a PDF:
- **Preview:** the PDF streams inline via `GET /api/public/certificates/[number]/file` embedded in an `<iframe>`.
- **Download:** the same URL with `?download=1` (attachment disposition).
- **Print:** triggers the embedded PDF iframe's `print()` (fallback `window.print()`).
- If the certificate is **REVOKED/EXPIRED**, the file & image routes return **404** — the document is never publicly reachable, though verification still shows the (revoked) status. The QR still resolves (it only links to the verify page).

### 7.9 End‑to‑end workflow (Admin → Student)
```
Admin creates certificate ──► QR auto-generated (deterministic)
        │
        ├─► Admin uploads PDF (private bucket) [+ optional image]
        │
        ▼
Certificate is ACTIVE and verifiable
        │
Student scans QR  ──►  /verify-certificate?number=XYZ  ──► auto-verify
   (or types number)                                   │
        ▼                                               ▼
   POST /api/public/verify  ──► case-insensitive match ──► audit log
        ▼
   Details shown + PDF preview
        ├─► Download PDF  (?download=1)
        └─► Print PDF     (iframe.print)
```

---

## 8. Media Library

⛔ **Not implemented as a standalone module.** There is no central library UI to browse, search, filter, preview, replace, or delete all assets in one place.

What **does** exist today (the building blocks a future Media Library would sit on):
- **Upload:** every module that needs an image uses `ImageUploadField` / `MultiImageUploadField` → `POST /api/admin/upload` → **Supabase Storage** public buckets. Certificate PDFs/images use dedicated private‑bucket routes.
- **Preview:** inline in each field (thumbnail) and via `next/image`.
- **Replace:** re‑upload replaces the stored URL on the entity; the old object can be removed via `deleteUploadedFile()`.
- **Delete:** entity deletes cascade to their stored objects (certificate delete removes its private files/image).
- **Supported types:** images `jpg/png/webp/gif/svg`; PDFs `application/pdf`.
- **Max size:** `MAX_UPLOAD_SIZE_MB` (default **10 MB**), enforced in code and as a bucket policy.
- **Search / filtering across all media:** ⛔ not available (no library index).

See §23 for the concrete path to build the full Media Library on top of these primitives.

---

## 9. Products Module

### 9.1 Fields (`Product` table)
`title`, `slug` (unique, auto‑generated from title), `category`, `description`, `image` (Supabase public URL), `features` (JSON string array), `isActive` (bool), `order` (int), timestamps.

### 9.2 CRUD (admin) ✅
- **List:** `GET /api/admin/products` — paginated (10/page), case‑insensitive search on title/category.
- **Create:** `POST /api/admin/products` — Zod‑validated; unique slug generated (`uniqueSlug`).
- **Read one:** `GET /api/admin/products/[id]`.
- **Update:** `PUT /api/admin/products/[id]` — re‑slugs on title change; deletes the old image if replaced.
- **Delete:** `DELETE /api/admin/products/[id]` — removes the product and its stored image.

### 9.3 Images ✅
Single product image uploaded via `ImageUploadField` (subdir `products`) → Supabase **`products`** public bucket → CDN URL stored in `Product.image`.

### 9.4 Frontend connection 🟡
The public `/products` page currently renders a **hardcoded** list. Wiring it to `GET`/a public products loader is pending (see §23).

---

## 10. Portfolio Module

### 10.1 Fields (`PortfolioProject` table)
`title`, `slug` (unique), `category`, `client`, `description`, `image` (cover, public URL), `images` (JSON array of gallery URLs), `projectUrl`, `isFeatured` (bool), `order`, and a many‑to‑many relation `technologies` (linked to `Technology`). Timestamps.

### 10.2 Gallery & images ✅
- **Cover image:** single `ImageUploadField` (bucket `portfolio`).
- **Gallery:** `MultiImageUploadField` — multiple images, each uploaded to the `portfolio` bucket, stored as a JSON array.

### 10.3 Categories & featured ✅
- Free‑text `category` (e.g., Website, ERP, Software, Mobile App).
- `isFeatured` flag to highlight projects (star badge in admin list).

### 10.4 Technology used ✅
Multi‑select of existing technologies; stored via Prisma implicit M:N (`PortfolioTechnologies`).

### 10.5 CRUD (admin) ✅
`GET/POST /api/admin/portfolio`, `GET/PUT/DELETE /api/admin/portfolio/[id]` — paginated + case‑insensitive search (title/category/client); slug management; cover‑image cleanup on delete.

### 10.6 Frontend display 🟡
The public `/portfolio` page renders a **hardcoded**, filterable gallery. Wiring to DB data is pending (see §23).

---

## 11. Technology Module

### 11.1 Categories (`TechnologyCategory`)
`name`, `slug` (unique), `icon`, `order`, plus a one‑to‑many list of `technologies`.

### 11.2 Technologies (`Technology`)
`name`, `slug` (unique), `icon`, `description` (rich‑text‑ready plain text), `categoryId` (FK, cascade delete), `order`, and the M:N link back to portfolio projects.

### 11.3 Icons
Stored as a text field (icon name or emoji). There is **no icon file uploader** — icons are typed. Portfolio/product images are uploaded; technology icons are text.

### 11.4 Ordering
Both categories and technologies have an integer `order` for display sequencing; admin lists sort by `order` then name.

### 11.5 CRUD (admin) ✅
- Categories: `GET/POST /api/admin/technology-categories`, `GET/PUT/DELETE /api/admin/technology-categories/[id]` (deleting a category cascades its technologies).
- Technologies: `GET/POST /api/admin/technologies`, `GET/PUT/DELETE /api/admin/technologies/[id]`.
- The admin Technology page presents both under tabs with search.

### 11.6 Frontend connection 🟡
The public `/technology` page is static; consuming the DB is pending.

---

## 12. Contact Module

### 12.1 Frontend form ✅
`/contact` — Name, Mobile, Email, Subject, Message + hidden honeypot (`company`). Floating‑label inputs; submit shows spinner and a success/error banner; resets on success.

### 12.2 Validation ✅
`publicContactSchema` (Zod): name (2–120), email (valid, ≤180), phone (optional, regex, ≤20), subject (optional, ≤180), message (10–5000), honeypot (must be empty).

### 12.3 Database ✅
`ContactMessage` — `name`, `email`, `phone?`, `subject?`, `message`, `status` (UNREAD/READ/REPLIED), timestamps. Input is sanitized (`sanitizeText`) before storage.

### 12.4 SMTP ✅
On success, `contactCompanyEmail()` renders a branded HTML email and Nodemailer sends it to `MAIL_COMPANY_CONTACT` (with the sender as `replyTo`). If SMTP is unconfigured, sending is skipped but the message is still stored.

### 12.5 Admin view / search / delete ✅
`admin/(dashboard)/contacts` — paginated table, case‑insensitive search (name/email/subject), detail modal, status change, delete.

### 12.6 Security ✅
Rate limited (5/min per IP), honeypot spam drop (returns success but does not store), input sanitization.

---

## 13. Internship Module

### 13.1 Registration form ✅
`/internship` — Full Name, Email, Mobile, Education, Gender, Course, Address + honeypot. Course/Gender are selects whose display labels are stored.

### 13.2 Validation ✅
`publicInternshipSchema` (Zod): fullName (2–120), email (valid), phone (7–20, regex), course (1–120), education/gender/address optional with length caps, honeypot empty.

### 13.3 Database ✅
`InternshipApplication` — `fullName`, `email`, `phone`, `domain` (= selected course), `education?`, `gender?`, `address?`, plus legacy‑compatible `collegeName?`, `duration?`, `resumeUrl?`, `message?`, and `status` (PENDING/REVIEWED/ACCEPTED/REJECTED). Sanitized before storage.

### 13.4 SMTP ✅
Two emails on success: a **company notification** to `MAIL_COMPANY_INTERNSHIP` (all fields), and a **branded confirmation to the student** thanking them and echoing their selected course. Both skip gracefully if SMTP is unset.

### 13.5 Admin management ✅
`admin/(dashboard)/internships` — paginated table, case‑insensitive search (name/email/domain), detail modal (shows all fields including education/gender/address), status change, delete.

### 13.6 CSV Export ✅
`GET /api/admin/internships/export` streams a CSV (id, fullName, email, phone, domain, collegeName, duration, status, createdAt) with proper quoting/escaping and an attachment header.

### 13.7 Security ✅
Rate limited (5/min per IP), honeypot, sanitization.

---

## 14. Database

**Engine:** PostgreSQL (Supabase). **ORM:** Prisma. **Client output:** `src/generated/prisma`. Migration: `prisma/migrations/0_init` (Postgres). Twelve models (the 10 originally specified + `VerificationLog` + `PageContent`).

### 14.1 Enums
- `AdminRole`: `SUPER_ADMIN | ADMIN`
- `CertificateStatus`: `ACTIVE | REVOKED | EXPIRED`
- `ApplicationStatus`: `PENDING | REVIEWED | ACCEPTED | REJECTED`
- `MessageStatus`: `UNREAD | READ | REPLIED`

### 14.2 `admins`
| Column | Type | Notes |
|--------|------|------|
| id | String (cuid) | PK |
| name | String | |
| email | String | **unique** |
| password | String | bcrypt hash |
| role | AdminRole | default `ADMIN` |
| isActive | Boolean | default true; inactive accounts cannot log in |
| lastLoginAt | DateTime? | updated on login |
| createdAt / updatedAt | DateTime | |

**Why:** stores admin accounts for authentication and (future) role‑based authorization.

### 14.3 `certificates`
| Column | Type | Notes |
|--------|------|------|
| id | String (cuid) | PK |
| certificateNumber | String | **unique** (case‑insensitive enforced in code) |
| studentName, course, duration | String | |
| issueDate | DateTime | |
| status | CertificateStatus | default `ACTIVE` |
| remarks | Text? | internal notes |
| qrCodePath | String? | the on‑demand QR route |
| imagePath / imageType | String? | optional private image |
| createdAt / updatedAt | DateTime | |
| files | CertificateFile[] | relation |

Indexes: `studentName`. **Why:** the core credential record.

### 14.4 `certificate_files`
| Column | Type | Notes |
|--------|------|------|
| id | String | PK |
| certificateId | String | **FK → certificates.id**, `onDelete: Cascade` |
| fileName | String | |
| filePath | String | private bucket object key |
| fileType | String | e.g. application/pdf |
| fileSize | Int | bytes |
| uploadedAt | DateTime | |

Index: `certificateId`. **Why:** one certificate can have multiple PDF files; cascade ensures cleanup with the parent.

### 14.5 `verification_logs`
| Column | Type | Notes |
|--------|------|------|
| id | String | PK |
| certificateNumber | String | the number the visitor searched |
| certificateId | String? | set when a match was found |
| success | Boolean | true if found |
| ipAddress | String? | client IP |
| userAgent | Text? | client UA |
| createdAt | DateTime | |

Indexes: `certificateNumber`, `createdAt`. **Why:** audit trail of every verification attempt. (No FK to `certificates` so logs survive certificate deletion.)

### 14.6 `internship_applications`
| Column | Type | Notes |
|--------|------|------|
| id | String | PK |
| fullName, email, phone | String | |
| domain | String | selected course |
| collegeName?, duration?, education?, gender? | String? | |
| address? | Text? | |
| resumeUrl?, message? | String?/Text? | reserved for future use |
| status | ApplicationStatus | default `PENDING` |
| createdAt / updatedAt | DateTime | |

Index: `status`. **Why:** stores internship applications for admin review.

### 14.7 `contact_messages`
| Column | Type | Notes |
|--------|------|------|
| id | String | PK |
| name, email | String | |
| phone?, subject? | String? | |
| message | Text | |
| status | MessageStatus | default `UNREAD` |
| createdAt / updatedAt | DateTime | |

Index: `status`. **Why:** stores contact enquiries.

### 14.8 `products`
| Column | Type | Notes |
|--------|------|------|
| id | String | PK |
| title | String | |
| slug | String | **unique** |
| category? | String? | |
| description | Text | |
| image? | String? | public URL |
| features? | Json? | string array |
| isActive | Boolean | default true |
| order | Int | default 0 |
| createdAt / updatedAt | DateTime | |

Index: `isActive`. **Why:** company products catalog.

### 14.9 `portfolio_projects`
| Column | Type | Notes |
|--------|------|------|
| id | String | PK |
| title | String | |
| slug | String | **unique** |
| category | String | |
| client? | String? | |
| description | Text | |
| image? | String? | cover URL |
| images? | Json? | gallery URLs |
| projectUrl? | String? | |
| isFeatured | Boolean | default false |
| order | Int | default 0 |
| technologies | Technology[] | **M:N** `PortfolioTechnologies` |
| createdAt / updatedAt | DateTime | |

Index: `category`. **Why:** showcase of completed work.

### 14.10 `technology_categories`
| id (PK) · name · slug (unique) · icon? · order · technologies[] · timestamps |

**Why:** groups technologies (e.g., Frontend, Backend).

### 14.11 `technologies`
| id (PK) · name · slug (unique) · icon? · description(Text)? · categoryId (**FK → technology_categories.id**, cascade) · projects[] (M:N) · order · timestamps |

Index: `categoryId`. **Why:** individual technologies, grouped by category and linkable to portfolio projects.

### 14.12 `site_settings`
Single row (`id` default 1). Columns: `companyName`, `logoUrl?`, `phones?` (Json), `emails?` (Json), `addresses?` (Json), `socialLinks?` (Json), `themeSettings?` (Json), `seoTitle?`, `seoDescription?` (Text), `seoKeywords?` (Text), `updatedAt`. **Why:** global company/SEO settings (singleton). *Currently storage + admin editing only; not consumed publicly.*

### 14.13 `page_contents`
| id (PK) · key (**unique**, e.g. `home`/`about`) · content (Json) · createdAt · updatedAt |

**Why:** the CMS store for editable page content. One JSON blob per page; the service layer merges stored content over typed defaults so pages always have every field.

### 14.14 Relationships summary
- `certificates` 1‑◄ `certificate_files` (cascade).
- `technology_categories` 1‑◄ `technologies` (cascade).
- `portfolio_projects` ►◄ `technologies` (many‑to‑many, implicit join `PortfolioTechnologies`).
- `verification_logs` references a certificate by number/id **without** a hard FK (logs are retained after deletion).
- `site_settings` and `page_contents` are standalone singleton/keyed stores.

---

## 15. Storage

**Provider:** Supabase Storage (S3‑compatible object storage), accessed server‑side with the **secret/service key** (`SUPABASE_SECRET_KEY`) through `getSupabaseAdmin()`.

### 15.1 Buckets (created by `scripts/supabase-buckets.ts`)
| Bucket | Visibility | Holds | Allowed types |
|--------|-----------|-------|---------------|
| `certificates` | **private** | certificate PDFs (`certificates/*`) & images (`certificate-images/*`) | pdf, jpg, png, webp |
| `products` | public | product images | images |
| `portfolio` | public | cover + gallery images | images |
| `technology` | public | (reserved) technology icons | images |
| `hero` | public | (reserved) hero images | images |
| `logos` | public | company logo / favicon (Settings) | images |
| `assets` | public | About image & other website assets | images + pdf |

Each bucket has `fileSizeLimit = MAX_UPLOAD_SIZE_MB` and an allowed‑MIME policy set at creation.

### 15.2 Where certificates are stored
In the **private** `certificates` bucket. The DB stores only the object **key** (e.g., `certificates/<uuid>.pdf`), never a public URL. Files are never directly reachable — they are streamed through access‑gated API routes.

### 15.3 Where images are stored
In **public** buckets. `saveUploadedFile()` maps the app's logical subdir → bucket (`products→products`, `portfolio→portfolio`, `settings→logos`, `content→assets`) and returns the Supabase **public CDN URL**, which is stored on the entity and rendered via `next/image` (the Supabase host is whitelisted in `next.config.ts`).

### 15.4 How uploads work
1. Admin selects a file in an upload field (drag/drop or picker).
2. The field POSTs multipart to `POST /api/admin/upload` (public images) or a dedicated certificate route (private PDFs/images).
3. Server validates type + size (+ PDF magic bytes), generates a UUID object name, uploads to the correct bucket, and returns the URL (public) or object key (private).

### 15.5 How downloads work
- **Public images:** served directly from the Supabase CDN URL.
- **Certificate PDFs/images:** streamed by API routes that first check authorization/status, then `download()` the object from Supabase and return the bytes with the right `Content‑Type` and `Content‑Disposition`.

### 15.6 How deletion works
- `deletePrivateFile(objectKey)` → `remove()` from the private bucket (best‑effort; missing object is not an error).
- `deleteUploadedFile(publicUrl)` → parses `bucket` + `path` out of the Supabase public URL (`parsePublicUrl`) and removes it.
- Entity deletes cascade: deleting a certificate removes its PDF(s) + image; deleting a product/portfolio removes its image(s).

---

## 16. Authentication

Custom JWT auth (not Supabase Auth). Implemented in `src/lib/auth/*` and `src/middleware.ts`.

### 16.1 Admin login
`POST /api/admin/auth/login` → `loginAdmin()`:
- Looks up the admin by email; rejects if missing or `isActive=false`.
- Verifies the password with **bcrypt** (`verifyPassword`).
- Updates `lastLoginAt`.
- Signs a JWT and sets it as an HTTP‑only cookie.
- Invalid credentials → **401** with a generic message (no user enumeration).

### 16.2 JWT
- Library **`jose`**, algorithm **HS256**, secret `JWT_SECRET`.
- Payload: `sub` (admin id), `email`, `name`, `role`, `iat`, `exp`.
- Expiry: `JWT_EXPIRES_IN` (default **7d**).

### 16.3 Session & cookies
- Cookie name: `AUTH_COOKIE_NAME` (default `xipra_admin_session`).
- Flags: `httpOnly`, `sameSite=lax`, `secure` in production, `path=/`, `maxAge` 7 days.
- Helpers: `setSessionCookie`, `clearSessionCookie`, `getSessionFromRequest` (middleware/Edge), `getCurrentAdmin` (server components / route handlers).

### 16.4 Middleware & protected routes
`src/middleware.ts` (matcher `['/admin/:path*', '/api/admin/:path*']`):
- **`/api/admin/*`:** requires a valid session (except the public login route) → otherwise **401 JSON**.
- **`/admin/*` pages:** unauthenticated users are redirected to `/admin/login?from=...`; authenticated users hitting `/admin/login` are redirected to the dashboard.
- **Defense in depth:** every admin route handler *also* calls `requireAdmin()` so security never depends on middleware alone.

### 16.5 `me` & logout
- `GET /api/admin/auth/me` → returns the current admin (id, name, email, role).
- `POST /api/admin/auth/logout` → clears the session cookie.

### 16.6 Seeding
`prisma/seed.ts` creates the first `SUPER_ADMIN` from `ADMIN_SEED_*` env vars (default `admin@xipratech.com` / `ChangeMe@123`) and ensures the `SiteSetting` singleton exists.

---

## 17. API Documentation

**Conventions**
- **Success envelope:** `{ "success": true, "data": <T>, "message"?: string, "meta"?: {...} }`.
- **Error envelope:** `{ "success": false, "error": { "message": string, "details"?: any } }`.
- **Status codes:** 200 OK · 201 Created · 400 Bad Request · 401 Unauthorized · 404 Not Found · 409 Conflict (duplicate) · 413 Too Large · 415 Unsupported Media · 422 Validation Failed · 429 Rate Limited · 500 Server Error.
- **Pagination (list endpoints):** query `?page=&limit=&search=`; `limit` default 10, max 100; `meta = { total, page, limit, totalPages }`.
- **Auth:** all `/api/admin/*` require the session cookie (enforced by middleware + `requireAdmin()`), except `login`. All `/api/public/*` are open (but rate‑limited).
- **Error handling:** every handler is wrapped by `withApiHandler`, which maps Zod errors → 422, `HttpError` → its status, Prisma `P2002` → 409, `P2025` → 404, and anything else → 500.

### 17.1 Auth
| Method | Route | Auth | Body | Response |
|--------|-------|------|------|----------|
| POST | `/api/admin/auth/login` | public | `{ email, password }` (Zod: valid email, password ≥6) | `{ admin }` + sets cookie; 401 on bad creds |
| POST | `/api/admin/auth/logout` | admin | — | clears cookie |
| GET | `/api/admin/auth/me` | admin | — | `{ id, name, email, role }` |

### 17.2 Dashboard
| GET | `/api/admin/dashboard` | admin | — | `{ stats, recentActivity }` |

### 17.3 Certificates (admin)
| Method | Route | Body / Notes |
|--------|-------|--------------|
| GET | `/api/admin/certificates` | list (paginated, search) |
| POST | `/api/admin/certificates` | create (Zod); **409** if number exists (any case) |
| GET | `/api/admin/certificates/[id]` | read one |
| PUT | `/api/admin/certificates/[id]` | update (re‑checks uniqueness; syncs QR) |
| DELETE | `/api/admin/certificates/[id]` | delete (+ storage cleanup) |
| POST | `/api/admin/certificates/[id]/files` | upload PDF (multipart; pdf‑only, magic‑byte check) |
| DELETE | `/api/admin/certificates/[id]/files/[fileId]` | delete a PDF |
| GET | `/api/admin/certificates/[id]/files/[fileId]/download` | stream PDF (auth); `?download=1` |
| GET/POST/DELETE | `/api/admin/certificates/[id]/image` | view / upload / remove optional image |
| POST | `/api/admin/certificates/[id]/qrcode` | regenerate QR |

### 17.4 Internships (admin)
| GET | `/api/admin/internships` | list (paginated, search) |
| GET | `/api/admin/internships/[id]` | read one |
| PATCH | `/api/admin/internships/[id]` | update status (Zod enum) |
| DELETE | `/api/admin/internships/[id]` | delete |
| GET | `/api/admin/internships/export` | CSV download |

### 17.5 Contacts (admin)
| GET | `/api/admin/contacts` | list (paginated, search) |
| GET | `/api/admin/contacts/[id]` | read one |
| PATCH | `/api/admin/contacts/[id]` | update status |
| DELETE | `/api/admin/contacts/[id]` | delete |

### 17.6 Products (admin)
`GET/POST /api/admin/products` · `GET/PUT/DELETE /api/admin/products/[id]` — Zod‑validated CRUD, slug management, image cleanup.

### 17.7 Portfolio (admin)
`GET/POST /api/admin/portfolio` · `GET/PUT/DELETE /api/admin/portfolio/[id]` — CRUD with gallery + technology links.

### 17.8 Technology (admin)
`GET/POST /api/admin/technology-categories` · `GET/PUT/DELETE /api/admin/technology-categories/[id]` · `GET/POST /api/admin/technologies` · `GET/PUT/DELETE /api/admin/technologies/[id]`.

### 17.9 Settings & Content (admin)
| GET/PUT | `/api/admin/settings` | read / update the `SiteSetting` singleton |
| GET/PUT | `/api/admin/content/[key]` | read / update a page's content (`home`/`about`); unknown key → 404; PUT is Zod‑validated per key |

### 17.10 Upload (admin)
| POST | `/api/admin/upload` | multipart `{ file, subdir }`; subdir ∈ products/portfolio/settings/content; image‑only; → `{ fileName, filePath (public URL), fileType, fileSize }` |

### 17.11 Public
| Method | Route | Body / Notes | Rate limit |
|--------|-------|--------------|-----------|
| POST | `/api/public/verify` | `{ certificateNumber }` → `{ found, certificate? }`; logs attempt | 20/min/IP |
| GET | `/api/public/certificates/[number]/file` | stream PDF (ACTIVE only); `?download=1` | 60/min/IP |
| GET | `/api/public/certificates/[number]/image` | stream image (ACTIVE only) | 60/min/IP |
| GET | `/api/public/certificates/[number]/qr` | on‑demand QR PNG; `?download=1`; 404 if cert missing | 60/min/IP |
| POST | `/api/public/contact` | contact form (Zod + honeypot) → store + email | 5/min/IP |
| POST | `/api/public/internship` | internship form (Zod + honeypot) → store + emails | 5/min/IP |

---

## 18. Security

### 18.1 Input validation ✅
Every API input is parsed with **Zod** (auth, all forms, all CRUD, all content). Invalid input → **422** with structured field errors. Types are inferred from the schemas.

### 18.2 Rate limiting ✅
In‑memory fixed‑window limiter (`src/lib/rate-limit.ts`), keyed by `scope + IP`, with periodic cleanup: verify 20/min, contact 5/min, internship 5/min, certificate file/image/qr 60/min. Exceeding → **429** with `Retry‑After` guidance. *(Single‑instance; swap for Redis when horizontally scaled.)*

### 18.3 Spam protection ✅
Hidden **honeypot** field (`company`) on public forms. If filled, the API returns a **success** response but silently drops the submission (bots don't learn the trap exists).

### 18.4 File & upload validation ✅
- MIME allow‑lists per route (images vs PDF).
- Size limit (`MAX_UPLOAD_SIZE_MB`, default 10 MB) enforced in code **and** as a bucket policy.
- **PDF magic‑byte check** (`%PDF-`) rejects disguised files.
- Random UUID object names (no user‑controlled paths); server‑side path handling prevents traversal.

### 18.5 Duplicate protection ✅
Certificate numbers are unique **case‑insensitively** (app‑level check + DB unique index) → duplicates return **409**. Product/portfolio/technology slugs are made unique automatically.

### 18.6 Private files & verified‑only access ✅
Certificate PDFs/images live in a **private** bucket and are streamed only through API routes that enforce: (a) admin auth for admin routes, or (b) certificate **ACTIVE** status for public routes. Revoked/expired/missing → **404**. QR is public (it only links to the verify page).

### 18.7 Authentication & authorization ✅
JWT in an HTTP‑only cookie; middleware‑guarded routes; `requireAdmin()` in every admin handler (defense in depth). Passwords bcrypt‑hashed (12 rounds). Role field ready for finer authorization.

### 18.8 XSS protection ✅
- React escapes rendered output by default.
- The JWT lives in an **HTTP‑only** cookie (JS cannot read it).
- User input is sanitized (`sanitizeText` strips control chars) before storage; email templates HTML‑escape all interpolated values (`escapeHtml`).

### 18.9 SQL injection protection ✅
All database access is via **Prisma** parameterized queries — no string‑concatenated SQL.

### 18.10 CSRF ⚠️
The session cookie is `SameSite=Lax`, which mitigates cross‑site POST CSRF for top‑level navigations. There is **no dedicated CSRF token**. Admin mutations rely on SameSite + the cookie being HTTP‑only. (A CSRF token layer is a possible hardening step — see §23.)

### 18.11 Security headers ⚠️
Sensitive file responses set `Cache-Control: private, no-store` and `X-Content-Type-Options: nosniff`. A global security‑header policy (CSP, HSTS, X‑Frame‑Options, etc.) is **not** configured yet (see §23).

### 18.12 Secrets management ✅
All credentials (DB URL, Supabase keys, JWT secret, SMTP) come from environment variables (`.env`, gitignored). `.env.example` documents the variables with placeholders. Nothing is hardcoded.

---

## 19. UI/UX Features

### 19.1 Themes ✅
Light + Dark via `next-themes` (default dark, system aware), OKLCH token system, smooth global color transitions.

### 19.2 Responsive design ✅
Mobile‑first; collapsible navbar and admin sidebar drawer; fluid grids; horizontally scrollable tables.

### 19.3 Animations & transitions ✅
Framer Motion (page transitions, scroll reveal, counters, modals), Lenis smooth scroll, Three.js 3D hero, CSS micro‑interactions.

### 19.4 Loading states ✅
Button spinners on submit; "Loading…" states in admin tables/editors; skeleton‑style placeholders where applicable; the 3D hero and page transitions are tuned for fast perceived load (the old artificial loading screen was removed).

### 19.5 Toasts ⛔ / Feedback ✅
No global toast system. Feedback is shown via **inline alert banners** (`AlertBanner`) for success/error and inline field errors. (A toast system is a possible enhancement — see §23.)

### 19.6 Dialogs ✅
- **`Modal`** — portal‑based, animated, ESC‑to‑close, body‑scroll‑lock; used for all create/edit and detail views.
- **`ConfirmDialog`** — destructive‑action confirmation (delete) with loading state.

### 19.7 Tables ✅
Reusable `DataTable` with typed columns, loading + **empty states**, and per‑row action buttons.

### 19.8 Search / pagination / filters ✅
- **Search:** debounced text search on every admin list (case‑insensitive, server‑side).
- **Pagination:** `Pagination` component with prev/next and page/total info; server‑side.
- **Filters:** e.g., the technology admin page filters by tab (categories vs technologies); the public portfolio page filters by category (client‑side).

### 19.9 Reusable admin components
`AdminShell`, `Sidebar`, `Topbar`, `StatCard`, `StatusBadge`, `PageHeader/ListToolbar/AlertBanner`, `DataTable`, `Pagination`, `Modal`, `ConfirmDialog`, `FormField` (TextInput/TextArea/Select/Checkbox), `ImageUploadField`, `MultiImageUploadField`.

---

## 20. Complete User Workflow

### 20.1 Visitor
1. Lands on `/` → animated hero + stats, browses sections.
2. Navigates to Products/Portfolio/Technology/About via the navbar.
3. Reads company info; toggles light/dark theme.
4. Clicks a CTA → Contact or Portfolio.

### 20.2 Prospective client (Contact)
1. Opens `/contact`, fills the form, submits.
2. Client validates → `POST /api/public/contact` → Zod validate → sanitize → store `ContactMessage` → email the company.
3. Sees a success banner. Company sees the message in **Admin → Messages** and receives an email.

### 20.3 Student (Internship)
1. Opens `/internship`, fills the application, submits.
2. `POST /api/public/internship` → validate → store `InternshipApplication` → email company + confirmation to student.
3. Admin reviews in **Admin → Internships**, changes status, or exports CSV.

### 20.4 Student / Employer (Certificate verification)
1. Scans the QR on a certificate (or types the number) → `/verify-certificate?number=...`.
2. Auto‑verify → `POST /api/public/verify` → case‑insensitive match → audit log.
3. If ACTIVE: sees details + PDF preview → **Download** / **Print**. If not found: sees the "Not Found" screen.

### 20.5 Admin (login → operate)
1. Visits any `/admin/*` route → redirected to `/admin/login` if not authenticated.
2. Logs in → JWT cookie set → redirected to the dashboard.
3. Uses the sidebar to manage certificates, applications, messages, products, portfolio, technology, settings, and page content.
4. Logs out → cookie cleared.

### 20.6 Admin (issue a certificate)
Create certificate → QR auto‑generated → upload PDF (+ optional image) → certificate becomes verifiable → share the number/QR with the student. (See §7.9 for the full diagram.)

### 20.7 Admin (edit page content)
**Admin → Pages → Home/About** → edit fields (text + images) → Save → public page reflects changes immediately (server‑rendered, `force-dynamic`).

### 20.8 Admin (manage catalog data)
Create/edit/delete products, portfolio projects, and technologies. *(Note: these are stored in the DB and shown in admin, but the public catalog pages currently render static content — see §23.)*

---

## 21. Project Architecture

### 21.1 High‑level
```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 15 (App Router)                    │
│                                                                │
│  Public site (site) ─┐        Admin panel /admin ─┐            │
│   Server + Client     │         Server + Client    │           │
│   components          │         components         │           │
│         │             │              │             │           │
│         ▼             ▼              ▼             ▼           │
│                  API Route Handlers (/api/**)                  │
│                   withApiHandler → requireAdmin?               │
│                          │                                     │
│         ┌────────────────┼───────────────────────────┐        │
│         ▼                ▼               ▼            ▼        │
│   Validation (Zod)   Services      Auth (jose)   Rate limit    │
│                        │                                       │
│                 ┌──────┴───────┐                               │
│                 ▼              ▼                               │
│           Prisma (pg)    Supabase JS (storage)  Nodemailer     │
└─────────────────┼──────────────┼─────────────────┼────────────┘
                  ▼              ▼                 ▼
          Supabase Postgres  Supabase Storage    SMTP server
```

### 21.2 Layered backend (per request)
1. **Route handler** (`app/api/**/route.ts`) — thin; declares runtime, calls `requireAdmin()` / rate limit, parses input with Zod, delegates to a service, returns the envelope.
2. **Service** (`src/lib/services/*`) — business logic: Prisma queries, storage calls, email, QR.
3. **Infrastructure** (`src/lib/*`) — `db.ts` (Prisma+pg), `supabase.ts` (storage), `private-storage.ts` / `upload.ts` (files), `auth/*` (JWT/cookies/password), `rate-limit.ts`, `sanitize.ts`, `request-meta.ts`, `qrcode.ts`, `email/*`.
4. **Data** — Supabase Postgres (Prisma) + Supabase Storage buckets.

### 21.3 Frontend
- **Public:** the `(site)` route group with its own layout (navbar/footer/smooth scroll/3D noise). Mostly client components for animation; Home & About are server components that fetch content.
- **Admin:** the `/admin` route group with a separate layout (no public chrome) and a protected `(dashboard)` sub‑group using `AdminShell`. Admin pages are client components that call the admin APIs via a small typed client (`src/lib/admin-api.ts`) and the `useAdminList` hook.

### 21.4 Content flow (CMS)
`PageContent` (JSON, keyed) → `content.service` merges with typed defaults → server components render public pages → admin editors read/write via `/api/admin/content/[key]`.

### 21.5 Configuration
- `.env` (secrets) · `.env.example` (documented placeholders).
- `prisma/schema.prisma` (models) + `prisma.config.ts` (Prisma 7 config) + `prisma/migrations/0_init`.
- `next.config.ts` (image remote patterns incl. Supabase + Unsplash; Turbopack root).
- `scripts/supabase-buckets.ts` (idempotent bucket provisioning).

---

## 22. Future Scalability

The architecture makes the following straightforward to add:

1. **Wire public catalog pages to the DB** *(highest‑value pending item)* — add public loaders (`getProducts`, `getPortfolioProjects`, `getTechnologyTree`) and convert `/products`, `/portfolio`, `/technology` to server components (mirrors how Home/About were wired). No schema changes needed.
2. **Media Library module** — build an admin page over Supabase Storage: `storage.list()` per bucket with search/filter, preview, replace, delete, and a "copy URL" action. All primitives already exist.
3. **Footer & Site‑Settings wiring** — read `SiteSetting` in the footer, contact page, and metadata so company info/social/logo/SEO become fully CMS‑driven.
4. **Dynamic SEO / Open Graph** — generate per‑page `metadata` from `SiteSetting`/`PageContent`; add an OG image field + `generateMetadata()`.
5. **Dashboard charts** — add a charting library and render trends (verifications over time from `VerificationLog`, applications by status, etc.).
6. **Role‑based authorization** — enforce `SUPER_ADMIN` vs `ADMIN` capabilities; add an admin‑management UI.
7. **Toast notifications** — a global toast provider to complement inline banners.
8. **Email delivery hardening** — queue/retry, DKIM/SPF setup, and transactional templates for status changes (e.g., internship accepted).
9. **Rate limiting at scale** — move the in‑memory limiter to Redis/Upstash for multi‑instance deployments.
10. **Security headers & CSRF tokens** — add a global CSP/HSTS policy and a CSRF token for admin mutations.
11. **Certificate enhancements** — bulk import (CSV), PDF generation from templates, email delivery of certificates, public certificate search.
12. **Observability** — structured logging, error tracking (e.g., Sentry), and analytics.
13. **Deployment** — add Vercel (or Docker) config, environment management, and CI.

---

## 23. Final Project Summary

Xipra Technology is a production‑grade, full‑stack Next.js application backed by **Supabase PostgreSQL** (via Prisma) and **Supabase Storage**, featuring a premium animated public website, a secure JWT‑based Admin Panel/CMS, and a complete QR‑enabled certificate verification system with private, access‑controlled document storage.

### 23.1 Completed features ✅
- Premium public website: animated 3D hero, light/dark themes, responsive layout, smooth scroll, page transitions (all pages present).
- **Home** (hero + statistics) and **About** (entire page) are **CMS‑driven**.
- **Contact form** — validated, stored, emailed to the company (rate‑limited, honeypot).
- **Internship form** — validated, stored, emailed to company + student (rate‑limited, honeypot).
- **Certificate system** — admin CRUD; PDF upload/replace/delete/preview/download/print; optional image; **auto‑generated unique QR**; public verification by number or QR; verified‑only preview/download/print; **audit logging** with IP + timestamp; case‑insensitive unique numbers.
- **Admin Panel** — dashboard (6 stat cards, recent activity, quick actions, latest certificates), and full management for **Certificates, Internships (+ CSV export), Contacts, Products, Portfolio, Technology, Settings, and Page Content**.
- **Backend** — layered services, Zod validation, consistent API envelope, centralized error handling, pagination/search.
- **Storage** — private certificates bucket + public asset buckets on Supabase; secure uploads; entity‑cascade cleanup.
- **Auth & security** — JWT httpOnly cookies, middleware‑protected routes, `requireAdmin()`, bcrypt, rate limiting, honeypots, magic‑byte file checks, sanitization, parameterized Prisma queries.
- **Infrastructure migration** — fully migrated from local MySQL + local disk to **Supabase Postgres + Supabase Storage**, verified end‑to‑end.

### 23.2 Backend/Admin ready but NOT wired to the public site 🟡
These have working admin CRUD and database storage, but the **public pages still render static/curated content**:
- **Products** — public `/products` page is static.
- **Portfolio** — public `/portfolio` page is static.
- **Technology** — public `/technology` page is static.
- **Home sections beyond Hero + Statistics** (Services, Technology/Products/Portfolio/Internship previews, closing CTA) — static.
- **Site Settings** (company info, logo, phones, emails, addresses, social links) — stored/editable but not consumed by the footer or contact page.
- **SEO fields** (title/description/keywords on `SiteSetting`) — editable but not applied to public page metadata.

### 23.3 Explicitly NOT implemented ⛔
- **Media Library** — no central asset browser/search/replace/delete UI (per‑module uploads exist; Supabase Storage is fully in place).
- **Footer CMS** — footer content is hardcoded; no footer content model/editor.
- **Dashboard charts** — the dashboard uses stat cards + lists, not graphical charts.
- **Global toast system** — feedback is via inline banners.
- **Role‑based authorization enforcement** — the `role` field exists and is seeded, but all authenticated admins currently have full access.
- **Dedicated CSRF tokens** and a **global security‑header/CSP policy** — mitigations exist (SameSite cookie, nosniff on file routes) but a full policy is not configured.
- **Deployment configuration** — the app runs locally and uses cloud DB/storage, but no hosting‑platform config (e.g., Vercel) is set up yet.
- **Certificate extras** — bulk import, template‑based PDF generation, and emailing certificates to students are not built.

### 23.4 Default credentials & environment
- **Admin login (seeded):** `admin@xipratech.com` / `ChangeMe@123` — change after first login.
- **Environment variables** (`.env`): `DATABASE_URL` (Supabase session pooler), `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `AUTH_COOKIE_NAME`, `ADMIN_SEED_*`, `NEXT_PUBLIC_APP_URL`, `MAX_UPLOAD_SIZE_MB`, `SMTP_*`, `MAIL_COMPANY_*`, `COMPANY_*`.
- **Security reminder:** rotate the Supabase secret key and DB password if they were ever shared in plain text; keep `.env` out of version control (it is gitignored).

### 23.5 How to run
```bash
npm install                       # install dependencies
npx tsx scripts/supabase-buckets.ts   # (one-time) create storage buckets
npx prisma migrate deploy         # apply DB schema to Supabase
npx prisma db seed                # create the first admin + settings
npm run dev                       # start on http://localhost:3000
# Public site:  http://localhost:3000
# Admin panel:  http://localhost:3000/admin/login
```

---

*End of documentation.*
