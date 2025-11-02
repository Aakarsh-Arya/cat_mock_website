interface Params {
    params: { attemptId: string };
}

export default function ExamPage({ params }: Params) {
    const { attemptId } = params;
    return (
        <main style={{ padding: 24 }}>
            <h1>Exam Attempt: {attemptId}</h1>
            <p>TODO: Render timer, question card, and palette.</p>
            <p>Answers will be buffered locally and synced periodically.</p>
        </main>
    );
}
