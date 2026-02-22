'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Sparkles, FileQuestion, ChevronRight, Cloud, FileText, X, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';

export interface AssignmentItem {
    id: string;
    user_id: string;
    title: string;
    course: string;
    status: string;
    score: string | null;
    createdAt: string;
}

export default function QuizzesPage() {
    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(true);
    const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
    const [listMessage, setListMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addForm, setAddForm] = useState({ title: '', course: '', status: 'Pending', score: '-' });
    const [addLoading, setAddLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ title: '', course: '', status: 'Pending', score: '-' });
    const [editLoading, setEditLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fetchAssignments = useCallback(async () => {
        setAssignmentsLoading(true);
        setAssignmentsError(null);
        try {
            const res = await fetch('/api/assignments', { credentials: 'include' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message ?? 'Failed to load assignments');
            }
            setAssignments(data.assignments ?? []);
        } catch (err) {
            setAssignmentsError(err instanceof Error ? err.message : 'Failed to load assignments');
            setAssignments([]);
        } finally {
            setAssignmentsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const clearListMessage = () => setListMessage(null);
    useEffect(() => {
        if (!listMessage) return;
        const t = setTimeout(clearListMessage, 4000);
        return () => clearTimeout(t);
    }, [listMessage]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addForm.title.trim() || !addForm.course.trim()) return;
        setAddLoading(true);
        try {
            const res = await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    title: addForm.title.trim(),
                    course: addForm.course.trim(),
                    status: addForm.status,
                    score: addForm.score || '-',
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message ?? 'Failed to create');
            setAssignments((prev) => [data.assignment, ...prev]);
            setAddModalOpen(false);
            setAddForm({ title: '', course: '', status: 'Pending', score: '-' });
            setListMessage({ type: 'success', text: 'Assignment added.' });
        } catch (err) {
            setListMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create' });
        } finally {
            setAddLoading(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setEditLoading(true);
        try {
            const res = await fetch(`/api/assignments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(editForm),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message ?? 'Failed to update');
            setAssignments((prev) =>
                prev.map((a) => (a.id === id ? data.assignment : a))
            );
            setEditingId(null);
            setListMessage({ type: 'success', text: 'Assignment updated.' });
        } catch (err) {
            setListMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' });
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/assignments/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message ?? 'Failed to delete');
            setAssignments((prev) => prev.filter((a) => a.id !== id));
            setListMessage({ type: 'success', text: 'Assignment deleted.' });
        } catch (err) {
            setListMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete' });
        } finally {
            setDeletingId(null);
        }
    };

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
        setUploadError(null);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const res = await fetch('/api/quizzes/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                throw new Error(data.details ?? data.error ?? data.message ?? 'Failed to process file');
            }

            if (data.extractedText) {
                sessionStorage.setItem('mentoro-document-text', data.extractedText);
            }

            router.push(`/dashboard/quizzes/result?type=${type}`);
        } catch (error: unknown) {
            console.error('Error processing file:', error);
            setUploadError(error instanceof Error ? error.message : 'Failed to process file');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 className={styles.title}>Quizzes & Assignments</h2>
                        <p className={styles.subtitle}>Manage your assessments and get AI help.</p>
                    </div>
                    {listMessage && (
                        <span style={{ color: listMessage.type === 'success' ? '#05CD99' : '#EE5D50', fontSize: 14 }}>
                            {listMessage.text}
                        </span>
                    )}
                    <Button variant="primary" onClick={() => setAddModalOpen(true)}>
                        <Plus size={18} /> Add assignment
                    </Button>
                </div>
            </div>

            {addModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
                }} onClick={() => !addLoading && setAddModalOpen(false)}>
                    <div style={{ background: 'white', padding: 24, borderRadius: 16, maxWidth: 400, width: '100%', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 16, fontSize: 18 }}>New assignment</h3>
                        <form onSubmit={handleCreate}>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#707EAE' }}>Title</label>
                            <input
                                value={addForm.title}
                                onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E5F2', borderRadius: 8, marginBottom: 12 }}
                            />
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#707EAE' }}>Course</label>
                            <input
                                value={addForm.course}
                                onChange={(e) => setAddForm((f) => ({ ...f, course: e.target.value }))}
                                required
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E5F2', borderRadius: 8, marginBottom: 12 }}
                            />
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#707EAE' }}>Status</label>
                            <select
                                value={addForm.status}
                                onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E5F2', borderRadius: 8, marginBottom: 12 }}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#707EAE' }}>Score</label>
                            <input
                                value={addForm.score}
                                onChange={(e) => setAddForm((f) => ({ ...f, score: e.target.value }))}
                                placeholder="e.g. 95% or -"
                                style={{ width: '100%', padding: '10px 12px', border: '1px solid #E0E5F2', borderRadius: 8, marginBottom: 16 }}
                            />
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)} disabled={addLoading}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={addLoading}>
                                    {addLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                                    {addLoading ? ' Adding...' : ' Add'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {assignmentsLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, color: '#4318FF' }}>
                    <Loader2 size={24} className="animate-spin" /> Loading assignments...
                </div>
            )}
            {assignmentsError && (
                <div style={{ marginBottom: 24, padding: 16, background: '#FFEAEA', borderRadius: 12, color: '#EE5D50' }}>
                    {assignmentsError}
                </div>
            )}

            <div className={styles.quizList}>
                {!assignmentsLoading && assignments.length === 0 && !assignmentsError && (
                    <div style={{ padding: 32, textAlign: 'center', color: '#A3AED0' }}>
                        No assignments yet. Add one or use AI to generate from a document below.
                    </div>
                )}
                {assignments.map((quiz) => (
                    <div key={quiz.id} className={styles.quizItem}>
                        {editingId === quiz.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                                <input
                                    value={editForm.title}
                                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                                    style={{ padding: '8px 12px', border: '1px solid #E0E5F2', borderRadius: 8 }}
                                />
                                <input
                                    value={editForm.course}
                                    onChange={(e) => setEditForm((f) => ({ ...f, course: e.target.value }))}
                                    style={{ padding: '8px 12px', border: '1px solid #E0E5F2', borderRadius: 8 }}
                                />
                                <select
                                    value={editForm.status}
                                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                                    style={{ padding: '8px 12px', border: '1px solid #E0E5F2', borderRadius: 8 }}
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <input
                                    value={editForm.score}
                                    onChange={(e) => setEditForm((f) => ({ ...f, score: e.target.value }))}
                                    style={{ padding: '8px 12px', border: '1px solid #E0E5F2', borderRadius: 8 }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Button variant="secondary" onClick={() => setEditingId(null)} disabled={editLoading}>Cancel</Button>
                                    <Button variant="primary" onClick={() => handleUpdate(quiz.id)} disabled={editLoading}>
                                        {editLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span className={`${styles.statusChip} ${quiz.status === 'Completed' ? styles.completed : styles.pending}`}>
                                        {quiz.status}
                                    </span>
                                    <span style={{ fontSize: 14, color: '#707EAE' }}>{quiz.score ?? '-'}</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setEditingId(quiz.id); setEditForm({ title: quiz.title, course: quiz.course, status: quiz.status, score: quiz.score ?? '-' }); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#4318FF' }}
                                        title="Edit"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this assignment?')) handleDelete(quiz.id); }}
                                        disabled={deletingId === quiz.id}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#EE5D50' }}
                                        title="Delete"
                                    >
                                        {deletingId === quiz.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                    <ChevronRight size={20} color="#A3AED0" />
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* AI Explanation Cloud Section */}
            <div className={styles.aiCloudSection}>
                <div className={styles.cloudCircle1}></div>
                <div className={styles.cloudCircle2}></div>

                {uploadError && (
                    <div style={{ marginBottom: 16, padding: 12, background: '#FFEAEA', borderRadius: 12, color: '#EE5D50', position: 'relative', zIndex: 2 }}>
                        {uploadError}
                    </div>
                )}
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