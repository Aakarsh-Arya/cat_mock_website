export default async function ExamPage({ params }: { params: Promise<Record<string, unknown>> }) {
    const { attemptId } = (await params) as { attemptId: string };
    return (
        <main style={{ padding: 24 }}>
            <h1>Exam Attempt: {attemptId}</h1>
            <p>TODO: Render timer, question card, and palette.</p>
            <p>Answers will be buffered locally and synced periodically.</p>
        </main>
    );
}
