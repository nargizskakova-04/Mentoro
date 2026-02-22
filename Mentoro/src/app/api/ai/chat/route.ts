import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1]?.content;
        const API_KEY = process.env.GOOGLE_AI_API_KEY; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: lastMessage }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.log("ПОЛНЫЙ ОТВЕТ ОТ GOOGLE:", JSON.stringify(data, null, 2));
            return NextResponse.json(data, { status: response.status });
        }

        const botText = data.candidates[0].content.parts[0].text;
        return NextResponse.json({ text: botText });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}