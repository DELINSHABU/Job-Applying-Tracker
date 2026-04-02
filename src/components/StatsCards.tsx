import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { useCountUp } from '../hooks/useCountUp';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';
import type { JobStats } from '../types';

interface StatsCardsProps {
  stats: JobStats;
}

interface StatCardProps {
  icon: string;
  iconColor: string;
  value: number;
  label: string;
  delay?: number;
}

function StatCard({ icon, iconColor, value, label, delay = 0 }: StatCardProps) {
  const displayValue = useCountUp(value, { delay });
  
  return (
    <motion.div variants={staggerItemVariants}>
      <Card className="min-w-[140px] bg-white dark:bg-card-bg rounded-2xl border-slate-200 dark:border-card-border flex-shrink-0">
        <CardContent className="p-4">
          <span className={`material-icons-round mb-2 ${iconColor}`}>{icon}</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-off-white">{displayValue}</div>
          <div className="text-xs text-slate-500 dark:text-light-grey">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <motion.div 
      className="flex gap-4 overflow-x-auto pb-2 px-5"
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
    >
      <StatCard 
        icon="send" 
        iconColor="text-primary" 
        value={stats.total} 
        label="Total Applied"
        delay={0}
      />
      <StatCard 
        icon="hourglass_empty" 
        iconColor="text-amber-500" 
        value={stats.pending} 
        label="Pending"
        delay={0.1}
      />
      <StatCard 
        icon="chat_bubble_outline" 
        iconColor="text-emerald-500" 
        value={stats.interviewing + stats.callback} 
        label="Interviews"
        delay={0.2}
      />
      <StatCard 
        icon="cancel" 
        iconColor="text-rose-500" 
        value={stats.rejected} 
        label="Rejected"
        delay={0.3}
      />
    </motion.div>
  );
}
