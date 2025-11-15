"use client";

import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import confetti from 'canvas-confetti';

type ConfettiType = 'celebration' | 'level-up' | 'achievement' | 'perfect-solve' | 'streak';

interface ConfettiContextType {
  triggerConfetti: (type?: ConfettiType) => void;
  celebrate: () => void;
  levelUp: () => void;
  achievement: () => void;
  perfectSolve: () => void;
  streak: () => void;
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined);

export const ConfettiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  // Basic celebration confetti
  const celebrate = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  // Level up confetti - shoots from bottom
  const levelUp = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9370DB']
    };

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }, 250);
  }, []);

  // Achievement unlock - stars burst
  const achievement = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      zIndex: 9999,
      colors: ['#FFD700', '#FFED4E', '#FFF200', '#FFB347']
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star'],
      });

      confetti({
        ...defaults,
        particleCount: 20,
        scalar: 0.75,
        shapes: ['circle'],
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }, []);

  // Perfect solve - elegant side cannons
  const perfectSolve = useCallback(() => {
    const end = Date.now() + 2000;
    const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        zIndex: 9999,
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        zIndex: 9999,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  // Streak celebration - fireworks
  const streak = useCallback(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      confetti({
        particleCount: 100,
        startVelocity: 50,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.5
        },
        zIndex: 9999,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      });
    }, 400);
  }, []);

  // Generic trigger based on type
  const triggerConfetti = useCallback((type: ConfettiType = 'celebration') => {
    switch (type) {
      case 'level-up':
        levelUp();
        break;
      case 'achievement':
        achievement();
        break;
      case 'perfect-solve':
        perfectSolve();
        break;
      case 'streak':
        streak();
        break;
      case 'celebration':
      default:
        celebrate();
        break;
    }
  }, [celebrate, levelUp, achievement, perfectSolve, streak]);

  return (
    <ConfettiContext.Provider 
      value={{ 
        triggerConfetti, 
        celebrate, 
        levelUp, 
        achievement, 
        perfectSolve, 
        streak 
      }}
    >
      {children}
    </ConfettiContext.Provider>
  );
};

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (context === undefined) {
    throw new Error('useConfetti must be used within a ConfettiProvider');
  }
  return context;
};