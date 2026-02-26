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
  title: {
    default: 'Acadence – Strategy Overview',
    template: 'Acadence – %s',
  },
  description:
    'Academic Strategy Engine — Track attendance, optimize your schedule, maximize your academic performance.',
  keywords: [
    'acadence',
    'attendance tracker',
    'academic strategy',
    'lecture tracker',
    'attendance calculator',
  ],
  authors: [{ name: 'Acadence' }],
  icons: {
    icon: [
      { url: '/brand/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/brand/favicon.svg',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Acadence – Academic Strategy Engine',
    description: 'Track attendance, optimize your schedule, maximize your academic performance',
    type: 'website',
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
      </body>
    </html>
  );
}
