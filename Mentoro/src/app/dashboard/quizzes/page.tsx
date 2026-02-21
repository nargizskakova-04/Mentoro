'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Sparkles, FileQuestion, ChevronRight, Cloud, FileText, X, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';

export default function QuizzesPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const quizzes = [
        { id: 1, title: 'Data Structures Basics', course: 'Data Structures', status: 'Completed', score: '95%' },
        { id: 2, title: 'Linked Lists & Arrays', course: 'Data Structures', status: 'Pending', score: '-' },
        { id: 3, title: 'Database Normalization', course: 'Databases', status: 'Pending', score: '-' },
        { id: 4, title: 'React Fundamentals', course: 'Web Development', status: 'Completed', score: '88%' },
        { id: 5, title: 'Algorithm Complexity', course: 'Algorithms', status: 'Pending', score: '-' },
    ];

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerate = async (type: 'explain' | 'quiz') => {
        if (!selectedFile) return;

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch('/api/quizzes/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.details || data.error || 'Failed to process file');
            }

            if (data.extractedText) {
                sessionStorage.setItem('campusmate-document-text', data.extractedText);
            }

            router.push(`/dashboard/quizzes/result?type=${type}`);
        } catch (error: any) {
            console.error('Error processing file:', error);
            alert(`Error: ${error.message || 'Failed to process file'}`);
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Quizzes & Assignments</h2>
                <p className={styles.subtitle}>Manage your assessments and get AI help.</p>
            </div>

            <div className={styles.quizList}>
                {quizzes.map((quiz) => (
                    <div
                        key={quiz.id}
                        className={styles.quizItem}
                        onClick={() => alert(`Opening details for: ${quiz.title}`)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className={styles.quizInfo}>
                            <div
                                className={styles.quizIcon}
                                style={{ background: quiz.status === 'Completed' ? '#05CD99' : '#FFB547' }}
                            >
                                <FileQuestion size={20} />
                            </div>
                            <div className={styles.quizDetails}>
                                <h4>{quiz.title}</h4>
                                <p>{quiz.course}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <span className={`${styles.statusChip} ${quiz.status === 'Completed' ? styles.completed : styles.pending}`}>
                                {quiz.status}
                            </span>
                            <ChevronRight size={20} color="#A3AED0" />
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Explanation Cloud Section */}
            <div className={styles.aiCloudSection}>
                <div className={styles.cloudCircle1}></div>
                <div className={styles.cloudCircle2}></div>

                <div className={styles.aiHeader}>
                    <div style={{ background: '#E9E3FF', padding: 12, borderRadius: '50%', color: '#4318FF' }}>
                        <Cloud size={32} />
                    </div>
                    <h3 className={styles.aiTitle}>AI Explanation</h3>
                    <p className={styles.aiDescription}>
                        Stuck on a problem? Upload your quiz file or screenshot and let AI explain it to you.
                    </p>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 16,
                        padding: '8px 16px',
                        background: 'rgba(67, 24, 255, 0.05)',
                        borderRadius: '12px',
                        border: '1px dashed #4318FF',
                        zIndex: 2,
                        position: 'relative'
                    }}>
                        <FileText size={20} color="#4318FF" />
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#1B2559' }}>{selectedFile.name}</div>
                            <div style={{ fontSize: 12, color: '#A3AED0' }}>{(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}</div>
                        </div>
                        <button onClick={clearFile} disabled={isProcessing} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EE5D50' }}>
                            <X size={18} />
                        </button>
                    </div>
                )}

                <div className={styles.aiActions}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.xlsx,.txt,.md"
                    />

                    <Button variant="secondary" className={styles.uploadBtn} onClick={handleUploadClick} disabled={isProcessing}>
                        <Upload size={18} />
                        Add File
                    </Button>

                    <Button
                        variant="primary"
                        className={styles.uploadBtn}
                        onClick={() => handleGenerate('explain')}
                        disabled={!selectedFile || isProcessing}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        Explain
                    </Button>

                    <Button
                        variant="primary"
                        className={styles.uploadBtn}
                        style={{ background: '#FFB547', color: '#1B2559' }}
                        onClick={() => handleGenerate('quiz')}
                        disabled={!selectedFile || isProcessing}
                    >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (
                            <Image
                                src="/assets/quiz-icon.png"
                                alt="Icon"
                                width={20}
                                height={20}
                            />
                        )}
                        Make Quiz
                    </Button>
                </div>
            </div>
        </div>
    );
}