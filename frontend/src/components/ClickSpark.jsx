import { useRef, useEffect, useCallback } from 'react';

export default function ClickSpark({
    sparkColor = '#FFFFFF',
    sparkSize = 10,
    sparkRadius = 15,
    sparkCount = 8,
    duration = 400,
    extraScale = 1.5,
}) {
    const canvasRef = useRef(null);
    const sparksRef = useRef([]);

    const draw = useCallback((now) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        sparksRef.current = sparksRef.current.filter((spark) => {
            const elapsed = now - spark.startTime;
            if (elapsed > duration) return false;

            const progress = elapsed / duration;
            const ease = 1 - Math.pow(1 - progress, 3);
            const distance = spark.radius * ease;
            const opacity = 1 - progress;

            ctx.save();
            ctx.translate(spark.x, spark.y);
            ctx.rotate(spark.angle);

            ctx.beginPath();
            ctx.strokeStyle = sparkColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = opacity;
            ctx.moveTo(distance, 0);
            ctx.lineTo(distance + sparkSize * extraScale * (1 - progress), 0);
            ctx.stroke();
            ctx.restore();

            return true;
        });

        requestAnimationFrame(draw);
    }, [sparkColor, sparkSize, duration, extraScale]);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const handleEvent = (e) => {
            const now = performance.now();
            for (let i = 0; i < sparkCount; i++) {
                const angle = (Math.PI * 2 * i) / sparkCount;
                sparksRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    angle,
                    startTime: now,
                    radius: sparkRadius
                });
            }
        };

        window.addEventListener('mousedown', handleEvent);
        const animationId = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousedown', handleEvent);
            cancelAnimationFrame(animationId);
        };
    }, [sparkCount, sparkRadius, draw]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999,
            }}
        />
    );
}
