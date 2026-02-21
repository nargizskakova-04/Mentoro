'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, FileText } from 'lucide-react';
import clsx from 'clsx';
import styles from './Sidebar.module.css';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Quizzes', href: '/dashboard/quizzes', icon: FileText },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Image
                    src="/assets/Название_вместо_AI_Mentor_на_Mentoro.jpg"
                    alt="Mentoro"
                    width={160}
                    height={160}
                    style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
                    priority
                />
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(styles.navItem, { [styles.active]: isActive })}
                        >
                            <item.icon className={styles.icon} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
