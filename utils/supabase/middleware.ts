import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // issues with users being randomly logged out.

    let user = null
    try {
        const {
            data: { user: supabaseUser },
        } = await supabase.auth.getUser()
        user = supabaseUser
    } catch (e) {
        // Suppress errors if Supabase is not configured or reachable
        console.error('Middleware auth error:', e)
    }

    /*
    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        request.nextUrl.pathname.startsWith('/dashboard')
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }
    */

    // if user is signed in and accesses /login or /signup, redirect to /dashboard
    if (
        user &&
        (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))
    ) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
