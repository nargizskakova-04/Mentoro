'use client';

import React from 'react';
import { X, Bell, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './NotificationModal.module.css';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning';
    time: string;
    read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 1,
        title: 'Assignment Due Soon',
        message: 'Your "Database Systems" assignment is due tomorrow at 11:59 PM.',
        type: 'warning',
        time: '2 hours ago',
        read: false,
    },
    {
        id: 2,
        title: 'Quiz Graded',
        message: 'Your submission for "Algorithms Quiz 1" has been graded. Score: 95/100.',
        type: 'success',
        time: '5 hours ago',
        read: false,
    },
    {
        id: 3,
        title: 'New Material Available',
        message: 'Professor uploaded new lecture notes for "Software Architecture".',
        type: 'info',
        time: '1 day ago',
        read: true,
    },
];

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Notifications</h3>
                    <button className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                
                <div className={styles.content}>
                    {MOCK_NOTIFICATIONS.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Bell size={40} color="#A3AED0" />
                            <p>No new notifications</p>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {MOCK_NOTIFICATIONS.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                                >
                                    <div className={styles.iconContainer}>
                                        {notification.type === 'warning' && <AlertCircle size={20} color="#FFB547" />}
                                        {notification.type === 'success' && <CheckCircle size={20} color="#05CD99" />}
                                        {notification.type === 'info' && <Bell size={20} color="#4318FF" />}
                                    </div>
                                    <div className={styles.details}>
                                        <div className={styles.itemHeader}>
                                            <span className={styles.itemTitle}>{notification.title}</span>
                                            <span className={styles.time}>{notification.time}</span>
                                        </div>
                                        <p className={styles.message}>{notification.message}</p>
                                    </div>
                                    {!notification.read && <div className={styles.dot}></div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.markAllBtn}>Mark all as read</button>
                </div>
            </div>
        </div>
    );
};
