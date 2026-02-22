import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.messages || !Array.isArray(body.messages)) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        const res = await fetch(`${getBackendUrl()}/api/quizzes/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: data.detail ?? data.error ?? 'Chat request failed' },
                { status: res.status }
            );
        }

        const contentType = res.headers.get('content-type') ?? 'text/plain; charset=utf-8';
        return new NextResponse(res.body, {
            status: res.status,
            headers: {
                'Content-Type': contentType,
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Quizzes chat proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat' },
            { status: 500 }
        );
    }
}
