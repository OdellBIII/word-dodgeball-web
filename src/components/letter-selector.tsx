"use client";
import React, { useState, forwardRef, useImperativeHandle } from 'react';

interface LetterSelectorProps {
    startLetter: string;
    onLetterChange: (newLetter: string) => void;
}

export interface LetterSelectorHandle {
    getLetter: () => string;
}

const LetterSelector = forwardRef<LetterSelectorHandle, LetterSelectorProps>(({ startLetter, onLetterChange }, ref) => {
    const [letter, setLetter] = useState(startLetter);

    useImperativeHandle(ref, () => ({
        getLetter: () => letter
    }));

    const cycleUp = () => {
        setLetter(prevLetter => {
            const newLetter = prevLetter === 'Z' ? 'A' : String.fromCharCode(prevLetter.charCodeAt(0) + 1);
            onLetterChange(newLetter);
            return newLetter;
        });
    };

    const cycleDown = () => {
        setLetter(prevLetter => {
            const newLetter = prevLetter === 'A' ? 'Z' : String.fromCharCode(prevLetter.charCodeAt(0) - 1);
            onLetterChange(newLetter);
            return newLetter;
        });
    };

    return (
        <div>
            <button onClick={cycleUp}>^</button>
            <h2>{letter}</h2>
            <button onClick={cycleDown}>v</button>
        </div>
    );
});

export default LetterSelector;