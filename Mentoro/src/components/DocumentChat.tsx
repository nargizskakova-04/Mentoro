'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './DocumentChat.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface DocumentChatProps {
    initialSummary: string;
    documentText?: string | null;
}

export const DocumentChat = ({ initialSummary, documentText }: DocumentChatProps) => {
    const [messages, setMessages] = useState<Message[]>(() =>
        initialSummary.trim()
            ? [{ role: 'assistant', content: initialSummary }]
            : [{ role: 'assistant', content: 'No summary available. Please try again.' }]
    );
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const chatMessages = [...messages, userMessage].map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await fetch('/api/quizzes/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: chatMessages,
                    documentText: documentText || (typeof window !== 'undefined' ? sessionStorage.getItem('campusmate-document-text') : null) || undefined,
                }),
            });

            if (!response.ok) throw new Error(response.statusText);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiMessageContent = '';

            if (reader) {
                setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    aiMessageContent += text;

                    setMessages((prev) => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = {
                            role: 'assistant',
                            content: aiMessageContent,
                        };
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Document chat error:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again later.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    <Bot size={20} />
                </div>
                <div>
                    <div className={styles.title}>Document Assistant</div>
                    <div className={styles.subtitle}>Ask follow-up questions about the document</div>
                </div>
                <div className={styles.statusIndicator}>Online</div>
            </div>

            <div className={styles.messagesArea}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                    >
                        <div className={styles.messageContent}>
                            {msg.role === 'assistant' ? (
                                <div className={styles.markdown}>
                                    <ReactMarkdown>
                                        {msg.content?.trim() ? msg.content : 'No response received.'}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className={`${styles.message} ${styles.aiMessage}`}>
                        <div className={styles.loadingDots}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className={styles.inputArea} onSubmit={handleSend}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Ask about the document..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={styles.sendButton}
                    disabled={!input.trim() || isLoading}
                >
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};
