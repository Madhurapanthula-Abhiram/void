import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bug,
  Code2,
  Search,
  Zap,
  Terminal,
  RotateCcw,
  FileCheck,
  Users,
  User,
  ArrowRight,
  Plus,
  Mic,
  FileCode,
  ImageIcon,
  History,
  LogIn,
  LogOut,
  Github,
  Twitter,
  ExternalLink
} from 'lucide-react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import DotGrid from './components/DotGrid';
import GsapScramble from './components/ScrambledText';
import ClickSpark from './components/ClickSpark';
import FloatingDock from './components/FloatingDock';
import StaggeredMenu from './components/StaggeredMenu';
import { supabase } from './lib/supabase';


// Clean Shuffle Text component
const ShuffleText = ({ text }) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const runShuffle = (duration = 600) => {
    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        setDisplayText(text.split("").map(() => chars[Math.floor(Math.random() * chars.length)]).join(""));
      } else {
        setDisplayText(text);
        clearInterval(interval);
      }
    }, 40);
  };

  useEffect(() => {
    // Initial entrance: 2 waves of shuffle
    runShuffle(1000);
  }, [text]);

  return (
    <span
      className="shuffle-root"
      onMouseEnter={() => runShuffle(500)}
    >
      {displayText}
    </span>
  );
};

