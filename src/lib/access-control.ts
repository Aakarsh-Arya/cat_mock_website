export type AccessStatus = 'active' | 'pending' | 'rejected';

type UserLike = {
    app_metadata?: {
        user_role?: string | null;
    } | null;
} | null;

type RpcResult<T> = { data: T | null; error: { message?: string } | null };

export async function resolveIsAdmin(
    supabase: { rpc: (fn: string, args?: Record<string, unknown>) => Promise<RpcResult<boolean>> },
    user: UserLike
): Promise<boolean> {
    const role = user?.app_metadata?.user_role ?? null;
    if (role === 'admin' || role === 'dev') return true;

    const { data, error } = await supabase.rpc('is_admin');
    return !error && Boolean(data);
}

export async function fetchAccessStatus(
    supabase: {
        from: (table: string) => {
            select: (cols: string) => {
                eq: (col: string, value: unknown) => {
                    maybeSingle: () => Promise<RpcResult<{ status?: AccessStatus | null }>>;
                };
            };
        };
    },
    userId: string
): Promise<AccessStatus | null> {
    const { data, error } = await supabase
        .from('user_access')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle();

    if (error) return null;
    return (data?.status ?? null) as AccessStatus | null;
}

export async function ensureActiveAccess(
    supabase: {
        rpc: (fn: string, args?: Record<string, unknown>) => Promise<RpcResult<boolean>>;
        from: (table: string) => {
            select: (cols: string) => {
                eq: (col: string, value: unknown) => {
                    maybeSingle: () => Promise<RpcResult<{ status?: AccessStatus | null }>>;
                };
            };
        };
    },
    userId: string,
    user: UserLike
): Promise<{ allowed: boolean; status: AccessStatus | null; isAdmin: boolean }> {
    const isAdmin = await resolveIsAdmin(supabase, user);
    if (isAdmin) {
        return { allowed: true, status: 'active', isAdmin: true };
    }

    const status = await fetchAccessStatus(supabase, userId);
    return { allowed: status === 'active', status, isAdmin: false };
}
