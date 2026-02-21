'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronRight, Calendar, CheckSquare, FileText } from 'lucide-react';
import styles from './page.module.css';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AIChat } from '@/components/AIChat';

export default function DashboardHome() {
    const router = useRouter();

    return (
        <div>
            <div className={styles.headerSection}>
                <h2 className={styles.welcomeTitle}>Welcome back!</h2>
                <p className={styles.welcomeSubtitle}>Here's a summary of your upcoming activities and important tasks.</p>
            </div>

            {/* AI Chat Layout - Desktop: Side by side with grid, Mobile: Stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '24px' }}>
                <AIChat />
            </div>

            <div className={styles.grid}>

                {/* Study Plan Card */}
                <Card>
                    <h3 className={styles.cardTitle}>Study Plan</h3>

                    <div
                        className={styles.studySection}
                        style={{ cursor: 'pointer' }}
                        onClick={() => router.push('/dashboard/quizzes')} // Mock nav to detailed view
                    >
                        <p className={styles.subLabel}>Today's focus</p>
                        <div className={styles.courseCard}>
                            <CheckSquare size={18} color="#FFB547" />
                            <span style={{ fontWeight: 600, color: '#1B2559' }}>Data Structures</span>
                            <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#A3AED0' }} />
                        </div>
                    </div>

                    <div
                        className={styles.studySection}
                        style={{ cursor: 'pointer' }}
                        onClick={() => router.push('/dashboard/calendar')}
                    >
                        <p className={styles.subLabel}>Next exam</p>
                        <div className={`${styles.courseCard} ${styles.blue}`}>
                            <FileText size={18} color="#4318FF" />
                            <span style={{ fontWeight: 600, color: '#1B2559' }}>Software Architecture</span>
                            <span style={{ fontSize: 12, color: '#A3AED0', marginLeft: 'auto' }}>Apr 20</span>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        style={{ marginTop: 10, width: '100%' }}
                        onClick={() => router.push('/dashboard/calendar')}
                    >
                        View calendar
                    </Button>
                </Card>

                {/* Upcoming Deadlines Card */}
                <Card>
                    <h3 className={styles.cardTitle}>Upcoming Deadlines</h3>

                    <div className={styles.deadlineItem}>
                        <div className={styles.deadlineInfo}>
                            <div className={styles.iconBox}><FileText size={18} /></div>
                            <div><span style={{ fontWeight: 600 }}>Algorithms</span> <span style={{ color: '#A3AED0' }}>Quiz</span></div>
                        </div>
                        <span className={styles.deadlineDate}>Apr 20</span>
                    </div>

                    <div className={styles.deadlineItem}>
                        <div className={styles.deadlineInfo}>
                            <div className={styles.iconBox}><Calendar size={18} /></div>
                            <div><span style={{ fontWeight: 600 }}>Database</span> <span style={{ color: '#A3AED0' }}>Assignm</span></div>
                        </div>
                        <span className={styles.deadlineDate}>Apr 22</span>
                    </div>

                    <div className={styles.deadlineItem}>
                        <div className={styles.deadlineInfo}>
                            <div className={styles.iconBox}><CheckSquare size={18} color="#EE5D50" /></div>
                            <div><span style={{ fontWeight: 600 }}>Software Architect</span>...</div>
                        </div>
                        <span className={styles.deadlineDate}>Apr 25</span>
                    </div>

                    <div className={styles.seeAll}>
                        <Button variant="ghost" onClick={() => router.push('/dashboard/calendar')}>
                            See all <ChevronRight size={16} />
                        </Button>
                    </div>
                </Card>

                {/* Quizzes Overview Card */}
                <Card
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push('/dashboard/quizzes')}
                >
                    <h3 className={styles.cardTitle}>Quizzes Overview</h3>

                    <div className={styles.chartContainer}>
                        <svg width="140" height="140" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="#F4F7FE" strokeWidth="10" fill="none" />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#4318FF"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray="60 251"
                                transform="rotate(-90 50 50)"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className={styles.chartLabel}>
                            <div className={styles.chartNumber}>5 / 25</div>
                            <div className={styles.chartSub}>20%</div>
                        </div>
                    </div>

                    <div className={styles.quizStats}>
                        <span className={`${styles.statItem} ${styles.statCompleted}`}>5 Completed</span>
                        <span className={`${styles.statItem} ${styles.statRemaining}`}>20 Remaining</span>
                    </div>
                </Card>

            </div>

            <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #6AD2FF' }}></div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1B2559' }}>Greeting & Task Summary</h3>
                </div>

                <Card style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 32 }}>
                    <div style={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Image
                            src="/assets/greeting-brain.png"
                            alt="AI Assistant"
                            width={100}
                            height={100}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>

                    <div className={styles.summaryList}>
                        <div className={styles.summaryItem}>
                            <span className={styles.dayLabel}>Friday</span>
                            <span>Remember <span className={styles.highlight}>Software Architecture Project</span> is approaching. Let's get ready!</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.dayLabel}>Monday</span>
                            <span>Make sure to finish your <span className={styles.highlight}>Database Assignment</span> by this Monday.</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.dayLabel}>Thursday</span>
                            <span>A quiz on <span className={styles.highlight}>Algorithms</span> is coming up. Don't forget to review!</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div style={{ marginTop: 40, fontSize: 12, color: '#A3AED0' }}>
                MVP prototype — Academic project
            </div>

        </div>
    );
}