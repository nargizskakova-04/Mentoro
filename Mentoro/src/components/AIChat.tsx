'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import styles from './AIChat.module.css';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AIChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your Mentoro Academic Assistant. How can I help you studying today?' }
    ]);
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
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error(response.statusText);

            // Stream response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let aiMessageContent = '';

            if (reader) {
                // Add preliminary empty AI message
                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    aiMessageContent += text;

                    // Update last message with new content
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1] = { role: 'assistant', content: aiMessageContent };
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ background: '#E8E3F0', padding: 8, borderRadius: '50%', color: '#6B4BA1' }}>
                    <Bot size={20} />
                </div>
                <div>
                    <div className={styles.title}>Mentoro</div>
                    <div style={{ fontSize: 12, color: '#8B7BA8' }}>Always here to help</div>
                </div>
                <div style={{ marginLeft: 'auto' }} className={styles.statusIndicator}>
                    Online
                </div>
            </div>

            <div className={styles.messagesArea}>
                {messages.map((msg, index) => (
                    <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}>
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
                    placeholder="Ask about your studies..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className={styles.sendButton} disabled={!input.trim() || isLoading}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};
