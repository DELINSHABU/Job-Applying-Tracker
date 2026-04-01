import { motion } from 'motion/react';
import { Card, CardContent } from './ui/card';
import { useCountUp } from '../hooks/useCountUp';
import { staggerContainerVariants, staggerItemVariants } from '../lib/animations';
import type { JobStats } from '../types';

interface DesktopStatsCardsProps {
  stats: JobStats;
}

interface StatCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
  delay?: number;
  trend?: {
    type: 'up' | 'down' | 'neutral';
    text: string;
  };
}

function StatCard({ icon, iconBg, iconColor, value, label, delay = 0, trend }: StatCardProps) {
  const displayValue = useCountUp(value, { delay });
  
  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-rose-500',
    neutral: 'text-slate-400 dark:text-light-grey',
  };

  const trendIcons = {
    up: 'trending_up',
    down: 'trending_down',
    neutral: 'remove',
  };

  return (
    <motion.div variants={staggerItemVariants}>
      <Card className="bg-white/50 dark:bg-card-bg/50 backdrop-blur-sm rounded-3xl border-slate-200 dark:border-card-border hover:shadow-lg transition-shadow duration-200">
        <CardContent className="p-6">
          <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center mb-4`}>
            <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
          </div>
          <p className="text-slate-500 dark:text-light-grey text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900 dark:text-off-white">{displayValue}</h3>
          {trend && (
            <div className={`flex items-center gap-1 ${trendColors[trend.type]} text-xs font-bold mt-2`}>
              <span className="material-symbols-outlined text-sm">{trendIcons[trend.type]}</span>
              {trend.text}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function DesktopStatsCards({ stats }: DesktopStatsCardsProps) {
  return (
    <motion.div 
      className="grid grid-cols-4 gap-6"
      variants={staggerContainerVariants}
      initial="initial"
      animate="animate"
    >
      <StatCard
        icon="send"
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
        value={stats.total}
        label="Total Applied"
        delay={0}
        trend={{ type: 'up', text: '+12% vs last month' }}
      />
      <StatCard
        icon="hourglass_empty"
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-600 dark:text-amber-400"
        value={stats.pending}
        label="Pending"
        delay={0.1}
        trend={{ type: 'neutral', text: 'Awaiting response' }}
      />
      <StatCard
        icon="chat_bubble"
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        value={stats.interviewing + stats.callback}
        label="Interviews"
        delay={0.2}
        trend={{ type: 'up', text: `${stats.interviewing + stats.callback} active` }}
      />
      <StatCard
        icon="cancel"
        iconBg="bg-rose-100 dark:bg-rose-900/30"
        iconColor="text-rose-600 dark:text-rose-400"
        value={stats.rejected}
        label="Rejected"
        delay={0.3}
        trend={stats.rejected > 0 ? { type: 'down', text: 'Keep going!' } : { type: 'up', text: 'None yet!' }}
      />
    </motion.div>
  );
}
