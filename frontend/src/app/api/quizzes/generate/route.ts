import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, documentText } = body;

        if (!type || !['explain', 'quiz'].includes(type)) {
            return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
        }

        const res = await fetch(`${getBackendUrl()}/api/quizzes/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, documentText }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return NextResponse.json(
                { error: data.detail ?? data.error ?? 'Generation failed' },
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
        console.error('Generate proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to generate content' },
            { status: 500 }
        );
    }
}
