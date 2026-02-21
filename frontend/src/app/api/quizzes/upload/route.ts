import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-urls';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const backendFormData = new FormData();
        backendFormData.append('file', file);

        const res = await fetch(`${getBackendUrl()}/api/quizzes/upload`, {
            method: 'POST',
            body: backendFormData,
        });

        const data = await res.json().catch(() => ({}));
        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Upload proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to process document', details: String(error) },
            { status: 500 }
        );
    }
}
