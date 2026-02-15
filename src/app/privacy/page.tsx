import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | NEXAMS',
    description: 'Privacy Policy for Nexams CAT mock test platform.',
};

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
            <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
                <h1 className="text-3xl font-semibold text-slate-900">Privacy Policy</h1>
                <p className="mt-2 text-sm text-slate-500">Last Updated: February 15, 2026</p>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
                    <p className="text-slate-700">
                        Welcome to Nexams (nexams.online). We value your privacy and are committed to protecting your
                        personal data. This policy explains how we collect and use information when you use our CAT
                        mock test platform.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">2. Data We Collect</h2>
                    <ul className="list-disc space-y-2 pl-5 text-slate-700">
                        <li>
                            Account Information: Name, email address, and phone number provided during registration.
                        </li>
                        <li>
                            Performance Data: Answers submitted during mock tests, time spent per question, and
                            calculated percentiles.
                        </li>
                        <li>
                            Technical Data: IP address and browser type (used solely for security and preventing
                            multiple logins).
                        </li>
                    </ul>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">3. How We Use Your Data</h2>
                    <p className="text-slate-700">We use your information to:</p>
                    <ul className="list-disc space-y-2 pl-5 text-slate-700">
                        <li>Provide and maintain the test engine.</li>
                        <li>Generate personalized performance analytics and percentile predictions.</li>
                        <li>Send important updates regarding your account or exam schedules.</li>
                    </ul>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">4. Data Security</h2>
                    <p className="text-slate-700">
                        We implement industry-standard security measures (including SSL encryption) to ensure your data
                        is protected against unauthorized access. We do not sell or rent your personal data to third
                        parties.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">5. Third-Party Services</h2>
                    <p className="text-slate-700">
                        We may use trusted services like Supabase for authentication and database management. These
                        providers are compliant with global security standards.
                    </p>
                </section>

                <section className="mt-8 space-y-3">
                    <h2 className="text-xl font-semibold text-slate-900">6. Contact Us</h2>
                    <p className="text-slate-700">
                        For any privacy-related queries, please contact:{' '}
                        <a className="font-medium text-slate-900 underline" href="mailto:aakarsharya001@gmail.com">
                            aakarsharya001@gmail.com
                        </a>
                        .
                    </p>
                </section>
            </div>
        </main>
    );
}
