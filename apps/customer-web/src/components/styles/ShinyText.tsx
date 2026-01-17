// ShinyText.tsx
import React from 'react';

interface ShinyTextProps {
  text: string;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  direction?: 'left' | 'right';
  yoyo?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  speed = 2,
  delay = 0,
  color = '#000000',
  shineColor = '#ffffff',
  spread = 120, // Controls how wide the shine gradient is
  direction = 'left',
  yoyo = false,
  pauseOnHover = false,
  className = '',
}) => {
  // We use a CSS gradient with background-clip: text to achieve the shine.
  // The background size is larger than the text (200%) so we can animate it moving.
  
  const gradient = `linear-gradient(
    ${direction === 'left' ? '120deg' : '-120deg'},
    ${color} 0%,
    ${color} ${50 - spread / 10}%,
    ${shineColor} 50%,
    ${color} ${50 + spread / 10}%,
    ${color} 100%
  )`;

  return (
    <div
      className={className}
      style={{
        display: 'inline-block',
        backgroundImage: gradient,
        backgroundSize: '200% auto',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent', // Text must be transparent to show background
        animation: `shine ${speed}s linear ${yoyo ? 'alternate' : 'infinite'}`,
        animationDelay: `${delay}s`,
        animationPlayState: pauseOnHover ? 'paused' : 'running',
      }}
    >
      {text}
      
      {/* Define the keyframes locally so you don't need global CSS */}
      <style jsx>{`
        @keyframes shine {
          0% { background-position: ${direction === 'left' ? '100%' : '-100%'} 0; }
          100% { background-position: ${direction === 'left' ? '-100%' : '100%'} 0; }
        }
        /* Handle hover pause if requested */
        div:hover {
          animation-play-state: ${pauseOnHover ? 'paused' : 'running'};
        }
      `}</style>
    </div>
  );
};

export default ShinyText;