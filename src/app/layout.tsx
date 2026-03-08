import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/navigation/BottomNav';
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://acadence-pit.vercel.app"),
  title: {
    default: "Acadence — Academic Strategy Engine",
    template: "%s | Acadence",
  },
  description:
    "The academic strategy engine for PIT/PIET students. Track attendance, plan schedules, and hit 75%.",
  keywords: [
    "PIT attendance calculator",
    "PIET attendance tracker",
    "75% attendance planner",
    "CSE attendance strategy",
    "AI attendance tracker",
    "Cyber Security attendance",
    "acadence",
    "attendance tracker",
    "academic strategy",
    "lecture tracker",
    "attendance calculator",
  ],
  authors: [{ name: "Err0r" }],
  alternates: {
    canonical: "https://acadence-pit.vercel.app",
  },
  verification: {
    google: "_78TgF0UhO23ZKqc9s1kEcW6MDZJpiP4VEcWB1-gRX8",
  },
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Acadence — Academic Strategy Engine",
    description: "Plan your attendance strategy for PIT/PIET college. Works for CSE, AI & Cyber Security students.",
    url: "https://acadence-pit.vercel.app",
    siteName: "Acadence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acadence — Attendance Calculator for PIT/PIET",
    description: "Hit 75% attendance with smart planning. Built for PIT/PIET students.",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0B1F2F',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{
          background:
            'linear-gradient(165deg, #0B1F2F 0%, #061220 50%, #0B1F2F 100%)',
          minHeight: '100vh',
        }}
      >
        {/* ─── Loading Screen ─── */}
        <div className="acadence-loader" aria-hidden="true">
          <svg
            className="mono"
            width="56"
            height="56"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32 10L16 54H23L27 44H37L40 54H47L32 10ZM29 38L32 26L35 38H29Z"
              fill="#C6A84A"
            />
            <rect
              x="12"
              y="14"
              width="3.5"
              height="36"
              rx="1.75"
              fill="#C6A84A"
              opacity="0.7"
            />
            <rect
              x="48.5"
              y="14"
              width="3.5"
              height="36"
              rx="1.75"
              fill="#C6A84A"
              opacity="0.7"
            />
          </svg>
          <p
            className="wordmark mt-4 text-xl font-bold"
            style={{ letterSpacing: '3px' }}
          >
            ACADENCE
          </p>
        </div>

        {/* ─── App Shell ─── */}
        <div className="max-w-lg mx-auto min-h-screen relative pb-20">
          {children}
        </div>
        <BottomNav />
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Acadence",
              "url": "https://acadence-pit.vercel.app",
              "description": "Attendance calculator and academic strategy engine for PIT/PIET students",
              "applicationCategory": "EducationApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "audience": {
                "@type": "EducationalAudience",
                "educationalRole": "student"
              },
              "creator": {
                "@type": "Person",
                "name": "Err0r"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
