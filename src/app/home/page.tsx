import type { Metadata } from 'next';
import Header from '@/components/dashboard/Header';
import CalculatorCard from '@/components/calculator/CalculatorCard';
import ResultsDisplay from '@/components/results/ResultsDisplay';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import StrategyPanel from '@/components/dashboard/StrategyPanel';
import RecentCalculations from '@/components/dashboard/RecentCalculations';

export const metadata: Metadata = { title: 'Strategy Overview' };

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
