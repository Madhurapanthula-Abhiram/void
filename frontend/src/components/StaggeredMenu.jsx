import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { User } from 'lucide-react';
import './StaggeredMenu.css';

export const StaggeredMenu = ({
    position = 'right',
    colors = ['#FFFFFF', '#888888', '#000000'],
    items = [],
    className,
    menuButtonColor = '#fff',
    accentColor = '#FFFFFF',
    closeOnClickAway = true,
    onMenuOpen,
    onMenuClose
}) => {
    const [open, setOpen] = useState(false);
    const openRef = useRef(false);
    const panelRef = useRef(null);
    const preLayersRef = useRef(null);
    const preLayerElsRef = useRef([]);
    const iconRef = useRef(null);
    const toggleBtnRef = useRef(null);
    const busyRef = useRef(false);
    const openTlRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const panel = panelRef.current;
            const preContainer = preLayersRef.current;
            const icon = iconRef.current;
            if (!panel || !icon) return;

            let preLayers = [];
            if (preContainer) {
                preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
            }
            preLayerElsRef.current = preLayers;

            const offscreen = position === 'left' ? -100 : 100;
            gsap.set([panel, ...preLayers], { xPercent: offscreen, visibility: 'hidden' });
            if (toggleBtnRef.current) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
        });
        return () => ctx.revert();
    }, [menuButtonColor, position]);

    const buildOpenTimeline = useCallback(() => {
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return null;

        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-item'));
        const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
        const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

        gsap.set([panel, ...layers], { visibility: 'visible' });
        if (itemEls.length) gsap.set(itemEls, { yPercent: 40, opacity: 0 });

        const tl = gsap.timeline({
            paused: true,
            onComplete: () => { busyRef.current = false; }
        });

        layerStates.forEach((ls, i) => {
            tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.4, ease: 'power4.out' }, i * 0.05);
        });

        const panelInsertTime = (layerStates.length ? (layerStates.length - 1) * 0.05 : 0) + 0.05;
        tl.fromTo(panel,
            { xPercent: panelStart },
            { xPercent: 0, duration: 0.5, ease: 'power4.out' },
            panelInsertTime
        );

        if (itemEls.length) {
            tl.to(itemEls, {
                yPercent: 0,
                opacity: 1,
                duration: 0.5,
                ease: 'power3.out',
                stagger: 0.08
            }, panelInsertTime + 0.1);
        }

        return tl;
    }, []);

    const playOpen = useCallback(() => {
        if (busyRef.current) return;
        busyRef.current = true;
        openTlRef.current?.kill();
        const tl = buildOpenTimeline();
        tl?.play(0);
        openTlRef.current = tl;
    }, [buildOpenTimeline]);

    const playClose = useCallback(() => {
        const panel = panelRef.current;
        const layers = preLayerElsRef.current;
        if (!panel) return;

        openTlRef.current?.kill();
        const all = [...layers, panel];
        const offscreen = position === 'left' ? -100 : 100;
        const itemEls = Array.from(panel.querySelectorAll('.sm-panel-item'));

        const tl = gsap.timeline({
            onComplete: () => {
                gsap.set(all, { visibility: 'hidden' });
                busyRef.current = false;
            }
        });

        // Hide item content immediately to prevent "sticking"
        if (itemEls.length) {
            tl.to(itemEls, { opacity: 0, duration: 0.1, ease: 'power2.in' }, 0);
        }

        tl.to(all, {
            xPercent: offscreen,
            duration: 0.3,
            ease: 'power3.in',
            stagger: 0.03,
            overwrite: 'auto'
        }, 0.05);
    }, [position]);

    const toggleMenu = useCallback(() => {
        if (busyRef.current) return;
        const target = !openRef.current;
        openRef.current = target;
        setOpen(target);

        if (target) {
            onMenuOpen?.();
            playOpen();
        } else {
            onMenuClose?.();
            playClose();
        }
    }, [playOpen, playClose, onMenuOpen, onMenuClose]);

    const closeMenu = useCallback(() => {
        if (openRef.current) {
            openRef.current = false;
            setOpen(false);
            onMenuClose?.();
            playClose();
        }
    }, [onMenuClose, playClose]);

    React.useEffect(() => {
        if (!closeOnClickAway || !open) return;
        const handleClickOutside = event => {
            if (panelRef.current && !panelRef.current.contains(event.target) &&
                toggleBtnRef.current && !toggleBtnRef.current.contains(event.target)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [closeOnClickAway, open, closeMenu]);

    return (
        <div className={(className ? className + ' ' : '') + 'staggered-menu-wrapper'} data-position={position}>
            <button
                ref={toggleBtnRef}
                className="sm-toggle mono-font"
                onClick={toggleMenu}
                type="button"
                style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.15em' }}
            >
                MENU
            </button>

            <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
                {colors.map((c, i) => <div key={i} className="sm-prelayer" style={{ background: c }} />)}
            </div>

            <aside ref={panelRef} className="staggered-menu-dropdown">
                <ul className="sm-panel-list">
                    {items.map((it, idx) => (
                        <li key={idx} className="sm-panel-itemWrap">
                            <button
                                className="sm-panel-item mono-font"
                                onClick={() => { it.onClick?.(); closeMenu(); }}
                            >
                                {it.icon && <span className="sm-item-icon">{it.icon}</span>}
                                <span className="sm-panel-itemLabel">{it.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
};

export default StaggeredMenu;
