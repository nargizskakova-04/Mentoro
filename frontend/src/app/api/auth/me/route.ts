import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';
import { forwardSetCookieHeaders } from '@/lib/proxy-utils';

export async function GET(req: NextRequest) {
    try {
        const authToken = req.cookies.get('auth_token')?.value;
        const headers: HeadersInit = {};
        if (authToken) {
            headers['Cookie'] = `auth_token=${authToken}`;
        }

        const res = await fetch(`${getBackendUrl()}/api/auth/me`, {
            method: 'GET',
            headers,
        });

        const data = await res.json().catch(() => ({}));
        const response = NextResponse.json(data, { status: res.status });
        forwardSetCookieHeaders(res, response);
        return response;
    } catch (error) {
        console.error('Profile fetch proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const authToken = req.cookies.get('auth_token')?.value;
        if (!authToken) {
            return NextResponse.json(
                { message: 'Not authenticated' },
                { status: 401 }
            );
        }

        const body = await req.json().catch(() => ({}));
        const res = await fetch(`${getBackendUrl()}/api/auth/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `auth_token=${authToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        const response = NextResponse.json(data, { status: res.status });
        forwardSetCookieHeaders(res, response);
        return response;
    } catch (error) {
        console.error('Profile update proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
