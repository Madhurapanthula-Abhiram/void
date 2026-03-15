import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function DecryptedText({
    text,
    speed = 50,
    maxIterations = 10,
    sequential = false,
    revealDirection = 'start',
    useOriginalCharsOnly = false,
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
    className = '',
    parentClassName = '',
    encryptedClassName = '',
    animateOn = 'hover',
    revealOnLoad = true,
    ...props
}) {
    const [displayText, setDisplayText] = useState(text);
    const [isAnimating, setIsAnimating] = useState(false);
    const [revealedIndices, setRevealedIndices] = useState(new Set());
    const [isDecrypted, setIsDecrypted] = useState(false);

    const containerRef = useRef(null);

    const availableChars = useMemo(() => {
        return useOriginalCharsOnly
            ? Array.from(new Set(text.split(''))).filter(char => char !== ' ')
            : characters.split('');
    }, [useOriginalCharsOnly, text, characters]);

    const shuffleText = useCallback(
        (originalText, currentRevealed) => {
            return originalText
                .split('')
                .map((char, i) => {
                    if (char === ' ') return ' ';
                    if (currentRevealed.has(i)) return originalText[i];
                    return availableChars[Math.floor(Math.random() * availableChars.length)];
                })
                .join('');
        },
        [availableChars]
    );

    const getNextIndex = useCallback((revealedSet) => {
        const textLength = text.length;
        switch (revealDirection) {
            case 'start': return revealedSet.size;
            case 'end': return textLength - 1 - revealedSet.size;
            case 'center': {
                const middle = Math.floor(textLength / 2);
                const offset = Math.floor(revealedSet.size / 2);
                const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
                if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) return nextIndex;
                for (let i = 0; i < textLength; i++) { if (!revealedSet.has(i)) return i; }
                return 0;
            }
            default: return revealedSet.size;
        }
    }, [text.length, revealDirection]);

    const triggerDecrypt = useCallback(() => {
        setRevealedIndices(new Set());
        setIsDecrypted(false);
        setIsAnimating(true);
    }, []);

    useEffect(() => {
        if (revealOnLoad) {
            triggerDecrypt();
        }
    }, [revealOnLoad, triggerDecrypt]);

    useEffect(() => {
        if (!isAnimating) return;

        let interval;
        let currentIteration = 0;

        interval = setInterval(() => {
            setRevealedIndices(prevRevealed => {
                if (sequential) {
                    if (prevRevealed.size < text.length) {
                        const nextIndex = getNextIndex(prevRevealed);
                        const newRevealed = new Set(prevRevealed);
                        newRevealed.add(nextIndex);
                        setDisplayText(shuffleText(text, newRevealed));
                        return newRevealed;
                    } else {
                        clearInterval(interval);
                        setIsAnimating(false);
                        setIsDecrypted(true);
                        return prevRevealed;
                    }
                } else {
                    setDisplayText(shuffleText(text, prevRevealed));
                    currentIteration++;
                    if (currentIteration >= maxIterations) {
                        clearInterval(interval);
                        setIsAnimating(false);
                        setDisplayText(text);
                        setIsDecrypted(true);
                    }
                    return prevRevealed;
                }
            });
        }, speed);
        return () => clearInterval(interval);
    }, [isAnimating, text, speed, maxIterations, sequential, shuffleText, getNextIndex]);

    const handleMouseEnter = () => {
        if (animateOn === 'hover' && !isAnimating) {
            triggerDecrypt();
        }
    };

    return (
        <motion.span
            ref={containerRef}
            className={`inline-block whitespace-pre-wrap ${parentClassName}`}
            onMouseEnter={handleMouseEnter}
            {...props}
        >
            <span className="sr-only">{text}</span>
            <span aria-hidden="true">
                {displayText.split('').map((char, index) => {
                    const isRevealedOrDone = revealedIndices.has(index) || (!isAnimating && isDecrypted);
                    return (
                        <span key={index} className={isRevealedOrDone ? className : encryptedClassName}>
                            {char}
                        </span>
                    );
                })}
            </span>
        </motion.span>
    );
}
