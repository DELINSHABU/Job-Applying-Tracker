import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import type { DailyGoal, StreakData } from '../types';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0] ?? '';
}

interface DailyGoalState {
  dailyGoal: DailyGoal | null;
  streakData: StreakData;
  loading: boolean;
  todayApplications: number;
}

interface DailyGoalActions {
  setDailyGoal: (target: number) => Promise<void>;
  incrementTodayApplications: () => Promise<void>;
  resetDailyProgress: () => void;
}

export function useDailyGoal(userId: string | null, todayJobCount: number): DailyGoalState & DailyGoalActions {
  const [dailyGoal, setDailyGoalState] = useState<DailyGoal | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
  });
  const [loading, setLoading] = useState(true);

  const todayDate = getTodayDate();
  const todayApplications = todayJobCount;

  const loadDailyGoal = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load daily goal
      const goalDoc = await getDoc(doc(db, 'users', userId, 'goals', todayDate));
      if (goalDoc.exists()) {
        setDailyGoalState(goalDoc.data() as DailyGoal);
      } else {
        setDailyGoalState(null);
      }

      // Load streak data
      const streakDoc = await getDoc(doc(db, 'users', userId, 'stats', 'streak'));
      if (streakDoc.exists()) {
        setStreakData(streakDoc.data() as StreakData);
      }
    } catch (err) {
      console.error('Error loading daily goal:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, todayDate]);

  useEffect(() => {
    loadDailyGoal();
  }, [loadDailyGoal]);

  const setDailyGoal = useCallback(async (target: number) => {
    if (!userId) return;

    const goal: DailyGoal = {
      id: todayDate,
      userId,
      targetApplications: target,
      currentApplications: todayApplications,
      date: todayDate,
      completed: todayApplications >= target,
    };

    await setDoc(doc(db, 'users', userId, 'goals', todayDate), goal);
    setDailyGoalState(goal);

    // Check if goal is completed and update streak
    if (todayApplications >= target) {
      await updateStreak(userId, todayDate, streakData);
    }
  }, [userId, todayDate, todayApplications, streakData]);

  const updateStreak = async (userId: string, todayDate: string, currentStreak: StreakData) => {
    const lastDate = currentStreak.lastCompletedDate;
    let newStreak = currentStreak.currentStreak;
    let newLongest = currentStreak.longestStreak;

    if (lastDate === todayDate) {
      // Already completed today
      return;
    } else if (lastDate === getYesterdayDate()) {
      // Completed yesterday, increment streak
      newStreak = currentStreak.currentStreak + 1;
    } else {
      // Streak broken, start new streak
      newStreak = 1;
    }

    if (newStreak > newLongest) {
      newLongest = newStreak;
    }

    const newStreakData: StreakData = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: todayDate,
    };

    await setDoc(doc(db, 'users', userId, 'stats', 'streak'), newStreakData);
    setStreakData(newStreakData);
  };

  const incrementTodayApplications = useCallback(async () => {
    if (!userId || !dailyGoal) return;

    const newCount = dailyGoal.currentApplications + 1;
    const isCompleted = newCount >= dailyGoal.targetApplications;

    const updatedGoal: DailyGoal = {
      ...dailyGoal,
      currentApplications: newCount,
      completed: isCompleted,
    };

    await updateDoc(doc(db, 'users', userId, 'goals', todayDate), {
      currentApplications: newCount,
      completed: isCompleted,
    });
    setDailyGoalState(updatedGoal);

    // Check if goal just got completed
    if (isCompleted && !dailyGoal.completed) {
      await updateStreak(userId, todayDate, streakData);
    }
  }, [userId, dailyGoal, todayDate, streakData]);

  const resetDailyProgress = useCallback(() => {
    if (dailyGoal) {
      setDailyGoalState({
        ...dailyGoal,
        currentApplications: 0,
        completed: false,
      });
    }
  }, [dailyGoal]);

  // Check streak status on load
  useEffect(() => {
    if (!userId || !streakData.lastCompletedDate) return;

    const lastDate = streakData.lastCompletedDate;
    const yesterday = getYesterdayDate();
    
    // If last completed date is before yesterday, streak is broken
    if (lastDate !== todayDate && lastDate !== yesterday) {
      const brokenStreak: StreakData = {
        ...streakData,
        currentStreak: 0,
      };
      setStreakData(brokenStreak);
      setDoc(doc(db, 'users', userId, 'stats', 'streak'), brokenStreak);
    }
  }, [userId, streakData.lastCompletedDate, todayDate]);

  return {
    dailyGoal,
    streakData,
    loading,
    todayApplications,
    setDailyGoal,
    incrementTodayApplications,
    resetDailyProgress,
  };
}
