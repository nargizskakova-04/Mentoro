'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Mail, Phone, MapPin, BookOpen, Layers, Award, LogOut, Loader2 } from 'lucide-react';
import styles from './page.module.css';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface UserProfile {
    name: string;
    email: string;
    role: string;
    major?: string;
    group?: string;
    gpa?: string;
    //  avatar?: string; // Future: Support avatar URL
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else {
                    // If unauthorized, maybe redirect or just show empty
                    console.error('Failed to fetch profile');
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            router.push('/');
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
                <h2 className={styles.title}>My Profile</h2>
                <p className={styles.subtitle}>Manage your personal information and settings.</p>
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
                            <h3 className={styles.userName}>{user.name}</h3>
                            <p className={styles.userRole}>Student</p>
                            <p className={styles.userId}>ID: {Math.floor(Math.random() * 900000) + 100000}</p>
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
                                    <span className={styles.detailValue}>{user.gpa || '3.50'}</span>
                                </div>
                            </div>
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