// Circular Text component for the scanning animation
const CircularText = ({ text, speed = 8 }) => {
  const letters = text.split("");
  return (
    <div className="circular-text-wrapper" style={{ animationDuration: `${speed}s` }}>
      {letters.map((char, i) => (
        <span
          key={i}
          style={{
            transform: `rotate(${i * (360 / letters.length)}deg) translateY(-60px)`,
          }}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

// Typewriter component for the live code visualization
const Typewriter = ({ text, delay = 50, onComplete }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return <span>{currentText}</span>;
};

const LiveCodeVisualization = () => {
  const [phase, setPhase] = useState('before'); // 'before', 'scanning', 'after'
  const [step, setStep] = useState(0);
  const [key, setKey] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const statusMessages = [
    "[SYSTEM] NEURAL CORE_ONLINE",
    "[ANALYSIS] IDENTIFYING OPTIMIZATION VECTORS...",
    "[PATCH] APPLYING VECTORIZED PATTERN...",
    "[SUCCESS] REFACTOR COMPLETE: +250% EFFICIENCY"
  ];

  const beforeCode = [
    { line: 1, content: 'def process_stream(data):' },
    { line: 2, content: '    # Inefficient manual loop' },
    { line: 3, content: '    parsed = []' },
    { line: 4, content: '    for x in data:' },
    { line: 5, content: '        if x is not None:' },
    { line: 6, content: '            parsed.append(x.upper())' },
    { line: 7, content: '    return parsed' }
  ];

  const afterCode = [
    { line: 1, content: 'def process_stream(data):' },
    { line: 2, content: '-   # Inefficient manual loop', isRemoved: true },
    { line: 3, content: '-   parsed = []', isRemoved: true },
    { line: 4, content: '-   for x in data:', isRemoved: true },
    { line: 5, content: '-       if x is not None:', isRemoved: true },
    { line: 6, content: '-           parsed.append(x.upper())', isRemoved: true },
    { line: 7, content: '-   return parsed', isRemoved: true },
    { line: 2, content: '+   # [AI] Optimized Vectorized Implementation', isAdded: true, isComment: true },
    { line: 3, content: '+   return map(str.upper, filter(None, data))', isAdded: true, isKeyword: true }
  ];

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setStatusIdx(prev => (prev + 1) % statusMessages.length);
    }, 2000);
    return () => clearInterval(statusInterval);
  }, []);

  useEffect(() => {
    if (phase === 'before' && step >= beforeCode.length) {
      setTimeout(() => setPhase('scanning'), 1000);
    } else if (phase === 'scanning') {
      setTimeout(() => {
        setPhase('after');
        setStep(0);
      }, 2000);
    } else if (phase === 'after' && step >= afterCode.length) {
      setTimeout(() => {
        setPhase('before');
        setStep(0);
        setKey(prev => prev + 1);
      }, 4000);
    }
  }, [step, phase]);

  const currentLines = phase === 'after' ? afterCode : beforeCode;

  return (
    <div className="visualization-container">
      <div className="visualization-header-meta">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="visualization-title"
        >
          <ShuffleText text="DIFF_VISUALIZATION" /><span className="blinking-cursor">_</span>
        </motion.h2>
        <span className="visualization-subtitle">AI CODE EVOLUTION ENGINE</span>
      </div>

      <div className={`editor-window phase-${phase}`} key={key}>
        {phase === 'scanning' && (
          <div className="scanning-overlay">
            <div className="scanning-animation-center">
              <CircularText text="COOKING_THE_CODE_" />
              <div className="scanning-core-dot" />
            </div>
          </div>
        )}

        <div className="editor-header">
          <div className="editor-tabs">
            <div className="editor-tab active">CORE_ENGINE.PY</div>
          </div>
          <div className="live-analysis-indicator">
            <div className="pulsing-white-dot" />
            <span>{phase.toUpperCase()}_PHASE</span>
          </div>
        </div>

        <div className="editor-content">
          {currentLines.slice(0, step + 1).map((line, index) => (
            <div
              className={`code-line ${step === index ? 'active-typing' : ''} ${line.isRemoved ? 'diff-removed' : ''} ${line.isAdded ? 'diff-added' : ''}`}
              key={index}
            >
              <div className="diff-indicator-bar" />
              <span className="line-num">{line.line}</span>
              <span className="code-content">
                {step > index ? (
                  line.isComment ? <span className="syntax-comment">{line.content}</span> :
                    line.isKeyword ? <span className="syntax-keyword">{line.content}</span> :
                      line.content
                ) : (
                  <Typewriter
                    text={line.content}
                    delay={phase === 'after' ? 20 : 35}
                    onComplete={() => setStep(prev => prev + 1)}
                  />
                )}
                {step === index && <span className="cursor-cursor">|</span>}
              </span>
            </div>
          ))}
        </div>

        <div className="system-status-strip">
          <AnimatePresence mode="wait">
            <motion.div
              key={statusIdx + phase}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="status-text"
            >
              {phase === 'scanning' ? "[ANALYSIS] SEARCHING FOR PATTERNS..." : statusMessages[statusIdx]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const features = [
  { icon: <Bug size={24} />, name: 'Bug Fixer', desc: 'Auto-detect and patch vulnerabilities in seconds.' },
  { icon: <Code2 size={24} />, name: 'Code Reviewer', desc: 'AI-driven insights for cleaner, safer code.' },
  { icon: <Search size={24} />, name: 'Explain Code', desc: 'No more confusing functions. Get clear documentation.' },
  { icon: <Zap size={24} />, name: 'Optimizer', desc: 'Reduce complexity and boost execution speed.' },
  { icon: <RotateCcw size={24} />, name: 'Language Converter', desc: 'Seamlessly port code across 20+ languages.' },
  { icon: <FileCheck size={24} />, name: 'Test Generator', desc: 'Unit tests created automatically for every edge case.' },
  { icon: <Users size={24} />, name: 'Interview Mode', desc: 'Train with AI for your next big engineering role.' },
  { icon: <Terminal size={24} />, name: 'Complexity Analyzer', desc: 'Identify bottlenecks before they reach production.' },
];

function App() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [input, setInput] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const codeInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileUpload = (e, type) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log(`Uploaded ${type}:`, Array.from(files).map(f => f.name));
    }
    e.target.value = '';
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
  };

  // Listen for Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsLoggedIn(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Scroll reveal observer
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const dockItems = isLoggedIn
    ? [
      { icon: <User size={20} />, label: 'Profile', onClick: () => navigate('/profile') },
      { icon: <History size={20} />, label: 'History', onClick: () => console.log('History') },
      { icon: <LogOut size={20} />, label: 'Log Out', onClick: handleLogout },
    ]
    : [
      { icon: <LogIn size={20} />, label: 'Log In', onClick: () => navigate('/login') },
      { icon: <User size={20} />, label: 'Sign Up', onClick: () => navigate('/signup') },
    ];

  return (
    <div className="landing-root">
      <div className="noise-overlay" />
      <ClickSpark sparkColor="rgba(255,255,255,0.5)" sparkCount={12} sparkRadius={20} />
      <DotGrid
        dotSize={1}
        gap={30}
        baseColor="rgba(255, 255, 255, 0.12)"
        activeColor="#FFFFFF"
      />
      <div className="radial-glow" />
      <FloatingDock items={dockItems} isLoggedIn={isLoggedIn} />

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <div className="logo">
            <ShuffleText text="void" />
          </div>
          <div className="nav-links">
            <a href="#features" className="nav-link">FEATURES</a>
            <a href="#how-it-works" className="nav-link">PROCESS</a>
            <a href="#testimonials" className="nav-link">COMMUNITY</a>
            {!isLoggedIn ? (
              <button
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            ) : (
              <div className="nav-user-group">
                <StaggeredMenu
                  position="right"
                  items={[
                    { label: 'PROFILE', icon: <User size={14} />, onClick: () => navigate('/profile') },
                    { label: 'HISTORY', icon: <History size={14} />, onClick: () => console.log('History') },
                    { label: 'LOGOUT', icon: <LogOut size={14} />, onClick: handleLogout }
                  ]}
                  socialItems={[
                    { label: 'GITHUB', icon: <Github size={14} />, link: 'https://github.com' }
                  ]}
                  displaySocials={true}
                  displayItemNumbering={false}
                  menuButtonColor="#ffffff"
                  accentColor="#ffffff"
                  logoUrl=""
                  changeMenuColorOnOpen={false}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="hero-badge"
        >
          <Bug size={14} />
          <span>v2.0.4 CORE_ENGINE_ACTIVE</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hero-title"
        >
          ENGINEERING INTELLIGENCE
          <span className="accent">FOR THE NEXT PROTOCOL</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hero-subtitle"
        >
          <GsapScramble
            radius={100}
            duration={1.2}
            speed={0.5}
            scrambleChars=".:"
          >
            An AI-powered engineering platform that unifies{"\n"}debugging, code{"\n"}analysis, optimization, and testing into one intelligent development experience.
          </GsapScramble>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="hero-actions"
        >
          <button className="btn btn-primary interactive">
            GET STARTED <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary interactive">
            DOCUMENTATION
          </button>
        </motion.div>

        {/* GPT Input Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="preview-card"
        >
          <div className="input-container">
            <div className="textarea-wrapper">
              <textarea
                className="textarea-preview interactive"
                placeholder={input ? "" : "Paste your code or describe your issue..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              {!input && (
                <div className="rotating-placeholder">
                  <Typewriter
                    key={Math.floor(Date.now() / 3000)} // Force reset every few seconds
                    text={[
                      "EXPLAIN THIS CODE...",
                      "OPTIMIZE THIS FUNCTION...",
                      "GENERATE UNIT TESTS...",
                      "DEBUG MY CODE...",
                      "REVIEW THIS PR...",
                      "FIX THIS BUG...",
                      "ANALYZE SECURITY..."
                    ][Math.floor((Date.now() / 3000) % 7)]}
                    delay={80}
                  />
                  <span className="blinking-cursor">_</span>
                </div>
              )}
            </div>

            <div className="input-footer">
              <div className="input-actions-left">
                <div className="upload-menu-wrapper">
                  <button className="action-icon-btn" title="Upload options">
                    <Plus size={18} strokeWidth={2} />
                  </button>
                  <div className="upload-menu-dropdown">
                    <button className="upload-menu-item" onClick={() => codeInputRef.current?.click()}>
                      <FileCode size={14} /> UPLOAD_CODE
                    </button>
                    <button className="upload-menu-item" onClick={() => imageInputRef.current?.click()}>
                      <ImageIcon size={14} /> UPLOAD_IMAGE
                    </button>
                  </div>
                  {/* Hidden file inputs */}
                  <input
                    ref={codeInputRef}
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.xml,.yaml,.yml,.go,.rs,.rb,.php,.sql,.sh,.bat,.ps1,.md,.txt"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'code')}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'image')}
                  />
                </div>
                <button className="action-icon-btn" title="Voice input">
                  <Mic size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="input-actions-right">
                <div className="ai-ready-indicator">
                  <div className="pulsing-white-dot" />
                  <span>AI_READY</span>
                </div>
                <button
                  className="pixel-send-btn"
                  disabled={!input}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="features container scroll-reveal">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          <ShuffleText text="CORE_PROTOCOLS" />
        </motion.h2>
        <div className="feature-grid">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -5 }}
              className="feature-card interactive"
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-name mono-font"><ShuffleText text={f.name} /></h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Code Preview Section - Updated to Live Visualization */}
      <motion.section
        id="preview"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="code-preview container"
      >
        <LiveCodeVisualization />
      </motion.section>

      {/* How it Works Section - SYSTEM_PROTOCOL */}
      <section id="how-it-works" className="system-protocol container scroll-reveal">
        <div className="section-header-meta">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="section-title"
          >
            <ShuffleText text="VOID_SYSTEM_PROTOCOL" />
            <span className="blinking-cursor">_</span>
          </motion.h2>
          <p className="system-status-indicator">
            RUNNING SECURE ANALYSIS SEQUENCE...
          </p>
        </div>

        <div className="protocol-timeline">
          <div className="timeline-line" />
          {[
            { num: '01', title: 'INITIALIZE_CORE', desc: 'Securely connect your repository or paste your codebase into the _VOID core.' },
            { num: '02', title: 'ANALYZE_VECTORS', desc: 'Our neural engines scan for bottlenecks, vulnerabilities, and optimization vectors.' },
            { num: '03', title: 'OPTIMIZE_STACK', desc: 'Apply fixes and improvements instantly with a single protocol command.' }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              whileHover={{ scale: 1.02 }}
              className="protocol-step-card interactive"
            >
              <div className="step-badge">[{step.num}]</div>
              <h3 className="step-title"><ShuffleText text={step.title} /></h3>
              <p className="step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials container scroll-reveal">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          <ShuffleText text="COMMUNITY_LOGS" />
          <span className="blinking-cursor">_</span>
        </motion.h2>
        <div className="testimonial-grid">
          {[
            { text: "THE CLEANEST AI INTERFACE I'VE EVER USED. REDEFINED MY WORKFLOW.", author: "USER_0x1", title: "CONTRIBUTOR" },
            { text: "ZERO BLOAT. JUST THE DATA I NEED TO FIX BUGS FASTER.", author: "USER_0x2", title: "CONTRIBUTOR" },
            { text: "FUTURISTIC AND FUNCTIONAL. THE OPTIMIZATION HINTS ARE NEXT-LEVEL.", author: "USER_0x3", title: "CONTRIBUTOR" }
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="testimonial-card"
            >
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar" />
                <div className="author-info">
                  <div className="author-name">{t.author}</div>
                  <div className="author-title">{t.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section container scroll-reveal">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-title"
        >
          <ShuffleText text="READY_TO_TRY_?" />
        </motion.h2>
        <p className="cta-subtext">
          Free. Open source. No account needed.
        </p>
        <div className="cta-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>
            Get Started <ArrowRight size={18} />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            VIEW_SOURCE <Github size={18} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section scroll-reveal">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-left">
              <div className="logo" style={{ fontSize: '20px', marginBottom: '16px' }}>
                <ShuffleText text="void" />
              </div>
              <p className="footer-desc">
                A premium AI-powered workspace for the next generation of software engineering.
              </p>
              <div className="footer-status">
                <span className="footer-status-dot">●</span> EARLY_ACCESS — Work in progress
              </div>
            </div>

            <div className="footer-right">
              <div className="footer-links">
                <a href="#" className="footer-link-item">
                  GITHUB <ExternalLink size={12} />
                </a>
                <a href="#" className="footer-link-item">
                  TWITTER <Twitter size={12} />
                </a>
                <a href="#" className="footer-link-item">
                  DOCS <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>// Built in public. MIT License.</span>
            <span>© 2026 VOID_CORE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
