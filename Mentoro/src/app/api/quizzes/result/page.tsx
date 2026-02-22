'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuizPlayer } from '@/components/QuizPlayer';

export default function ResultContent() {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Этот useRef заблокирует повторные запросы намертво
    const requestStarted = useRef(false);

    useEffect(() => {
        // Если запрос уже запущен — ничего не делаем
        if (requestStarted.current) return;
        requestStarted.current = true;

        const generate = async () => {
            try {
                const text = localStorage.getItem('lastUploadedText');
                if (!text) {
                    setError("Text not found. Please re-upload.");
                    setLoading(false);
                    return;
                }

                const response = await fetch('/api/quizzes/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, documentText: text }),
                });

                const result = await response.json();

                if (!response.ok) {
                    // Если всё еще 429 — выводим вежливое сообщение
                    if (response.status === 429) {
                        throw new Error("Google is resting. Wait 20 seconds and refresh.");
                    }
                    throw new Error(result.error?.message || "Generation failed");
                }

                if (type === 'quiz') {
                    const cleanJson = result.text.replace(/```json/g, '').replace(/```/g, '').trim();
                    setData(JSON.parse(cleanJson));
                } else {
                    setData(result.text);
                }
            } catch (err: any) {
                setError(err.message);
                // Даем возможность попробовать снова только при ошибке
                requestStarted.current = false; 
            } finally {
                setLoading(false);
            }
        };

        generate();
    }, [type]);

    if (loading) return <div style={{padding: '40px'}}>Thinking... Please don't refresh.</div>;
    if (error) return <div style={{padding: '40px', color: 'red'}}>Error: {error}</div>;

    return (
        <div style={{padding: '20px'}}>
            {type === 'quiz' ? <QuizPlayer questions={data} /> : <div style={{whiteSpace: 'pre-wrap'}}>{data}</div>}
        </div>
    );
}