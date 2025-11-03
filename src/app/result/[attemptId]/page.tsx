export default async function ResultPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    return (
        <main style={{ padding: 24 }}>
            <h1>Result: {attemptId}</h1>
            <p>TODO: Show score, accuracy, and section-wise breakdown.</p>
        </main>
    );
}
