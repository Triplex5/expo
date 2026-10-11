import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { BADGES, LEVELS, modules } from '../data';
import { GAME_RULES, nextStreak, todayKey } from '../game/rules';
import type { Lesson, Progress } from '../types';

const STORAGE_KEY = 'quiz-orcamento-mz/progress/v1';

const emptyProgress: Progress = {
  xp: 0,
  hearts: GAME_RULES.maxHearts,
  lastPlayedDay: null,
  streakDays: 0,
  lessonScores: {},
  completedLessons: [],
  unlockedBadges: [],
  totalCorrect: 0,
  totalAnswered: 0,
  examBests: {},
};

export interface LessonResultInput {
  lessonId: string;
  kind: Lesson['kind'] | 'exame';
  xpGained: number;
  ratio: number;
  correct: number;
  total: number;
  /** Respostas certas seguidas com cronómetro activo (para a medalha Blitz). */
  fastStreak?: number;
}

export interface LessonResult {
  xpGained: number;
  newBadges: string[];
  levelUp: string | null;
  ratio: number;
}

interface GameContextValue {
  progress: Progress;
  ready: boolean;
  level: { name: string; glyph: string; index: number; minXp: number; nextXp: number | null; progress: number };
  isLessonDone: (lessonId: string) => boolean;
  bestRatio: (lessonId: string) => number;
  finishLesson: (input: LessonResultInput) => LessonResult;
  loseHeart: () => void;
  refillHearts: () => void;
  resetAll: () => void;
  badgeTier: (badgeId: string) => string | null;
}

const GameContext = createContext<GameContextValue | null>(null);

function computeLevel(xp: number) {
  let current = LEVELS[0];
  for (const candidate of LEVELS) {
    if (xp >= candidate.minXp) current = candidate;
  }
  const next = LEVELS[current.index + 1];
  const span = next ? next.minXp - current.minXp : 1;
  return {
    index: current.index,
    name: current.name,
    glyph: current.glyph,
    minXp: current.minXp,
    nextXp: next ? next.minXp : null,
    progress: next ? Math.min(1, (xp - current.minXp) / span) : 1,
  };
}

function moduleCompleted(progress: Progress, moduleId: string): boolean {
  const module = modules.find((m) => m.id === moduleId);
  if (!module) return false;
  return module.lessons.every((lesson) => progress.completedLessons.includes(lesson.id));
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [ready, setReady] = useState(false);

  // Hidratação do progresso guardado.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Progress = { ...emptyProgress, ...JSON.parse(raw) };
          const today = todayKey();
          const hearts = parsed.lastPlayedDay === today ? parsed.hearts : GAME_RULES.maxHearts;
          const streakDays =
            parsed.lastPlayedDay && parsed.lastPlayedDay !== today
              ? Math.max(parsed.streakDays, 0)
              : parsed.streakDays;
          setProgress({ ...parsed, hearts, streakDays });
        }
      } catch {
        // Em caso de dados corrompidos, começa-se do zero sem bloquear o jogo.
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress)).catch(() => undefined);
  }, [progress, ready]);

  const finishLesson = useCallback(
    (input: LessonResultInput): LessonResult => {
      const today = todayKey();
      const newBadges: string[] = [];
      const passRatio = input.kind === 'exame' ? 0.6 : 0.7;
      const before = computeLevel(progress.xp);

      const completedLessons =
        input.ratio >= passRatio && !progress.completedLessons.includes(input.lessonId)
          ? [...progress.completedLessons, input.lessonId]
          : progress.completedLessons;

      const lessonScores = {
        ...progress.lessonScores,
        [input.lessonId]: Math.max(progress.lessonScores[input.lessonId] ?? 0, input.ratio),
      };

      const examBests =
        input.kind === 'exame'
          ? { ...progress.examBests, [input.lessonId]: Math.max(progress.examBests[input.lessonId] ?? 0, input.ratio) }
          : progress.examBests;

      const streakDays = input.ratio > 0 ? nextStreak(progress.lastPlayedDay, progress.streakDays) : progress.streakDays;

      const nextState: Progress = {
        ...progress,
        xp: progress.xp + Math.max(0, input.xpGained),
        hearts: input.ratio >= 1 ? GAME_RULES.maxHearts : progress.hearts,
        lastPlayedDay: input.ratio > 0 ? today : progress.lastPlayedDay,
        streakDays,
        lessonScores,
        completedLessons,
        examBests,
        totalCorrect: progress.totalCorrect + input.correct,
        totalAnswered: progress.totalAnswered + input.total,
        unlockedBadges: [...progress.unlockedBadges],
      };

      const unlock = (badgeId: string) => {
        if (!nextState.unlockedBadges.includes(badgeId)) {
          nextState.unlockedBadges.push(badgeId);
          newBadges.push(badgeId);
        }
      };

      if (input.ratio >= 1 && input.total >= 5) unlock('b-perfeito');
      if (input.kind === 'teste' && input.ratio >= passRatio) unlock('b-teste');
      if (input.kind === 'exame' && input.ratio >= 0.6) unlock('b-exame');
      if ((input.fastStreak ?? 0) >= 5) unlock('b-blitz');
      if (nextState.streakDays >= 3) unlock('b-streak3');
      for (const module of modules) {
        if (moduleCompleted(nextState, module.id)) unlock(module.badgeId);
      }

      const after = computeLevel(nextState.xp);
      let levelUp: string | null = null;
      if (after.index > before.index) {
        levelUp = after.name;
        if (after.index >= 5) unlock('b-nivel5');
      }

      setProgress(nextState);

      return { xpGained: input.xpGained, newBadges, levelUp, ratio: input.ratio };
    },
    [progress],
  );

  const loseHeart = useCallback(() => {
    setProgress((prev) => ({ ...prev, hearts: Math.max(0, prev.hearts - 1) }));
  }, []);

  const refillHearts = useCallback(() => {
    setProgress((prev) => ({ ...prev, hearts: GAME_RULES.maxHearts }));
  }, []);

  const resetAll = useCallback(() => {
    setProgress({ ...emptyProgress });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      progress,
      ready,
      level: computeLevel(progress.xp),
      isLessonDone: (lessonId: string) => progress.completedLessons.includes(lessonId),
      bestRatio: (lessonId: string) => progress.lessonScores[lessonId] ?? 0,
      finishLesson,
      loseHeart,
      refillHearts,
      resetAll,
      badgeTier: (badgeId: string) => BADGES.find((b) => b.id === badgeId)?.tier ?? null,
    }),
    [progress, ready, finishLesson, loseHeart, refillHearts, resetAll],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame deve ser usado dentro de <GameProvider>.');
  return context;
}
