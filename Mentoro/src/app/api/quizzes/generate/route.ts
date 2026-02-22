import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, documentText } = body;

        // Используй тот же ключ, что и в чате
        const API_KEY = process.env.GOOGLE_AI_API_KEY;  

        if (!documentText) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 });
        }

        let prompt = "";
        if (type === 'explain') {
            prompt = `Explain these study materials clearly in Markdown. Text: ${documentText}`;
        } else {
            prompt = `Create a quiz from this text. Return ONLY a JSON array. 
            Format: [{"question": "...", "options": ["a", "b", "c", "d"], "correctAnswer": "...", "explanation": "..."}]
            Text: ${documentText}`;
        }

        // Добавляем ту самую строку URL, которой не хватало:
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("GENERATION ERROR:", data);
            return NextResponse.json(data, { status: response.status });
        }

        let botText = data.candidates[0].content.parts[0].text;

        // Чистим JSON от лишних знаков
        if (type === 'quiz') {
            botText = botText.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        return NextResponse.json({ text: botText });

    } catch (error: any) {
        console.error('Final error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}