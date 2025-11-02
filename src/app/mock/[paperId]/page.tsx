import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Mock Details",
};

interface Params {
    params: { paperId: string };
}

export default function MockDetailPage({ params }: Params) {
    const { paperId } = params;
    return (
        <main style={{ padding: 24 }}>
            <h1>Mock: {paperId}</h1>
            <p>Paper details and a “Start exam” button will appear here.</p>
            <p>TODO: Create attempt and redirect to /exam/[attemptId].</p>
        </main>
    );
}
