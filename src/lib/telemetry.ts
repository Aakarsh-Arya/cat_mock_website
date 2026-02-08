type CounterRecord = { count: number; updatedAt: number };

type TelemetryStore = Record<string, CounterRecord>;

function getStore(): TelemetryStore {
    const globalScope = globalThis as typeof globalThis & { __telemetryStore?: TelemetryStore };
    if (!globalScope.__telemetryStore) {
        globalScope.__telemetryStore = {};
    }
    return globalScope.__telemetryStore;
}

function getHourBucket(timestamp: number): number {
    return Math.floor(timestamp / 3_600_000);
}

export function incrementMetric(name: string, amount = 1): number {
    const now = Date.now();
    const bucket = getHourBucket(now);
    const key = `${name}:${bucket}`;
    const store = getStore();
    const existing = store[key];
    const next = (existing?.count ?? 0) + amount;
    store[key] = { count: next, updatedAt: now };
    return next;
}

export function getTelemetrySnapshot(): Record<string, number> {
    const store = getStore();
    const snapshot: Record<string, number> = {};
    Object.entries(store).forEach(([key, record]) => {
        snapshot[key] = record.count;
    });
    return snapshot;
}
