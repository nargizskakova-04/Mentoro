// RAG (Retrieval-Augmented Generation) - document processing and text extraction

export interface Chunk {
    id: string;
    text: string;
    metadata: Record<string, unknown>;
}

const mockStore: Chunk[] = [];

/** Extract text from uploaded file (txt, md, PDF) */
export async function extractTextFromFile(file: File): Promise<string> {
    const ext = (file.name.split('.').pop() || '').toLowerCase();

    if (ext === 'txt' || ext === 'md') {
        return await file.text();
    }

    if (ext === 'pdf') {
        const { extractText } = await import('unpdf');
        const arrayBuffer = await file.arrayBuffer();
        const { text } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
        return text || '';
    }

    // doc, docx, xlsx - not fully supported
    if (ext === 'doc' || ext === 'docx' || ext === 'xlsx') {
        throw new Error(`File type .${ext} is not fully supported. Please use .txt, .md, or .pdf for best results.`);
    }

    return await file.text();
}

export async function processDocument(file: File): Promise<{ sessionId: string; extractedText: string }> {
    const text = await extractTextFromFile(file);
    const cleanedText = text.trim() || 'No readable content found in the document.';

    // Store chunks for RAG (simple sentence-based chunking)
    const sentences = cleanedText
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 20);
    const chunkSize = 3;
    for (let i = 0; i < sentences.length; i += chunkSize) {
        const chunkText = sentences.slice(i, i + chunkSize).join(' ');
        mockStore.push({
            id: `${Date.now()}-${i}`,
            text: chunkText,
            metadata: { filename: file.name, index: i },
        });
    }

    if (mockStore.length === 0) {
        mockStore.push({
            id: Date.now().toString(),
            text: cleanedText,
            metadata: { filename: file.name },
        });
    }

    return { sessionId: 'session-' + Date.now(), extractedText: cleanedText };
}

export function clearVectorStore(): void {
    mockStore.length = 0;
}

export async function retrieveRelevantChunks(query: string, limit = 5): Promise<Chunk[]> {
    if (mockStore.length === 0) {
        return [];
    }
    return mockStore.slice(0, limit);
}
