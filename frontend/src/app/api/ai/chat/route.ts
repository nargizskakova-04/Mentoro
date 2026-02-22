import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.messages || !Array.isArray(body.messages)) {
            return NextResponse.json(
                { message: 'Messages array is required' },
                { status: 400 }
            );
        }

        const res = await fetch(`${getBackendUrl()}/api/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({ detail: res.statusText }));
            return NextResponse.json(
                { message: data.detail ?? 'AI chat request failed' },
                { status: res.status }
            );
        }

        // Stream the response from FastAPI directly to the client
        const contentType = res.headers.get('content-type') ?? 'text/plain; charset=utf-8';
        return new NextResponse(res.body, {
            status: res.status,
            headers: {
                'Content-Type': contentType,
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('AI Chat proxy error:', error);
        return NextResponse.json(
            { message: 'Failed to connect to AI service. Ensure backend is running.' },
            { status: 500 }
        );
    }
}
