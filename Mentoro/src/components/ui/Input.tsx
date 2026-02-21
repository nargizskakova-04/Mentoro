'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export function Input({ icon, className, ...props }: InputProps) {
    return (
        <div className={clsx(styles.inputContainer, className)}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <input className={styles.input} {...props} />
        </div>
    );
}
