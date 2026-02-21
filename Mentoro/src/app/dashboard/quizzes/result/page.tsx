'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { DocumentChat } from '@/components/DocumentChat';
import { QuizPlayer, Question } from '@/components/QuizPlayer';

function ResultContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get('type');
    const [summary, setSummary] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [documentText, setDocumentText] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setDocumentText(sessionStorage.getItem('campusmate-document-text'));
        }
    }, []);

    useEffect(() => {
        if (!type) {
            router.push('/dashboard/quizzes');
            return;
        }

        const fetchData = async () => {
            try {
                const docText = typeof window !== 'undefined' ? sessionStorage.getItem('campusmate-document-text') : null;

                const response = await fetch('/api/quizzes/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, documentText: docText }),
                });

                if (!response.ok) throw new Error('Generation failed');

                if (type === 'explain') {
                    const reader = response.body?.getReader();
                    if (!reader) throw new Error('No body');
                    const decoder = new TextDecoder();
                    let fullText = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value, { stream: true });
                        fullText += chunk;
                        setSummary((prev) => prev + chunk);
                    }
                    setSummary(fullText);
                    setIsLoading(false);

                } else if (type === 'quiz') {
                    // For quiz, we need to wait for the full stream to parse JSON
                    // Or ideally, the API should just return JSON for quiz if we aren't streaming.
                    // Since existing API streams, let's accumulate and parse.
                    const reader = response.body?.getReader();
                    if (!reader) throw new Error('No body');
                    const decoder = new TextDecoder();
                    let fullText = '';

                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        fullText += decoder.decode(value, { stream: true });
                    }

                    try {
                        const parsed = JSON.parse(fullText);
                        setQuestions(parsed);
                        setIsLoading(false);
                    } catch (e) {
                        console.error("JSON Parse Error", e);
                        console.log("Raw LLM Output:", fullText); // Log raw output for debugging

                        // Attempt to extract JSON from code blocks or raw text
                        const jsonMatch = fullText.match(/```json\n([\s\S]*?)\n```/) ||
                            fullText.match(/```\n([\s\S]*?)\n```/) ||
                            fullText.match(/\[\s*\{[\s\S]*\}\s*\]/); // Try to find array bracket pattern

                        if (jsonMatch) {
                            try {
                                const extracted = jsonMatch[1] || jsonMatch[0];
                                setQuestions(JSON.parse(extracted));
                                setIsLoading(false);
                            } catch (jsonErr) {
                                console.error("Failed to parse extracted JSON", jsonErr);
                                throw new Error('Failed to parse quiz data');
                            }
                        } else {
                            throw new Error('Failed to parse quiz data. Output was not valid JSON.');
                        }
                    }
                }

            } catch (err) {
                console.error(err);
                setError('Failed to generate content. Please try again.');
                setIsLoading(false);
            }
        };

        fetchData();
    }, [type, router]);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => router.back()} className={styles.backBtn}>
                    <ArrowLeft size={20} />
                    Back
                </Button>
                <h2 className={styles.title}>
                    {type === 'explain' ? 'Document Assistant' : 'Interactive Quiz'}
                </h2>
                <div className={styles.actions}>
                    {/* Actions can go here */}
                </div>
            </div>

            <div className={styles.contentArea}>
                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <Loader2 className="animate-spin" size={48} color="#4318FF" />
                        <p>Analysing document & generating {type === 'explain' ? 'explanation' : 'quiz'}...</p>
                    </div>
                )}

                {error && (
                    <div className={styles.errorContainer}>
                        <p>{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            <RefreshCw size={16} /> Retry
                        </Button>
                    </div>
                )}

                {!isLoading && !error && (
                    <>
                        {type === 'explain' && (
                            <DocumentChat
                                initialSummary={summary}
                                documentText={documentText}
                            />
                        )}
                        {type === 'quiz' && <QuizPlayer questions={questions} />}
                    </>
                )}
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultContent />
        </Suspense>
    );
}
