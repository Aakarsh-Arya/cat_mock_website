export type AccessStatus = 'active' | 'pending' | 'rejected';

type UserLike = {
    app_metadata?: Record<string, unknown> | null;
} | null;

type RpcResult<T> = { data: T | null; error: { message?: string } | null };

type SupabaseRpcClient = {
    rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<unknown>;
};

type SupabaseQueryClient = {
    from: (table: string) => {
        select: (cols: string) => {
            eq: (col: string, value: unknown) => {
                maybeSingle: () => PromiseLike<unknown>;
            };
        };
    };
};

export async function resolveIsAdmin(
    supabase: unknown,
    user: UserLike
): Promise<boolean> {
    const role = user?.app_metadata
        ? (user.app_metadata as { user_role?: string | null }).user_role ?? null
        : null;
    if (role === 'admin' || role === 'dev') return true;

    const { data, error } = (await (supabase as SupabaseRpcClient).rpc('is_admin')) as RpcResult<boolean>;
    return !error && Boolean(data);
}

export async function fetchAccessStatus(
    supabase: unknown,
    userId: string
): Promise<AccessStatus | null> {
    const { data, error } = (await (supabase as SupabaseQueryClient)
        .from('user_access')
        .select('status')
        .eq('user_id', userId)
        .maybeSingle()) as RpcResult<{ status?: AccessStatus | null }>;

    if (error) return null;
    return (data?.status ?? null) as AccessStatus | null;
}

export async function ensureActiveAccess(
    supabase: unknown,
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
