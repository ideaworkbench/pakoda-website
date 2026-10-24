import { EarlyAccessProvider } from "@/components/early-access/early-access-provider";
import { HeroContent } from "@/components/landing/hero-content";
import { HeroImage } from "@/components/landing/hero-image";
import { ScaledStage } from "@/components/landing/scaled-stage";
import { SiteHeader } from "@/components/landing/site-header";
import { WideViewportLinesAboveStage, WideViewportLinesBehindStage } from "@/components/landing/wide-viewport-lines";

export default function Home() {
    return (
        <EarlyAccessProvider>
            <main className="@container relative min-h-dvh">
                <WideViewportLinesBehindStage />
                <ScaledStage>
                    <SiteHeader />
                    <HeroImage />
                    <HeroContent />
                </ScaledStage>
                <WideViewportLinesAboveStage />
            </main>
        </EarlyAccessProvider>
    );
}
