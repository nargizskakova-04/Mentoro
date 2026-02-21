'use client';

import React, { useState } from 'react';
import { Bell, Search } from 'lucide-react'; // Using Search as logo placeholder if needed
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';
import { NotificationModal } from './NotificationModal';

export default function Header() {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const router = useRouter();

    const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);

    const handleProfileClick = () => {
        router.push('/dashboard/profile');
    };

    return (
        <header className={styles.header}>
            <div className={styles.titleContainer}>
                <h1 className={styles.title}>Mentoro</h1>
            </div>

            <div className={styles.actions}>
                <button
                    className={styles.iconButton}
                    onClick={toggleNotifications}
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {/* Optional: Add red dot if unread notifications exist */}
                    <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 8,
                        height: 8,
                        background: '#EE5D50',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }}></div>
                </button>

                <div
                    className={styles.profile}
                    onClick={handleProfileClick}
                    style={{ cursor: 'pointer' }}
                    title="Click to Logout"
                >
                    <img src="https://i.pravatar.cc/150?img=12" alt="Profile" className={styles.profileImage} />
                </div>
            </div>

            <NotificationModal
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
            />
        </header>
    );
}
