// store/useGuestStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GuestLessonProgress {
  lessonId: string;
  timeSpent: number; // in seconds
  score?: number;
}

interface GuestState {
  xp: number;
  llamacoinBalance: number;
  streak: number;
  totalTimeSpent: number;
  currentCourseId: string | null;
  currentLessonId: string | null;
  completedLessons: GuestLessonProgress[];
  
  // Actions to update metrics during learning modules
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  updateTracking: (courseId: string, lessonId: string, seconds: number) => void;
  completeLesson: (lessonId: string, timeSpent: number, score?: number) => void;
  clearStore: () => void;
}

export const useGuestStore = create<GuestState>()(
  persist(
    (set) => ({
      xp: 0,
      llamacoinBalance: 0,
      streak: 0,
      totalTimeSpent: 0,
      currentCourseId: null,
      currentLessonId: null,
      completedLessons: [],

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      
      addCoins: (amount) => set((state) => ({ llamacoinBalance: state.llamacoinBalance + amount })),

      updateTracking: (courseId, lessonId, seconds) => set((state) => ({
        currentCourseId: courseId,
        currentLessonId: lessonId,
        totalTimeSpent: state.totalTimeSpent + seconds,
      })),

      completeLesson: (lessonId, timeSpent, score) => set((state) => {
        const isAlreadyCompleted = state.completedLessons.some((l) => l.lessonId === lessonId);
        const updatedLessons = isAlreadyCompleted 
          ? state.completedLessons.map((l) => l.lessonId === lessonId ? { ...l, timeSpent: l.timeSpent + timeSpent, score } : l)
          : [...state.completedLessons, { lessonId, timeSpent, score }];

        return {
          completedLessons: updatedLessons,
          totalTimeSpent: state.totalTimeSpent + timeSpent,
        };
      }),

      clearStore: () => set({
        xp: 0,
        llamacoinBalance: 0,
        streak: 0,
        totalTimeSpent: 0,
        currentCourseId: null,
        currentLessonId: null,
        completedLessons: [],
      }),
    }),
    {
      name: "finlamma-guest-cache", // Key used in localStorage
    }
  )
);