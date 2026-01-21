import { NextRequest, NextResponse } from 'next/server';
import { sbSSR } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    const supabase = await sbSSR();

    // Sign out the user
    await supabase.auth.signOut();

    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
}

export async function GET(request: NextRequest) {
    const supabase = await sbSSR();

    // Sign out the user
    await supabase.auth.signOut();

    // Redirect to sign-in page
    return NextResponse.redirect(new URL('/auth/sign-in', request.url));
}
