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

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const res = await fetch(`${getBackendUrl()}/api/assignments/${id}`, {
            method: 'GET',
            headers: getAuthHeaders(req),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Assignment get proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const res = await fetch(`${getBackendUrl()}/api/assignments/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(req),
            body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Assignment update proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const res = await fetch(`${getBackendUrl()}/api/assignments/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(req),
        });
        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Assignment delete proxy error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
