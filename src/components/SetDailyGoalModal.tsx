import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { StreakData, DailyGoal } from '../types';

interface SetDailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (target: number) => void;
  streakData: StreakData;
  currentGoal: DailyGoal | null;
  currentApplications: number;
}

export function SetDailyGoalModal({
  isOpen,
  onClose,
  onSave,
  streakData,
  currentGoal,
  currentApplications,
}: SetDailyGoalModalProps) {
  const [target, setTarget] = useState(10);

  useEffect(() => {
    if (isOpen) {
      setTarget(currentGoal?.targetApplications ?? 10);
    }
  }, [isOpen, currentGoal]);

  const increment = () => setTarget(prev => Math.min(prev + 1, 20));
  const decrement = () => setTarget(prev => Math.max(prev - 1, 1));

  const handleSave = () => {
    onSave(target);
    onClose();
  };

  const progress = target > 0 ? currentApplications / target : 0;
  const isCompleted = currentApplications >= target;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent hideClose className="max-w-md w-full p-0 overflow-hidden bg-[#0E1525] border border-[#1A2438] rounded-3xl">
        <div className="relative">
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <span className="material-icons-round">close</span>
          </button>

          {/* Blurred Background Overlay */}
          <div 
            className="absolute inset-0 z-0 opacity-30"
            style={{
              backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAW-KW3CKIUW_M7nytwh24wFgyuLnU-0nCz0QAURSu4wDpWSj0T-dkfONbxQvukFY8dV5KActXahJ_Ic_JC_EdVth8Q6jIvpKufAriofNPJwK1OjPha0LXwnQ_ExrhmlzSeZsOpnSm0yUCj1cR3TefRvMoFiFIVgiCsaixuxGQ7_YSGQpSSrnQzv5R1mxMSvGoaK-YfUhQnVjmRO4oqKDWbIJL8TCCet4ShLEtjjCYghO3DypPdJ2zY322S3ozvX1YyEshXTATDGjk)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-[#080C18]/80 backdrop-blur-xl z-0" />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="p-8 pb-4 text-center">
              <div className="inline-flex items-center justify-center mb-4 bg-[#ffb95f]/10 px-4 py-1.5 rounded-full">
                <span className="material-icons-round text-[#ffb95f] mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span className="text-xs uppercase tracking-widest text-[#ffb95f] font-bold">
                  {streakData.currentStreak} Day Streak
                </span>
              </div>
              {streakData.longestStreak > 0 && (
                <div className="inline-flex items-center justify-center mb-4 bg-[#4edea3]/10 px-3 py-1 rounded-full ml-2">
                  <span className="material-icons-round text-[#4edea3] mr-1 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emoji_events
                  </span>
                  <span className="text-xs text-[#4edea3] font-bold">
                    Best: {streakData.longestStreak} days
                  </span>
                </div>
              )}
              <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Set Your Daily Mission
              </h1>
              <p className="text-slate-400 mt-2 text-sm">Consistency is the fuel of successful careers.</p>
            </div>

            {/* Goal Selector */}
            <div className="px-8 py-6">
              <div className="flex items-center justify-between bg-[#171b28] rounded-xl p-6 border border-white/5">
                <button 
                  onClick={decrement}
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#303442] hover:bg-[#353946] transition-colors active:scale-95 duration-200"
                >
                  <span className="material-icons-round text-white">remove</span>
                </button>
                <div className="text-center">
                  <div 
                    className="text-6xl font-bold text-[#d0bcff] tracking-tighter"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {target}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">
                    Applications
                  </div>
                </div>
                <button 
                  onClick={increment}
                  className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#d0bcff]/20 hover:bg-[#d0bcff]/30 transition-colors active:scale-95 duration-200"
                >
                  <span className="material-icons-round text-[#d0bcff]">add</span>
                </button>
              </div>

              {/* Simple Progress Indicator */}
              <div className="mt-6 h-1 w-full bg-[#303442] rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-[#4edea3] to-[#00a572]' : 'bg-[#d0bcff]'}`}
                  style={{ width: `${Math.min(progress * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Platform Breakdown */}
            <div className="px-8 py-4">
              <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-4">
                Current Progress
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${isCompleted ? 'bg-[#d0bcff]/5 border-[#d0bcff]/20' : 'bg-[#303442] border-white/5'}`}>
                  <span className={`material-icons-round text-xl ${isCompleted ? 'text-[#d0bcff]' : 'text-slate-400'}`}>
                    work
                  </span>
                  <span className={`text-[10px] font-bold uppercase ${isCompleted ? 'text-[#d0bcff]' : 'text-slate-400'}`}>
                    {currentApplications}
                  </span>
                  <span className="text-[10px] text-slate-500">Applied</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#303442] border border-white/5">
                  <span className="material-icons-round text-slate-400 text-xl">flag</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {target}
                  </span>
                  <span className="text-[10px] text-slate-500">Goal</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#303442] border border-white/5">
                  <span className="material-icons-round text-slate-400 text-xl">trending_up</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {target - currentApplications}
                  </span>
                  <span className="text-[10px] text-slate-500">Remaining</span>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 flex flex-col gap-3">
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] w-full py-4 rounded-xl font-bold text-[#472a00] shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-200"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Activate Mission
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 text-slate-400 font-semibold text-sm hover:text-white transition-colors"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
