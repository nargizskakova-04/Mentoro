'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Search, AlertCircle } from 'lucide-react';
import styles from '../page.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
                credentials: 'include',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message ?? data.detail ?? 'Something went wrong');
            }

            // Automatically log in after registration or redirect to login
            router.push('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.loginCard}>
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '24px' }}>
                    <Image
                        src="/assets/Название_вместо_AI_Mentor_на_Mentoro.jpg"
                        alt="Mentoro"
                        width={160}
                        height={160}
                        style={{ objectFit: 'contain' }}
                        priority
                    />
                </div>
                {/* Brand Header */}
                <div className={styles.brandHeader}>
                    <p className={styles.tagline}>Create your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div style={{ color: 'red', fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {/* Registration Form */}
                <form className={styles.form} onSubmit={handleRegister}>
                    <Input
                        name="name"
                        type="text"
                        placeholder="Full Name"
                        icon={<User size={18} />}
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        icon={<Mail size={18} />}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        icon={<Lock size={18} />}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        icon={<Lock size={18} />}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className={styles.orDivider}></div>

                <div style={{ textAlign: 'center', fontSize: 14 }}>
                    Already have an account? <Link href="/" style={{ color: '#6B4BA1', fontWeight: 600 }}>Log in</Link>
                </div>
            </div>
        </main>
    );
}
