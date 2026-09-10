import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/features/landing/components/hero';
import { AboutSection } from '@/features/landing/components/about-section';
import { CompetitionFlowSection } from '@/features/landing/components/competition-flow';
import { TimelineSection } from '@/features/landing/components/timeline-section';
import { EvaluationCriteriaSection } from '@/features/landing/components/evaluation-criteria';
import { RewardsSection } from '@/features/landing/components/rewards-section';
import { LeaderboardPreviewSection } from '@/features/landing/components/leaderboard-preview';
import { FaqSection } from '@/features/landing/components/faq-section';
import { ContactSection } from '@/features/landing/components/contact-section';

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AboutSection />
        <CompetitionFlowSection />
        <TimelineSection />
        <EvaluationCriteriaSection />
        <RewardsSection />
        <LeaderboardPreviewSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
