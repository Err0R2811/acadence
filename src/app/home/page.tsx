import type { Metadata } from 'next';
import Header from '@/components/dashboard/Header';
import CalculatorCard from '@/components/calculator/CalculatorCard';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import StrategyPanel from '@/components/dashboard/StrategyPanel';
import RecentCalculations from '@/components/dashboard/RecentCalculations';

export const metadata: Metadata = {
  title: "Acadence — Attendance Calculator for PIT/PIET Students",
  description: "Calculate your attendance, plan your schedule, and hit 75% with Acadence — the academic strategy engine for PIT/PIET CSE, AI & Cyber Security students.",
  keywords: ["PIT attendance calculator", "PIET attendance tracker", "75% attendance planner", "CSE attendance strategy"],
  openGraph: {
    title: "Acadence — Academic Strategy Engine",
    description: "Plan your attendance strategy for PIT/PIET college. Works for CSE, AI & Cyber Security students.",
    url: "https://acadence-pit.vercel.app/home",
    siteName: "Acadence",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Acadence — Attendance Calculator for PIT/PIET",
    description: "Hit 75% attendance with smart planning. Built for PIT/PIET students.",
  },
};

export default function HomePage() {
    return (
        <>
            <Header />
            <CalculatorCard />
            <ResultsDisplay />
            <div className="px-4 space-y-3 mt-3">
                <RecommendationCard />
                <StrategyPanel />
            </div>
            <RecentCalculations />
        </>
    );
}
