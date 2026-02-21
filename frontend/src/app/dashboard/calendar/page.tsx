'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import styles from './page.module.css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [activeFilter, setActiveFilter] = useState<'all' | 'labs' | 'assign' | 'exam'>('all');

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Generate calendar grid
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Mock Events mapped to Logic
    // For demo purposes, we will just show some static events on specific days relative to current month
    // In a real app, you'd fetch these
    const getEventsForDay = (date: Date) => {
        const day = date.getDate();
        let events = [];

        // deterministic mock events based on day number to populate grid
        if (day === 20) events.push({ title: 'Databases Assignm.', type: 'assign' });
        if (day === 10) events.push({ title: 'Data Structures', type: 'labs' });
        if (day === 18) events.push({ title: 'Software Arch.', type: 'assign' });
        if (day === 19) events.push({ title: 'DB Exam', type: 'exam' });
        if (day === 22) events.push({ title: 'DB Exam', type: 'exam' });

        if (activeFilter !== 'all') {
            return events.filter(e => e.type === activeFilter);
        }
        return events;
    };

    const toggleFilter = (filter: 'labs' | 'assign' | 'exam') => {
        setActiveFilter(prev => prev === filter ? 'all' : filter);
    };

    return (
        <div className={styles.container}>
            {/* Main Calendar Area */}
            <div className={styles.mainContent}>
                <div className={styles.titleSection}>
                    <div className={styles.monthNav}>
                        <h2 className={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</h2>
                        <div className={styles.navButtons}>
                            <button className={styles.navBtn} onClick={prevMonth}><ChevronLeft size={16} /></button>
                            <button className={styles.navBtn} onClick={nextMonth}><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className={styles.navBtn} onClick={goToToday}><RefreshCw size={14} /></button>
                        <Button variant="primary" style={{ height: 32, padding: '0 16px' }} onClick={goToToday}>Today</Button>
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <div
                        className={`${styles.filterChip} ${styles.labs}`}
                        style={{ opacity: activeFilter === 'all' || activeFilter === 'labs' ? 1 : 0.4, cursor: 'pointer' }}
                        onClick={() => toggleFilter('labs')}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span> Labs
                    </div>
                    <div
                        className={`${styles.filterChip} ${styles.assignments}`}
                        style={{ opacity: activeFilter === 'all' || activeFilter === 'assign' ? 1 : 0.4, cursor: 'pointer' }}
                        onClick={() => toggleFilter('assign')}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span> Assignments
                    </div>
                    <div
                        className={`${styles.filterChip} ${styles.exams}`}
                        style={{ opacity: activeFilter === 'all' || activeFilter === 'exam' ? 1 : 0.4, cursor: 'pointer' }}
                        onClick={() => toggleFilter('exam')}
                    >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'currentColor' }}></span> Exams
                    </div>
                </div>

                <div className={styles.calendarGrid}>
                    <div className={styles.weekHeader}>
                        {weekDays.map(d => (
                            <div key={d} className={styles.dayLabel}>{d}</div>
                        ))}
                    </div>

                    <div className={styles.daysGrid}>
                        {calendarDays.map((day, idx) => {
                            const events = getEventsForDay(day);
                            const isCurrentMonth = isSameMonth(day, monthStart);

                            return (
                                <div key={idx} className={styles.dayCell} style={{ background: isToday(day) ? '#F4F7FE' : 'transparent' }}>
                                    <div className={`${styles.dayNumber} ${!isCurrentMonth ? styles.inactiveDay : ''}`}>
                                        {format(day, 'd')}
                                    </div>

                                    {isCurrentMonth && events.map((ev, i) => (
                                        <div key={i} className={`${styles.eventChip} ${ev.type === 'labs' ? styles.eventLabs :
                                            ev.type === 'assign' ? styles.eventAssign : styles.eventExam
                                            }`}>
                                            {ev.title}
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Right Sidebar Panel */}
            <div className={styles.rightPanel}>
                <Card>
                    <h3 className={styles.sectionTitle}>Study Plan</h3>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#A3AED0', marginBottom: 6 }}>Today's focus</div>
                        <div style={{ background: '#E6F7FF', padding: 12, borderRadius: 10 }}>
                            <div style={{ fontWeight: 600, color: '#1B2559' }}>Review Linked Lists</div>
                            <div style={{ fontSize: 12, color: '#707EAE' }}>Data Structures</div>
                        </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#A3AED0', marginBottom: 6 }}>Next exam</div>
                        <div style={{ background: '#FFF8F5', padding: 12, borderRadius: 10, display: 'flex', gap: 10 }}>
                            <FileText size={18} color="#FFB547" />
                            <div>
                                <div style={{ fontWeight: 600, color: '#1B2559' }}>Software Architecture</div>
                                <div style={{ fontSize: 12, color: '#707EAE' }}>Project</div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={{ background: '#FFEAEA', padding: 12, borderRadius: 10, display: 'flex', gap: 10 }}>
                            <FileText size={18} color="#EE5D50" />
                            <div>
                                <div style={{ fontWeight: 600, color: '#1B2559' }}>Algorithms Exam</div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 className={styles.sectionTitle} style={{ margin: 0 }}>Upcoming deadlines</h3>
                        <span style={{ fontSize: 12, color: '#4318FF', cursor: 'pointer' }}>See all</span>
                    </div>

                    {[
                        { title: 'Algorithms Quiz', date: 'Jan 20', color: '#4318FF' },
                        { title: 'Databases Assignm.', date: 'Jan 22', color: '#0095FF' },
                        { title: 'Software Architect', date: 'Jan 28', color: '#EE5D50' }
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                            <div style={{ width: 4, height: 40, borderRadius: 2, background: item.color, marginRight: 12 }}></div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#1B2559' }}>{item.title}</div>
                                <div style={{ fontSize: 12, color: '#A3AED0' }}>{item.date}</div>
                            </div>
                        </div>
                    ))}
                </Card>
            </div>
        </div>
    );
}
