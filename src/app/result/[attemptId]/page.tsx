interface Params {
    params: { attemptId: string };
}

export default function ResultPage({ params }: Params) {
    const { attemptId } = params;
    return (
        <main style={{ padding: 24 }}>
            <h1>Result: {attemptId}</h1>
            <p>TODO: Show score, accuracy, and section-wise breakdown.</p>
        </main>
    );
}
