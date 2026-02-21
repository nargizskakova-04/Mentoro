'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Search, ChevronRight } from 'lucide-react';
import styles from './page.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh(); // Refresh to update middleware state
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
            width={200}
            height={200}
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <p className={styles.tagline}>Your academic assistant powered by AI</p>
        </div>

        {/* Welcome Section */}
        <div className={styles.welcomeSection}>
          <h2 className={styles.welcomeTitle}>Welcome Back!</h2>
          <p className={styles.welcomeSubtitle}>Log in to continue to Mentoro.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ color: 'red', fontSize: 14, marginBottom: 10, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className={styles.form} onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Enter your password"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div
            className={styles.forgotPassword}
            onClick={() => alert("Password reset functionality coming soon!")}
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Continue'}
          </Button>
        </form>

        <div className={styles.orDivider}>OR</div>

        {/* Social Login */}
        <div className={styles.authActions}>
          <Button variant="secondary" onClick={() => router.push('/register')} style={{ marginTop: '1rem', width: '100%' }}>
            Create New Account
          </Button>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <span onClick={() => alert("About page coming soon!")} style={{ cursor: 'pointer' }}>About</span>
            <span>|</span>
            <span onClick={() => alert("Privacy Policy coming soon!")} style={{ cursor: 'pointer' }}>Privacy</span>
            <span>|</span>
            <span onClick={() => alert("Terms of Service coming soon!")} style={{ cursor: 'pointer' }}>Terms</span>
            <span>|</span>
            <span onClick={() => alert("Support page coming soon!")} style={{ cursor: 'pointer' }}>Support</span>
          </div>
        </div>
      </div>
    </main>
  );
}
