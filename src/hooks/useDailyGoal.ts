import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot, runTransaction, collection, addDoc } from 'firebase/firestore';
import { getLocalDateString } from '../lib/utils';
import type { DailyGoal, StreakData, GoalHistory } from '../types';

function getTodayDate(): string {
  return getLocalDateString();
}

function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

const STREAK_MILESTONES = [7, 14, 21, 30, 60, 100];

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

export function useDailyGoal(userId: string | null, todayJobCount: number, onStreakUpdate?: (streak: StreakData, isBroken: boolean) => void, onMilestone?: (streak: number) => void): DailyGoalState & DailyGoalActions {
  const [dailyGoal, setDailyGoalState] = useState<DailyGoal | null>(null);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [todayDate, setTodayDate] = useState(getTodayDate());

  const todayApplications = todayJobCount;

  // Day change detection
  useEffect(() => {
    const interval = setInterval(() => {
      const current = getTodayDate();
      if (current !== todayDate) {
        setTodayDate(current);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [todayDate]);

  // Real-time subscription for daily goal and streak
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setDailyGoalState(null);
      return;
    }

    setLoading(true);

    // Subscribe to daily goal
    const unsubscribeGoal = onSnapshot(
      doc(db, 'users', userId, 'goals', todayDate),
      (snapshot) => {
        if (snapshot.exists()) {
          setDailyGoalState(snapshot.data() as DailyGoal);
        } else {
          setDailyGoalState(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to daily goal:', error);
        setLoading(false);
      }
    );

    // Subscribe to streak data
    const unsubscribeStreak = onSnapshot(
      doc(db, 'users', userId, 'stats', 'streak'),
      (snapshot) => {
        if (snapshot.exists()) {
          setStreakData(snapshot.data() as StreakData);
        }
      },
      (error) => {
        console.error('Error listening to streak data:', error);
      }
    );

    return () => {
      unsubscribeGoal();
      unsubscribeStreak();
    };
  }, [userId, todayDate]);

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

    // Update in Firestore - onSnapshot will update the local state
    try {
      await setDoc(doc(db, 'users', userId, 'goals', todayDate), goal);

      // Check if goal is completed and update streak + save history
      if (todayApplications >= target) {
        await updateStreak(userId, todayDate, streakData);
        // Save to history
        const historyRef = collection(db, 'users', userId, 'goalHistory');
        const historyEntry: Omit<GoalHistory, 'id'> = {
          userId,
          date: todayDate,
          targetApplications: target,
          actualApplications: todayApplications,
          completed: true,
          streakAtCompletion: streakData.currentStreak + 1,
        };
        await addDoc(historyRef, historyEntry);
      }
    } catch (error) {
      console.error('Failed to save daily goal to Firestore:', error);
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

    const goalRef = doc(db, 'users', userId, 'goals', todayDate);
    const streakRef = doc(db, 'users', userId, 'stats', 'streak');

    try {
      await runTransaction(db, async (transaction) => {
        const goalDoc = await transaction.get(goalRef);
        const streakDoc = await transaction.get(streakRef);

        if (!goalDoc.exists() || !streakDoc.exists()) return;

        const currentGoal = goalDoc.data() as DailyGoal;
        const currentStreak = streakDoc.data() as StreakData;

        const newCount = currentGoal.currentApplications + 1;
        const isCompleted = newCount >= currentGoal.targetApplications;

        transaction.update(goalRef, {
          currentApplications: newCount,
          completed: isCompleted,
        });

        if (isCompleted && !currentGoal.completed) {
          const lastDate = currentStreak.lastCompletedDate;
          let newStreak = currentStreak.currentStreak;
          let newLongest = currentStreak.longestStreak;

          if (lastDate !== todayDate) {
            if (lastDate === getYesterdayDate()) {
              newStreak = currentStreak.currentStreak + 1;
            } else {
              newStreak = 1;
            }
            if (newStreak > newLongest) {
              newLongest = newStreak;
            }
            transaction.set(streakRef, {
              currentStreak: newStreak,
              longestStreak: newLongest,
              lastCompletedDate: todayDate,
            });
            
            // Save to history
            const historyRef = collection(db, 'users', userId, 'goalHistory');
            const historyEntry = {
              userId,
              date: todayDate,
              targetApplications: currentGoal.targetApplications,
              actualApplications: newCount,
              completed: true,
              streakAtCompletion: newStreak,
            };
            transaction.set(doc(historyRef), historyEntry);
            
            if (onMilestone && STREAK_MILESTONES.includes(newStreak)) {
              onMilestone(newStreak);
            }
          }
        }
      });

      setDailyGoalState(prev => prev ? {
        ...prev,
        currentApplications: prev.currentApplications + 1,
        completed: prev.currentApplications + 1 >= prev.targetApplications,
      } : null);

      await onSnapshot(goalRef, (snapshot) => {
        if (snapshot.exists()) {
          setDailyGoalState(snapshot.data() as DailyGoal);
        }
      });
    } catch (error) {
      console.error('Failed to increment applications:', error);
    }
  }, [userId, dailyGoal, todayDate, onMilestone]);

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
      const previousStreak = streakData.currentStreak;
      const brokenStreak: StreakData = {
        ...streakData,
        currentStreak: 0,
      };
      setStreakData(brokenStreak);
      setDoc(doc(db, 'users', userId, 'stats', 'streak'), brokenStreak);
      if (onStreakUpdate && previousStreak > 0) {
        onStreakUpdate(brokenStreak, true);
      }
    }
  }, [userId, streakData.lastCompletedDate, todayDate, onStreakUpdate]);

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
