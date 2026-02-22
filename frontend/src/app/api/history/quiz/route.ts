import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';

function getAuthHeaders(req: NextRequest): HeadersInit {
    const authToken = req.cookies.get('auth_token')?.value;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (authToken) {
        (headers as Record<string, string>)['Cookie'] = `auth_token=${authToken}`;
        (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

export async function GET(req: NextRequest) {
    try {
        const res = await fetch(`${getBackendUrl()}/api/history/quiz`, {
            method: 'GET',
            headers: getAuthHeaders(req),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('History quiz list proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const backendUrl = getBackendUrl();
        console.log('[history/quiz] POST proxy forwarding to', `${backendUrl}/api/history/quiz`, 'body', body);
        const res = await fetch(`${backendUrl}/api/history/quiz`, {
            method: 'POST',
            headers: getAuthHeaders(req),
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('History quiz save proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
