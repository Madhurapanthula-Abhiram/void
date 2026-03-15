import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Plus, X, User, History, LogIn, LogOut } from 'lucide-react';

export default function FloatingDock({ items, isLoggedIn }) {
    const [isOpen, setIsOpen] = useState(false);
    const mouseX = useMotionValue(Infinity);

    return (
        <div className="fixed bottom-8 right-8 flex flex-col items-end gap-4 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        onMouseMove={(e) => mouseX.set(e.pageX)}
                        onMouseLeave={() => mouseX.set(Infinity)}
                        className="flex items-end gap-3 px-4 py-3 bg-black/80 border border-white/20 rounded-2xl backdrop-blur-xl mb-2"
                        style={{ height: '70px' }}
                    >
                        {items.map((item, i) => (
                            <DockItem key={i} mouseX={mouseX} {...item} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-transform z-[101]"
            >
                {isOpen ? <X size={24} /> : <Plus size={24} />}
            </button>
        </div>
    );
}

function DockItem({ mouseX, icon, label, onClick }) {
    const ref = useRef(null);
    const distance = 150;
    const magnification = 60;

    const distanceCalc = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distanceCalc, [-distance, 0, distance], [40, magnification, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            style={{ width }}
            className="group relative aspect-square cursor-pointer flex items-center justify-center rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors"
        >
            <div className="text-white scale-110">{icon}</div>
            <span className="absolute -top-12 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-white text-black text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-tighter whitespace-nowrap">
                {label}
            </span>
        </motion.div>
    );
}
