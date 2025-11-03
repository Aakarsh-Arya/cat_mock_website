import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mock Details",
};

export default async function MockDetailPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { paperId } = (await params) as { paperId: string };
    return (
        <main style={{ padding: 24 }}>
            <h1>Mock: {paperId}</h1>
           <p>Click the &quot;Download&quot; button to get the file</p>
            <p>TODO: Create attempt and redirect to /exam/[attemptId].</p>
        </main>
    );
}
