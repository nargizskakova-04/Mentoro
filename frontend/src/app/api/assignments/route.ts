import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';

function getAuthHeaders(req: NextRequest): HeadersInit {
    const authToken = req.cookies.get('auth_token')?.value;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
        (headers as Record<string, string>)['Cookie'] = `auth_token=${authToken}`;
    }
    return headers;
}

export async function GET(req: NextRequest) {
    try {
        const res = await fetch(`${getBackendUrl()}/api/assignments`, {
            method: 'GET',
            headers: getAuthHeaders(req),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Assignments list proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const res = await fetch(`${getBackendUrl()}/api/assignments`, {
            method: 'POST',
            headers: getAuthHeaders(req),
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Assignment create proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
