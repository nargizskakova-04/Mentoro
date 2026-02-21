import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client pointing to local LM Studio
const openai = new OpenAI({
    apiKey: 'not-needed', // LM Studio doesn't require an API key by default
    baseURL: 'http://localhost:1234/v1',
});

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { message: 'Messages array is required' },
                { status: 400 }
            );
        }

        const systemPrompt = {
            role: 'system',
            content: `You are a strict academic assistant for students. 
            RULES:
            1. ONLY answer questions related to studies, assignments, exams, or academic materials.
            2. If a user asks about anything else (movies, games, jokes, general chat), politely decline and steer them back to studying.
            3. Be encouraging but focused.
            4. Use Markdown for clear formatting.`
        };

        const completion = await openai.chat.completions.create({
            model: 'local-model',
            messages: [systemPrompt, ...messages],
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        controller.enqueue(new TextEncoder().encode(content));
                    }
                }
                controller.close();
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            }
        });

    } catch (error: any) {
        console.error('AI Chat error:', error);
        return NextResponse.json(
            { message: 'Failed to connect to AI service. Ensure LM Studio is running.' },
            { status: 500 }
        );
    }
}
