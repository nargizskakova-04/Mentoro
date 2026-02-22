'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, BookOpen, Layers, Award, LogOut, Loader2, Edit2, Save, X } from 'lucide-react';
import styles from './page.module.css';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface UserProfile {
    id?: string;
    name: string;
    email: string;
    major?: string;
    group?: string;
    gpa?: string | number;
    createdAt?: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', major: '', group: '', gpa: '' });

    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                const u = data.user ?? null;
                setUser(u);
                if (u) {
                    setEditForm({
                        name: u.name ?? '',
                        major: u.major ?? 'Computer Science',
                        group: u.group ?? 'CS-101',
                        gpa: String(u.gpa ?? '3.5'),
                    });
                }
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaveLoading(true);
        setSaveError(null);
        setSaveSuccess(false);
        try {
            const res = await fetch('/api/auth/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: editForm.name || undefined,
                    major: editForm.major || undefined,
                    group: editForm.group || undefined,
                    gpa: editForm.gpa ? parseFloat(editForm.gpa) : undefined,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                throw new Error(data.message ?? data.detail ?? 'Failed to update profile');
            }
            if (data.user) setUser(data.user);
            setSaveSuccess(true);
            setEditMode(false);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: unknown) {
            setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            try {
                await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            } finally {
                router.push('/');
                router.refresh();
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#4318FF' }}>
                <Loader2 size={40} className="animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className={styles.container}>
                <div style={{ textAlign: 'center', marginTop: 100 }}>
                    <h3>Please log in to view your profile.</h3>
                    <Button variant="primary" onClick={() => router.push('/')} style={{ marginTop: 20 }}>
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h2 className={styles.title}>My Profile</h2>
                        <p className={styles.subtitle}>Manage your personal information and settings.</p>
                    </div>
                    {saveSuccess && (
                        <span style={{ color: '#05CD99', fontSize: 14, fontWeight: 500 }}>Profile saved successfully.</span>
                    )}
                    {saveError && (
                        <span style={{ color: '#EE5D50', fontSize: 14 }}>{saveError}</span>
                    )}
                    {!editMode ? (
                        <Button variant="secondary" onClick={() => setEditMode(true)}>
                            <Edit2 size={18} /> Edit Profile
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button variant="secondary" onClick={() => { setEditMode(false); setSaveError(null); }}>
                                <X size={18} /> Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSaveProfile} disabled={saveLoading}>
                                {saveLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {saveLoading ? ' Saving...' : ' Save'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.grid}>
                {/* Left Column: Personal Info */}
                <div className={styles.leftColumn}>
                    <Card className={styles.profileCard}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatarWrapper}>
                                <Image
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4318FF&color=fff&size=120`}
                                    alt="Profile Picture"
                                    width={120}
                                    height={120}
                                    className={styles.avatar}
                                />
                                <div className={styles.onlineStatus}></div>
                            </div>
                            <h3 className={styles.userName}>{editMode ? editForm.name : user.name}</h3>
                            <p className={styles.userRole}>Student</p>
                            {user.id && <p className={styles.userId}>ID: {String(user.id).slice(0, 8)}</p>}
                        </div>

                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <Mail size={18} className={styles.icon} />
                                <span>{user.email}</span>
                            </div>
                            <div className={styles.infoItem}>
                                <Phone size={18} className={styles.icon} />
                                <span>+7 (777) 000-00-00</span>
                            </div>
                            <div className={styles.infoItem}>
                                <MapPin size={18} className={styles.icon} />
                                <span>Astana, Kazakhstan</span>
                            </div>
                        </div>

                        <div className={styles.logoutSection}>
                            <Button
                                variant="secondary"
                                className={styles.logoutBtn}
                                onClick={handleLogout}
                            >
                                <LogOut size={18} />
                                Log Out
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Academic Info */}
                <div className={styles.rightColumn}>
                    <Card className={styles.detailsCard}>
                        <h3 className={styles.cardTitle}>Academic Information</h3>

                        <div className={styles.detailsGrid}>
                            {editMode ? (
                                <>
                                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                                        <div className={styles.detailIcon} style={{ background: '#E6F7FF', color: '#0095FF' }}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div className={styles.detailContent} style={{ flex: 1 }}>
                                            <span className={styles.detailLabel}>Full name</span>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                                                className={styles.detailValue}
                                                style={{ border: '1px solid #E0E5F2', borderRadius: 8, padding: '6px 10px', marginTop: 4 }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <div className={styles.detailIcon} style={{ background: '#E6F7FF', color: '#0095FF' }}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>Major</span>
                                            <input
                                                type="text"
                                                value={editForm.major}
                                                onChange={(e) => setEditForm((f) => ({ ...f, major: e.target.value }))}
                                                className={styles.detailValue}
                                                style={{ border: '1px solid #E0E5F2', borderRadius: 8, padding: '6px 10px', marginTop: 4 }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <div className={styles.detailIcon} style={{ background: '#FFF7E6', color: '#FFB547' }}>
                                            <Layers size={24} />
                                        </div>
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>Group</span>
                                            <input
                                                type="text"
                                                value={editForm.group}
                                                onChange={(e) => setEditForm((f) => ({ ...f, group: e.target.value }))}
                                                className={styles.detailValue}
                                                style={{ border: '1px solid #E0E5F2', borderRadius: 8, padding: '6px 10px', marginTop: 4 }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <div className={styles.detailIcon} style={{ background: '#E6FFFA', color: '#05CD99' }}>
                                            <Award size={24} />
                                        </div>
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>GPA</span>
                                            <input
                                                type="text"
                                                value={editForm.gpa}
                                                onChange={(e) => setEditForm((f) => ({ ...f, gpa: e.target.value }))}
                                                className={styles.detailValue}
                                                style={{ border: '1px solid #E0E5F2', borderRadius: 8, padding: '6px 10px', marginTop: 4 }}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.detailItem}>
                                        <div className={styles.detailIcon} style={{ background: '#E6F7FF', color: '#0095FF' }}>
                                            <BookOpen size={24} />
                                        </div>
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>Major</span>
                                            <span className={styles.detailValue}>{user.major || 'Computer Science'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <div className={styles.detailIcon} style={{ background: '#FFF7E6', color: '#FFB547' }}>
                                            <Layers size={24} />
                                        </div>
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>Group</span>
                                            <span className={styles.detailValue}>{user.group || 'CS-101'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.detailItem}>
                                        <div className={styles.detailIcon} style={{ background: '#E6FFFA', color: '#05CD99' }}>
                                            <Award size={24} />
                                        </div>
                                        <div className={styles.detailContent}>
                                            <span className={styles.detailLabel}>GPA</span>
                                            <span className={styles.detailValue}>{user.gpa ?? '3.50'}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.divider}></div>

                        <h3 className={styles.cardTitle}>Current Courses</h3>
                        <div className={styles.coursesList}>
                            {['Data Structures & Algorithms', 'Database Management Systems', 'Software Architecture', 'Web Development'].map((course, index) => (
                                <div key={index} className={styles.courseItem}>
                                    <div className={styles.courseBullet}></div>
                                    <span>{course}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className={styles.activityCard}>
                        <h3 className={styles.cardTitle}>Recent Activity</h3>
                        <div className={styles.emptyState}>
                            No recent activity to show.
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
