import { modules } from '../data';
import type { Lesson, Module, Progress } from '../types';

export function moduleProgress(progress: Progress, module: Module) {
  const total = module.lessons.length;
  const done = module.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
  const bestScores = module.lessons.map((l) => progress.lessonScores[l.id] ?? 0);
  const best = bestScores.length ? Math.max(...bestScores) : 0;
  return { done, total, ratio: total ? done / total : 0, best };
}

/** Regra de desbloqueio: metade do módulo anterior concluído. */
export function moduleUnlockState(progress: Progress, moduleIndex: number) {
  if (moduleIndex === 0) return { unlocked: true, hint: '' };
  const previous = modules[moduleIndex - 1];
  const { done, total } = moduleProgress(progress, previous);
  const required = Math.ceil(total / 2);
  if (done >= required) return { unlocked: true, hint: '' };
  return {
    unlocked: false,
    hint: `Completa ${required - done} lição(ões) do Módulo ${previous.index}`,
  };
}

export function isLessonDone(progress: Progress, lesson: Lesson): boolean {
  return progress.completedLessons.includes(lesson.id);
}

/** Próxima lição recomendada (primeira não concluída de um módulo desbloqueado). */
export function nextLesson(progress: Progress): { module: Module; lesson: Lesson } | null {
  for (let i = 0; i < modules.length; i += 1) {
    const module = modules[i];
    if (!moduleUnlockState(progress, i).unlocked) continue;
    const lesson = module.lessons.find((l) => !isLessonDone(progress, l));
    if (lesson) return { module, lesson };
  }
  return null;
}

export function overallProgress(progress: Progress) {
  const total = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const done = modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => progress.completedLessons.includes(l.id)).length,
    0,
  );
  const accuracy = progress.totalAnswered ? progress.totalCorrect / progress.totalAnswered : 0;
  return { total, done, ratio: total ? done / total : 0, accuracy };
}
