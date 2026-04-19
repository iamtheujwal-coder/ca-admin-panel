import { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'monogram' | 'reveal' | 'transition'>('monogram');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('reveal'), 1800);
    const timer2 = setTimeout(() => setPhase('transition'), 3200);
    const timer3 = setTimeout(onComplete, 3900);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`splash ${phase === 'transition' ? 'splash--exit' : ''}`}>
      {/* Ambient particles */}
      <div className="splash__particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="splash__particle" style={{
            '--delay': `${i * 0.4}s`,
            '--x': `${20 + Math.random() * 60}%`,
            '--y': `${20 + Math.random() * 60}%`,
          } as React.CSSProperties} />
        ))}
      </div>

      {/* Monogram */}
      <div className={`splash__monogram ${phase !== 'monogram' ? 'splash__monogram--shrink' : ''}`}>
        <svg viewBox="0 0 200 200" className="splash__svg" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer glow ring */}
          <circle cx="100" cy="100" r="90" stroke="url(#goldGrad)" strokeWidth="0.5" className="splash__ring" opacity="0.3" />
          
          {/* Letters "A" */}
          <path
            d="M 60 140 L 100 50 L 140 140 M 75 110 L 125 110"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="splash__letter splash__letter--a"
          />
          
          {/* Letter "T" */}
          <path
            d="M 70 55 L 130 55 M 100 55 L 100 145"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="splash__letter splash__letter--t"
          />

          {/* Decorative accent lines */}
          <line x1="50" y1="160" x2="150" y2="160" stroke="url(#goldGrad)" strokeWidth="1" className="splash__accent-line" opacity="0.4" />

          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4a853" />
              <stop offset="50%" stopColor="#e8c97a" />
              <stop offset="100%" stopColor="#c0a060" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Text Reveal */}
      <div className={`splash__text ${phase === 'reveal' || phase === 'transition' ? 'splash__text--visible' : ''}`}>
        <span className="splash__prefix">Chartered Accountant</span>
        <h1 className="splash__name">
          <span className="splash__name-first">ANAND</span>
          <span className="splash__name-last">THAKUR</span>
        </h1>
        <div className="splash__tagline">
          <span className="splash__tagline-line" />
          <span className="splash__tagline-text">Practice Management Portal</span>
          <span className="splash__tagline-line" />
        </div>
      </div>
    </div>
  );
}
