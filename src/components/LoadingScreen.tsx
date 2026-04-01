import { motion } from 'motion/react';
import { useMemo } from 'react';
import { motivationalQuotes, funnyLoadingMessages } from '../lib/loadingMessages';

export function LoadingScreen() {
  const { quote, funnyMessage } = useMemo(() => {
    const q = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    const f = funnyLoadingMessages[Math.floor(Math.random() * funnyLoadingMessages.length)];
    return { quote: q, funnyMessage: f };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-bg-light dark:bg-app-bg transition-colors duration-300 p-6">
      <div className="relative">
        {/* Animated Background Pulse */}
        <motion.div
          className="absolute inset-0 rounded-3xl bg-primary/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: [0.8, 1.2, 0.8], 
            opacity: [0, 0.5, 0] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Logo Container */}
        <motion.div
          className="relative bg-white dark:bg-card-bg p-6 rounded-3xl shadow-xl shadow-primary/10 border border-slate-100 dark:border-card-border"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <img 
            src="/LOGO-loading.svg" 
            alt="HireTrackAI Logo" 
            className="w-16 h-16 md:w-20 md:h-20"
          />
        </motion.div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center max-w-md text-center">
        <motion.h1 
          className="text-2xl font-bold text-slate-900 dark:text-white mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {quote}
        </motion.h1>
        
        <div className="flex flex-col items-center gap-6">
          <motion.p 
            className="text-slate-500 dark:text-light-grey text-sm italic mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            "{funnyMessage}"
          </motion.p>
          
          {/* Custom Loading.svg Animation */}
          <div className="w-12 h-12 text-primary">
            <svg viewBox="-13 -13 45 45" className="w-full h-full">
              <style>
                {`
                  .dot {
                    transform-origin: 50% 50%;
                    fill: currentColor;
                    animation-duration: 4s;
                    animation-iteration-count: infinite;
                  }
                  
                  .d1 { animation-name: m1; }
                  .d2 { animation-name: m2; }
                  .d3 { animation-name: m3; }
                  .d4 { animation-name: m4; }
                  .d5 { animation-name: m5; }
                  .d6 { animation-name: m6; }
                  .d7 { animation-name: m7; }
                  .d8 { animation-name: m8; }
                  .d9 { animation-name: m9; }

                  @keyframes m1 {
                    9.09%, 90.91% { transform: translate(-12px, 0); }
                    18.18%, 27.27%, 81.82%, 100% { transform: translate(0px, 0px); }
                    36.36%, 72.73% { transform: translate(12px, 0px); }
                    45.45%, 54.55%, 63.64% { transform: translate(12px, 12px); }
                  }
                  @keyframes m2 {
                    9.09%, 27.27%, 100% { transform: translate(0px, 0px); }
                    18.18%, 36.36% { transform: translate(12px, 0px); }
                    45.45%, 54.55%, 63.64%, 72.73% { transform: translate(12px, 12px); }
                    81.82%, 90.91% { transform: translate(0px, 12px); }
                  }
                  @keyframes m3 {
                    9.09%, 18.18%, 36.36%, 45.45%, 54.55%, 63.64%, 72.73% { transform: translate(-12px, 0px); }
                    27.27%, 100% { transform: translate(0px, 0px); }
                    81.82% { transform: translate(-12px, -12px); }
                    90.91% { transform: translate(0px, -12px); }
                  }
                  @keyframes m4 {
                    9.09%, 18.18%, 90.91% { transform: translate(-12px, 0px); }
                    27.27%, 81.82% { transform: translate(-12px, -12px); }
                    36.36%, 54.55%, 63.64%, 72.73% { transform: translate(0px, -12px); }
                    45.45%, 100% { transform: translate(0px, 0px); }
                  }
                  @keyframes m5 {
                    9.09%, 18.18%, 27.27%, 100% { transform: translate(0px, 0px); }
                    36.36%, 45.45%, 54.55%, 63.64%, 72.73% { transform: translate(12px, 0px); }
                    81.82% { transform: translate(12px, -12px); }
                    90.91% { transform: translate(0px, -12px); }
                  }
                  @keyframes m6 {
                    9.09%, 36.36%, 45.45%, 54.55%, 63.64%, 100% { transform: translate(0px, 0px); }
                    18.18%, 27.27%, 90.91% { transform: translate(-12px, 0px); }
                    72.73% { transform: translate(0px, 12px); }
                    81.82% { transform: translate(-12px, 12px); }
                  }
                  @keyframes m7 {
                    9.09%, 18.18%, 27.27%, 90.91% { transform: translate(12px, 0px); }
                    36.36%, 81.82%, 100% { transform: translate(0px, 0px); }
                    45.45%, 63.64%, 72.73% { transform: translate(0px, -12px); }
                    54.55% { transform: translate(12px, -12px); }
                  }
                  @keyframes m8 {
                    9.09%, 100% { transform: translate(0px, 0px); }
                    18.18% { transform: translate(-12px, 0px); }
                    27.27% { transform: translate(-12px, -12px); }
                    36.36%, 45.45%, 54.55%, 63.64%, 72.73% { transform: translate(0px, -12px); }
                    81.82% { transform: translate(12px, -12px); }
                    90.91% { transform: translate(12px, 0px); }
                  }
                  @keyframes m9 {
                    9.09%, 18.18%, 36.36%, 63.64%, 72.73%, 90.91% { transform: translate(-12px, 0px); }
                    27.27%, 45.45%, 54.55%, 100% { transform: translate(0px, 0px); }
                    81.82% { transform: translate(-24px, 0px); }
                  }
                `}
              </style>
              <g>
                <circle className="dot d1" cx="13" cy="1" r="5" />
                <circle className="dot d2" cx="13" cy="1" r="5" />
                <circle className="dot d3" cx="25" cy="25" r="5" />
                <circle className="dot d4" cx="13" cy="13" r="5" />
                <circle className="dot d5" cx="13" cy="13" r="5" />
                <circle className="dot d6" cx="25" cy="13" r="5" />
                <circle className="dot d7" cx="1" cy="25" r="5" />
                <circle className="dot d8" cx="13" cy="25" r="5" />
                <circle className="dot d9" cx="25" cy="25" r="5" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
