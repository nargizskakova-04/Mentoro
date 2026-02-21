'use client';

import React, { useState } from 'react';
import { ChevronRight, Check, X, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './QuizPlayer.module.css';

export interface Question {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

interface QuizPlayerProps {
    questions: Question[];
}

export const QuizPlayer = ({ questions }: QuizPlayerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const question = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    const handleSelectOption = (option: string) => {
        if (showResult) return;

        setSelectedAnswer(option);
        setShowResult(true);
        if (option === question.correctAnswer) {
            setScore((prev) => prev + 1);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setIsComplete(true);
        } else {
            setCurrentIndex((prev) => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const handleRetry = () => {
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setIsComplete(false);
    };

    if (!questions || questions.length === 0) {
        return (
            <div className={styles.empty}>
                <p>No questions available. Please try again.</p>
            </div>
        );
    }

    if (isComplete) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className={styles.result}>
                <div className={styles.resultIcon}>
                    <Award size={48} color="#4318FF" />
                </div>
                <h3 className={styles.resultTitle}>Quiz Complete!</h3>
                <p className={styles.resultScore}>
                    You scored {score} out of {questions.length} ({percentage}%)
                </p>
                <Button variant="primary" onClick={handleRetry}>
                    Try Again
                </Button>
            </div>
        );
    }

    const getOptionClass = (option: string) => {
        if (!showResult) return styles.option;
        if (option === question.correctAnswer) return `${styles.option} ${styles.correct}`;
        if (option === selectedAnswer && option !== question.correctAnswer) {
            return `${styles.option} ${styles.incorrect}`;
        }
        return styles.option;
    };

    return (
        <div className={styles.container}>
            <div className={styles.progress}>
                <span className={styles.progressText}>
                    Question {currentIndex + 1} of {questions.length}
                </span>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </div>

            <h3 className={styles.question}>{question.question}</h3>

            <div className={styles.options}>
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        className={getOptionClass(option)}
                        onClick={() => handleSelectOption(option)}
                        disabled={showResult}
                    >
                        <span className={styles.optionLetter}>{String.fromCharCode(65 + idx)}.</span>
                        <span className={styles.optionText}>{option}</span>
                        {showResult && option === question.correctAnswer && (
                            <Check size={18} className={styles.checkIcon} />
                        )}
                        {showResult && option === selectedAnswer && option !== question.correctAnswer && (
                            <X size={18} className={styles.crossIcon} />
                        )}
                    </button>
                ))}
            </div>

            {showResult && (
                <div className={styles.explanation}>
                    <strong>Explanation:</strong> {question.explanation}
                </div>
            )}

            {showResult && (
                <Button
                    variant="primary"
                    onClick={handleNext}
                    className={styles.nextBtn}
                >
                    {isLastQuestion ? 'See Results' : 'Next Question'}
                    <ChevronRight size={18} />
                </Button>
            )}
        </div>
    );
};
