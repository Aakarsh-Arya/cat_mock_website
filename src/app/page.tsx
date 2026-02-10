import LandingPageClient from '@/components/landing/LandingPageClient';
import { loadNexaiDemoMarkdown } from '@/lib/loadNexaiDemoMarkdown';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const nexaiDemoMarkdown = await loadNexaiDemoMarkdown();
    return <LandingPageClient nexaiDemoMarkdown={nexaiDemoMarkdown} />;
}
