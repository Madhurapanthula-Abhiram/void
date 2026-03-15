import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import './DotGrid.css';

function hexToRgb(hex) {
    const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 0, g: 0, b: 0 };
    return {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16)
    };
}

const DotGrid = ({
    dotSize = 1.5,
    gap = 25,
    baseColor = 'rgba(255, 255, 255, 0.1)',
    activeColor = '#FFFFFF',
    proximity = 100,
    resistance = 0.95,
    returnDuration = 0.1,
    className = '',
    style = {}
}) => {
    const wrapperRef = useRef(null);
    const canvasRef = useRef(null);
    const dotsRef = useRef([]);
    const pointerRef = useRef({ x: -1000, y: -1000, lastX: 0, lastY: 0 });
    const rafRef = useRef(null);

    const baseRgb = useMemo(() => {
        if (baseColor.startsWith('rgba')) return baseColor;
        const rgb = hexToRgb(baseColor);
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    }, [baseColor]);

    const activeRgb = useMemo(() => {
        const rgb = hexToRgb(activeColor);
        return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    }, [activeColor]);

    const buildGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use documentElement dimensions for zoom-robust sizing
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Keep gap consistent — don't scale with zoom
        const cols = Math.max(1, Math.floor(width / (dotSize + gap)) + 1);
        const rows = Math.max(1, Math.floor(height / (dotSize + gap)) + 1);

        // Cap at 10000 dots for performance
        const totalDots = cols * rows;
        const skip = totalDots > 10000 ? Math.ceil(totalDots / 10000) : 1;

        const startX = (width - (cols - 1) * (dotSize + gap)) / 2;
        const startY = (height - (rows - 1) * (dotSize + gap)) / 2;

        const dots = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (skip > 1 && (y * cols + x) % skip !== 0) continue;
                const posX = startX + x * (dotSize + gap);
                const posY = startY + y * (dotSize + gap);
                dots.push({
                    x: posX,
                    y: posY,
                    origX: posX,
                    origY: posY,
                    vx: 0,
                    vy: 0
                });
            }
        }
        dotsRef.current = dots;
    }, [dotSize, gap]);

    // Rebuild on resize, zoom, and orientation change
    useEffect(() => {
        buildGrid();

        const onResize = () => buildGrid();
        window.addEventListener('resize', onResize);

        // Also rebuild on visualViewport resize (handles pinch-zoom)
        const vv = window.visualViewport;
        if (vv) {
            vv.addEventListener('resize', onResize);
            vv.addEventListener('scroll', onResize);
        }

        return () => {
            window.removeEventListener('resize', onResize);
            if (vv) {
                vv.removeEventListener('resize', onResize);
                vv.removeEventListener('scroll', onResize);
            }
        };
    }, [buildGrid]);

    // Track pointer
    useEffect(() => {
        const handleMouseMove = (e) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            pointerRef.current.x = e.clientX - rect.left;
            pointerRef.current.y = e.clientY - rect.top;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);
            ctx.clearRect(0, 0, width, height);

            const pointer = pointerRef.current;
            const proxSq = proximity * proximity;

            dotsRef.current.forEach((dot) => {
                const dx = pointer.x - dot.x;
                const dy = pointer.y - dot.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < proxSq) {
                    const dist = Math.sqrt(distSq);
                    const force = (proximity - dist) / proximity;
                    const angle = Math.atan2(dy, dx);
                    dot.vx -= Math.cos(angle) * force * 0.5;
                    dot.vy -= Math.sin(angle) * force * 0.5;
                }

                const rx = dot.origX - dot.x;
                const ry = dot.origY - dot.y;
                dot.vx += rx * returnDuration;
                dot.vy += ry * returnDuration;
                dot.vx *= resistance;
                dot.vy *= resistance;
                dot.x += dot.vx;
                dot.y += dot.vy;

                const opacity = distSq < proxSq
                    ? 0.3 + (0.7 * (1 - Math.sqrt(distSq) / proximity))
                    : 0.12;
                const color = distSq < proxSq
                    ? `rgba(${activeRgb}, ${opacity})`
                    : (baseColor.startsWith('rgba') ? baseColor : `rgba(${baseRgb}, 0.12)`);

                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 1.1, 0, Math.PI * 2);
                ctx.fill();
            });

            rafRef.current = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [proximity, returnDuration, resistance, dotSize, activeRgb, baseRgb, baseColor]);

    return (
        <div ref={wrapperRef} className={`dot-grid-container ${className}`} style={style}>
            <canvas ref={canvasRef} className="dot-grid-canvas" />
        </div>
    );
};

export default DotGrid;
