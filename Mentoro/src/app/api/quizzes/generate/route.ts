import { NextRequest, NextResponse } from 'next/server';
import { retrieveRelevantChunks } from '@/lib/rag';
import OpenAI from 'openai';

// ~1 token ≈ 4 chars. Limit to fit 4K context models (input + system + response)
const MAX_CONTEXT_CHARS = 6000;

function truncateForContext(text: string): string {
    if (text.length <= MAX_CONTEXT_CHARS) return text;
    return text.slice(0, MAX_CONTEXT_CHARS) + '\n\n[... документ обрезан из-за ограничения контекста модели ...]';
}

const openai = new OpenAI({
    apiKey: 'not-needed',
    baseURL: 'http://localhost:1234/v1',
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, documentText } = body; // 'explain' or 'quiz'

        if (!type || !['explain', 'quiz'].includes(type)) {
            return NextResponse.json({ error: 'Invalid generation type' }, { status: 400 });
        }

        let contextText = '';
        if (documentText && typeof documentText === 'string' && documentText.trim()) {
            contextText = documentText.trim();
        } else {
            const query = type === 'explain' ? 'summary overview main points' : 'test questions key facts';
            const relevantChunks = await retrieveRelevantChunks(query, 5);
            contextText = relevantChunks.map((c) => c.text).join('\n---\n');
        }

        if (!contextText) {
            return NextResponse.json(
                { error: 'No document content available. Please upload a document first.' },
                { status: 400 }
            );
        }

        contextText = truncateForContext(contextText);

        let systemPrompt = '';
        let userPrompt = '';

        if (type === 'explain') {
            systemPrompt = `You are a study assistant. Your task is to explain and help people learn. Study the received data and explain what it is about. Also answer follow-up questions from the user. Use Markdown formatting for readability.`;
            userPrompt = `Study the following document and explain what it is about:\n\n${contextText}`;
        } else {
            systemPrompt = `You are a strict output generator. You must generate a JSON array of 15-20 multiple choice questions.

IMPORTANT: Questions must be about the SUBJECT MATTER and LEARNING CONTENT inside the document - test the student's understanding of the concepts, definitions, facts, and ideas presented in the text. Do NOT ask meta-questions about the document itself (e.g. "What format is this document?" or "How many sections does this have?").

The output must be a valid JSON array of objects. NO markdown, NO code blocks, just raw JSON.
Each object must have:
- "question": string (tests knowledge from the content)
- "options": array of 4 strings
- "correctAnswer": string (must match one of the options exactly)
- "explanation": string (brief explanation referring to the document content)

Example format:
[
    {"question": "According to the text, what is X?", "options": ["A", "B", "C", "D"], "correctAnswer": "B", "explanation": "The document states..."},
    {"question": "Which concept is defined as...?", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "explanation": "..."}
]`;
            userPrompt = `Generate 15-20 multiple choice questions that test understanding of the material in this document:\n\n${contextText}`;
        }

        const response = await openai.chat.completions.create({
            model: 'local-model', // LM Studio usually ignores this or uses loaded model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of response) {
                        const content = chunk.choices[0]?.delta?.content || '';
                        if (content) {
                            controller.enqueue(new TextEncoder().encode(content));
                        }
                    }
                } catch (streamError: unknown) {
                    const err = streamError instanceof Error ? streamError : new Error(String(streamError));
                    const causeMsg = err.cause instanceof Error ? err.cause.message : '';
                    const msg = err.message + ' ' + causeMsg;
                    if (msg.includes('Context size') || msg.includes('context') || msg.includes('exceeded')) {
                        controller.enqueue(new TextEncoder().encode('\n\n⚠️ Документ слишком большой для модели. Попробуйте загрузить файл меньшего размера или использовать более короткий текст.'));
                    } else {
                        controller.enqueue(new TextEncoder().encode('\n\n⚠️ Ошибка при генерации. Попробуйте ещё раз.'));
                    }
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain',
                'Transfer-Encoding': 'chunked',
            },
        });

    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }
}
