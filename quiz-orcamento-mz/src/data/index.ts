import type { BadgeDef, LevelDef, Lesson, Module, Question } from '../types';
import { module1 } from './module1';
import { module2 } from './module2';
import { module3 } from './module3';
import { module4 } from './module4';
import { examQuestions } from './exam';

export const modules: Module[] = [module1, module2, module3, module4];
export { examQuestions };

export const examMeta = {
  id: 'exame-final',
  title: 'Exame Final',
  tagline: '20 perguntas. Todos os módulos. Nota de 60% para passar.',
  secondsPerQuestion: 35,
  passRatio: 0.6,
};

export function allQuestions(): Question[] {
  return [
    ...modules.flatMap((m) => m.lessons.flatMap((l) => l.questions)),
    ...examQuestions,
  ];
}

export function findLesson(lessonId: string): { module: Module; lesson: Lesson } | null {
  for (const module of modules) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return { module, lesson };
  }
  return null;
}

export function lessonById(lessonId: string): Lesson | null {
  return findLesson(lessonId)?.lesson ?? null;
}

export function questionCount(questions: Question[]): number {
  return questions.reduce((sum, q) => sum + (q.parts ? q.parts.length : 1), 0);
}

export function moduleStats(module: Module) {
  const lessons = module.lessons;
  const questions = lessons.flatMap((l) => l.questions);
  return {
    lessons: lessons.length,
    questions: questionCount(questions),
    tests: lessons.filter((l) => l.kind !== 'licao').length,
  };
}

/** Níveis do jogador — progressão "de estagiário a auditor supremo". */
export const LEVELS: LevelDef[] = [
  { index: 0, name: 'Estagiário do Erário', minXp: 0, glyph: '🌱' },
  { index: 1, name: 'Técnico Orçamental', minXp: 120, glyph: '📐' },
  { index: 2, name: 'Gestor de Verbas', minXp: 320, glyph: '📊' },
  { index: 3, name: 'Fiscal de Contas', minXp: 600, glyph: '🔎' },
  { index: 4, name: 'Auditor Júnior', minXp: 950, glyph: '🛡️' },
  { index: 5, name: 'Auditor Sénior', minXp: 1400, glyph: '🧭' },
  { index: 6, name: 'Inspector de Finanças', minXp: 1950, glyph: '⚖️' },
  { index: 7, name: 'Guardião do Erário', minXp: 2600, glyph: '🏛️' },
  { index: 8, name: 'Auditor Supremo', minXp: 3400, glyph: '👑' },
];

export function levelForXp(xp: number): { level: LevelDef; next: LevelDef | null; progress: number } {
  let level = LEVELS[0];
  for (const candidate of LEVELS) {
    if (xp >= candidate.minXp) level = candidate;
  }
  const next = LEVELS[level.index + 1] ?? null;
  const span = next ? next.minXp - level.minXp : 1;
  const progress = next ? Math.min(1, (xp - level.minXp) / span) : 1;
  return { level, next, progress };
}

/** Medalhas/emblemas desbloqueáveis. */
export const BADGES: BadgeDef[] = [
  { id: 'b-m1', name: 'Filho de Montesquieu', description: 'Completou o Módulo I.', glyph: '🕊️', tier: 'bronze' },
  { id: 'b-m2', name: 'Mestre das Fases', description: 'Completou o Módulo II.', glyph: '🔗', tier: 'bronze' },
  { id: 'b-m3', name: 'Olho do Controlo', description: 'Completou o Módulo III.', glyph: '👁️', tier: 'prata' },
  { id: 'b-m4', name: 'Maestro Institucional', description: 'Completou o Módulo IV.', glyph: '🧩', tier: 'prata' },
  { id: 'b-perfeito', name: 'Zero Erros', description: '100% numa lição ou teste.', glyph: '🎯', tier: 'ouro' },
  { id: 'b-teste', name: 'Aprovado por Unanimidade', description: 'Passou um Teste de Módulo.', glyph: '✅', tier: 'prata' },
  { id: 'b-blitz', name: 'Reflexo de Titânio', description: '5 respostas certas seguidas com cronómetro.', glyph: '⚡', tier: 'neon' },
  { id: 'b-exame', name: 'Certificado', description: 'Passou o Exame Final.', glyph: '🎓', tier: 'ouro' },
  { id: 'b-streak3', name: 'Constância Neon', description: 'Jogou 3 dias seguidos.', glyph: '🔥', tier: 'neon' },
  { id: 'b-nivel5', name: 'Auditor Sénior', description: 'Alcançou o nível 5.', glyph: '🚀', tier: 'neon' },
];

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
