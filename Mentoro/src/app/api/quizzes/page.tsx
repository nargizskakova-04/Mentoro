'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Upload, FileText, Loader2 } from 'lucide-react';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async (type: 'quiz' | 'explain') => {
        if (!file) {
            setError("Please select a file first");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Отправляем файл на сервер для извлечения текста
            const response = await fetch('/api/quizzes/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to upload');

            // 2. САМЫЙ ВАЖНЫЙ МОМЕНТ: Сохраняем извлеченный текст
            // Мы берем поле extractedText (как в твоем route.ts) и кладем в память
            if (data.extractedText) {
                localStorage.setItem('lastUploadedText', data.extractedText);
                
                // 3. Переходим на страницу результата
                router.push(`/dashboard/quizzes/result?type=${type}`);
            } else {
                throw new Error("No text could be extracted from this document");
            }

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: 'bold' }}>
                Upload Study Material
            </h1>
            
            <div style={{ 
                border: '2px dashed #ccc', 
                padding: '40px', 
                borderRadius: '12px', 
                textAlign: 'center',
                backgroundColor: '#f9f9f9' 
            }}>
                <input 
                    type="file" 
                    id="fileInput"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".pdf,.txt,.doc,.docx"
                />
                <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                    <Upload size={48} style={{ margin: '0 auto 16px', color: '#666' }} />
                    <p>{file ? file.name : "Click to select a PDF or Text file"}</p>
                </label>
            </div>

            {error && (
                <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <Button 
                    onClick={() => handleUpload('quiz')} 
                    disabled={loading || !file}
                    style={{ flex: 1 }}
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Make Quiz"}
                </Button>
                
                <Button 
                    variant="secondary"
                    onClick={() => handleUpload('explain')} 
                    disabled={loading || !file}
                    style={{ flex: 1 }}
                >
                    Explain Material
                </Button>
            </div>
        </div>
    );
}