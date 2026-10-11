import type { Question } from '../types';

export const GAME_RULES = {
  maxHearts: 5,
  /** Custou-lhe um erro: perde 1 coração. */
  xpPerCorrect: 10,
  /** Perguntas com xp próprio (multi-partes e desafios) usam o seu valor. */
  hintCost: 3,
  /** Acerto rápido (< 40% do tempo) ganha bónus. */
  speedBonus: 5,
  speedRatio: 0.4,
  streakBonusEvery: 5,
  streakBonus: 10,
} as const;

export function questionXp(question: Question, partCount: number): number {
  if (question.xp) return question.xp * Math.max(1, partCount);
  return GAME_RULES.xpPerCorrect * Math.max(1, partCount);
}

/** Devolve as perguntas de uma lição, do primeiro ao último erro (modo "repetição"). */
export function shuffle<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Modo "Exame Rápido": N perguntas aleatórias de todo o banco. */
export function randomSprint(bank: Question[], size = 10, rng: () => number = Math.random): Question[] {
  const flat = bank.filter((q) => !q.parts);
  const multi = bank.filter((q) => q.parts);
  const pool = [...shuffle(flat, rng).slice(0, size - 2), ...shuffle(multi, rng).slice(0, 2)];
  return shuffle(pool, rng).slice(0, size);
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function daysBetween(a: string, b: string): number {
  const first = new Date(`${a}T00:00:00`);
  const second = new Date(`${b}T00:00:00`);
  return Math.round((second.getTime() - first.getTime()) / 86_400_000);
}

export function nextStreak(lastPlayedDay: string | null, streakDays: number): number {
  const today = todayKey();
  if (!lastPlayedDay) return 1;
  const diff = daysBetween(lastPlayedDay, today);
  if (diff === 0) return Math.max(1, streakDays);
  if (diff === 1) return streakDays + 1;
  return 1;
}

export function ratio(correct: number, total: number): number {
  if (total <= 0) return 0;
  return correct / total;
}

export function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
