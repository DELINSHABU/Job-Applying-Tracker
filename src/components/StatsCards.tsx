import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { useCountUp } from '../hooks/useCountUp';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';
import type { JobStats } from '../types';

interface StatsCardsProps {
  stats: JobStats;
  suggestedCount?: number;
}

interface StatCardProps {
  icon: string;
  iconColor: string;
  value: number;
  label: string;
  delay?: number;
  isCompact?: boolean;
  className?: string;
}

function StatCard({ icon, iconColor, value, label, delay = 0, isCompact = false, className = "" }: StatCardProps) {
  const displayValue = useCountUp(value, { delay });
  
  return (
    <motion.div variants={staggerItemVariants} className={`w-full ${className}`}>
      <Card className={`bg-white dark:bg-card-bg rounded-2xl border-slate-200 dark:border-card-border ${isCompact ? 'p-0' : ''}`}>
        <CardContent className={`flex items-center gap-2.5 ${isCompact ? 'p-2.5' : 'p-4'}`}>
          <div className={`flex items-center justify-center rounded-lg ${isCompact ? 'w-8 h-8' : 'w-10 h-10'} bg-slate-50 dark:bg-white/5 flex-shrink-0`}>
            <span className={`material-icons-round ${isCompact ? 'text-base' : 'text-xl'} ${iconColor}`}>{icon}</span>
          </div>
          <div className="min-w-0">
            <div className={`${isCompact ? 'text-base' : 'text-xl'} font-bold text-slate-900 dark:text-off-white leading-none`}>{displayValue}</div>
            <div className={`${isCompact ? 'text-[10px]' : 'text-xs'} text-slate-500 dark:text-light-grey truncate font-medium mt-0.5`}>{label}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatsCards({ stats, suggestedCount = 0 }: StatsCardsProps) {
  return (
    <motion.div 
      className="grid grid-cols-2 gap-3 md:flex md:gap-4 md:overflow-x-auto md:pb-2 md:px-5"
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
    >
      <StatCard 
        icon="send" 
        iconColor="text-primary" 
        value={stats.total} 
        label="Applied"
        delay={0}
        isCompact={false}
        className="col-span-1"
      />
      <StatCard 
        icon="hourglass_empty" 
        iconColor="text-amber-500" 
        value={stats.pending} 
        label="Pending"
        delay={0.1}
        isCompact={false}
        className="col-span-1"
      />
      <StatCard 
        icon="chat_bubble_outline" 
        iconColor="text-emerald-500" 
        value={stats.interviewing + stats.callback} 
        label="Interviewed"
        delay={0.2}
        isCompact={false}
        className="col-span-1"
      />
      <StatCard 
        icon="cancel" 
        iconColor="text-rose-500" 
        value={stats.rejected} 
        label="Rejected"
        delay={0.3}
        isCompact={false}
        className="col-span-1"
      />
      {suggestedCount > 0 && (
        <StatCard 
          icon="auto_awesome" 
          iconColor="text-purple-500" 
          value={suggestedCount} 
          label="Suggested"
          delay={0.4}
          isCompact={false}
          className="col-span-1"
        />
      )}
    </motion.div>
  );
}
