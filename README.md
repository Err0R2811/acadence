# 🎓 Acadence Tracking

> **Keep your streak alive** — A modern attendance tracking & academic timetable SaaS for students.

A production-ready, full-stack web application meticulously crafted with **Next.js 15**, **React 19**, **TypeScript**, and **TailwindCSS 4**. Designed with a premium "Gold" aesthetic, Acadence makes tracking college lecture attendance, predicting missable classes, and navigating your weekly timetable an effortless, visually stunning experience.

---

## ✨ Key Features

*   **📊 Smart Attendance Calculator**: Instantly calculates required classes to hit your goals (e.g., 75% target) or calculates exactly how many classes you can safely skip while staying "Above Target".
*   **📅 Interactive Timetable Grid**: A fully responsive, modern 6-day timetable mapping lectures, labs, faculty, and room numbers. Features smart hover tooltips that defensively position themselves to prevent screen clipping.
*   **👨‍🏫 Comprehensive Faculty Directory**: Seamlessly maps shortcodes from your raw university schedule to their full faculty names (e.g., "RSM" → "Dr. Ravi Mahla").
*   **🥇 Premium "Gold Glow" Aesthetic**: A sleek dark mode combined with radiant radial gradients, deep `#C6A84A` gold rings, and polished status badges.
*   **💾 Effortless Offline State**: Persists your calculation history locally using Zustand, ensuring you never lose track of your progress.
*   **📱 Mobile-Optimized**: Flawlessly adapts the massive timetable into responsive accordions for smaller devices, ensuring clarity everywhere.

---

## ⚡ Quick Start

Get your local development environment up and running in seconds.

```bash
# Clone the repository
git clone https://github.com/your-username/attendance-tracker.git
cd attendance-tracker

# Install dependencies (Next.js 15, React 19, Tailwind v4)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Tech Stack

Built on the cutting edge of the modern web:

- **Framework**: Next.js 15 (App Router)
- **UI & Styling**: React 19 + TailwindCSS 4
- **Language**: TypeScript (Strict Mode)
- **State Management**: Zustand (with Persist Middleware)
- **Validation**: Zod schema parsing
- **Testing**: Vitest (Unit) + Playwright (E2E)
- **Database Architecture** *(Ready)*: PostgreSQL via Prisma ORM

---

## 🧮 How The Algorithm Works

The smart calculator relies on mathematically proven bounding to never report false confidence.

| Scenario | Formula |
|----------|---------|
| **Current Attendance %** | `(attended / conducted) × 100` |
| **Below target** *(Classes needed)* | `x = ⌈(target × conducted − 100 × attended) / (100 − target)⌉` |
| **Above target** *(Classes missable)*| `x = ⌊(100 × attended − target × conducted) / target⌋` |

---

## 🚀 Deployment

Deployment is natively optimized for **Vercel** with zero configuration required.

1.  Push your code to your GitHub Repository.
2.  Log in to [Vercel](https://vercel.com/) and click **Add New → Project**.
3.  Import your repository.
4.  Click **Deploy**.

Vercel will detect Next.js automatically, build the project, and give you a live production URL.

---

## 🧪 Testing

This repo enforces test-driven development methodologies to ensure calculations are bulletproof.

```bash
# Run the 28 unit tests (Vitest)
npm test

# Run End-To-End browser testing (Playwright)
npx playwright test

# Comprehensive type checking
npm run type-check
```

---

## 🔒 Security

Engineered with enterprise-grade Next.js headers:
- **Zod schemas** on API routes to block malformed requests.
- `strict-origin-when-cross-origin` referrer policies.
- **XSS Protection** and content sniffing blockers out of the box.

---

## License

MIT © Acadence Tracker
