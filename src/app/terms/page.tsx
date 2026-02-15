import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | NEXAMS',
    description: 'Terms of Service for Nexams CAT mock test platform.',
};

export default function TermsOfServicePage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
            <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                <h1 className="text-3xl font-semibold text-slate-900">Terms of Service</h1>
                <p className="mt-2 text-sm text-slate-500">Last Updated: February 15, 2026</p>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
                    <p className="text-slate-700">
                        By accessing Nexams, you agree to comply with these terms. Our platform is designed for
                        educational purposes, specifically for CAT (Common Admission Test) preparation.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">2. User Accounts</h2>
                    <p className="text-slate-700">
                        Users are responsible for maintaining the confidentiality of their login credentials. Any
                        suspicious activity should be reported immediately.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">3. Intellectual Property</h2>
                    <p className="text-slate-700">
                        The test content, UI design, and &quot;Nexams&quot; branding are the intellectual property of Nexams.
                        Users may not scrape, copy, or redistribute our mock tests without written consent.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">4. Fair Usage &amp; Mock Tests</h2>
                    <p className="text-slate-700">
                        Nexams provides percentile predictions based on available data. These are estimates for practice
                        purposes and do not guarantee actual CAT results.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">5. Limitation of Liability</h2>
                    <p className="text-slate-700">
                        Nexams is provided &quot;as is.&quot; While we strive for 100% uptime, we are not liable for technical
                        interruptions during practice sessions.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">6. Governing Law</h2>
                    <p className="text-slate-700">These terms are governed by the laws of India.</p>
                </section>
            </div>
        </main>
    );
}
