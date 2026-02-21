import { NextRequest, NextResponse } from 'next/server';
import { retrieveRelevantChunks } from '@/lib/rag';
import OpenAI from 'openai';

const MAX_CONTEXT_CHARS = 6000;

function truncateForContext(text: string): string {
    if (text.length <= MAX_CONTEXT_CHARS) return text;
    return text.slice(0, MAX_CONTEXT_CHARS) + '\n\n[... обрезано ...]';
}

const openai = new OpenAI({
    apiKey: 'not-needed',
    baseURL: 'http://localhost:1234/v1',
});

export async function POST(req: NextRequest) {
    try {
        const { messages, documentText } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
        }

        let contextText = '';
        if (documentText && typeof documentText === 'string' && documentText.trim()) {
            contextText = documentText.trim();
        } else {
            const lastMessage = messages[messages.length - 1];
            const query = lastMessage?.content || '';
            const relevantChunks = await retrieveRelevantChunks(query, 5);
            contextText = relevantChunks.map((c) => c.text).join('\n---\n');
        }

        if (!contextText) {
            return NextResponse.json(
                { error: 'No document context. Please upload and process a document first.' },
                { status: 400 }
            );
        }

        contextText = truncateForContext(contextText);

        const systemPrompt = {
            role: 'system',
            content: `You are a helpful academic tutor assisting a student with a document.
            Use the following context to answer the student's questions. 
            If the answer is not in the context, say you don't find it in the document but try to answer from general knowledge if relevant (and mark it as general knowledge).
            
            CONTEXT:
            ${contextText}
            
            RULES:
            1. Be concise and clear.
            2. Use Markdown formatting.
            3. Maintain a professional, encouraging tone.`
        };

        const completion = await openai.chat.completions.create({
            model: 'local-model',
            messages: [systemPrompt, ...messages],
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                } catch (streamError: unknown) {
                    const err = streamError instanceof Error ? streamError : new Error(String(streamError));
                    const causeMsg = err.cause instanceof Error ? err.cause.message : '';
                    const msg = err.message + ' ' + causeMsg;
                    const fallback = msg.includes('Context size') || msg.includes('exceeded')
                        ? '⚠️ Контекст превышен. Задайте более короткий вопрос.'
                        : '⚠️ Ошибка. Попробуйте ещё раз.';
                    controller.enqueue(new TextEncoder().encode(fallback));
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error('Document Chat error:', error);
        return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 });
    }
}
