import { motion } from 'motion/react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-app-bg-light dark:bg-app-bg transition-colors duration-300">
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
          <motion.img 
            src="/lOGO.svg" 
            alt="HireTrackAI Logo" 
            className="w-16 h-16 md:w-20 md:h-20"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>

      {/* Loading Text */}
      <div className="mt-8 flex flex-col items-center">
        <motion.h1 
          className="text-2xl font-bold text-slate-900 dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          HireTrackAI
        </motion.h1>
        
        <div className="mt-4 flex items-center gap-1.5">
          <span className="text-slate-500 dark:text-light-grey text-sm font-medium tracking-wide uppercase">
            Fetching data
          </span>
          <div className="flex gap-1 mt-0.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
