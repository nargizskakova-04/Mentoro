import { NextRequest, NextResponse } from 'next/server';
import { processDocument, clearVectorStore } from '@/lib/rag';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        clearVectorStore();

        const { sessionId, extractedText } = await processDocument(file);

        return NextResponse.json({
            success: true,
            sessionId,
            extractedText,
            message: 'Document processed successfully',
        });
    } catch (error) {
        console.error('Upload processing error details:', error);
        return NextResponse.json({ error: 'Failed to process document', details: String(error) }, { status: 500 });
    }
}
