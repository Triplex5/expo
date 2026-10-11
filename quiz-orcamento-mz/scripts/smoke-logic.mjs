#!/usr/bin/env node
/**
 * Smoke test da lógica de jogo (sem React): níveis, streaks, desbloqueios,
 * cálculo de XP das perguntas multi-partes e sorteio do sprint.
 *
 *   npm run smoke
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = resolve(root, '.tmp-smoke');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  'npx',
  [
    'tsc',
    'src/types.ts',
    'src/theme.ts',
    'src/data/index.ts',
    'src/game/rules.ts',
    'src/game/unlock.ts',
    '--outDir',
    outDir,
    '--rootDir',
    'src',
    '--module',
    'commonjs',
    '--target',
    'es2020',
    '--moduleResolution',
    'node',
    '--esModuleInterop',
    '--skipLibCheck',
    '--jsx',
    'react-jsx',
  ],
  { cwd: root, stdio: 'inherit' },
);

const require = createRequire(import.meta.url);
const rules = require(resolve(outDir, 'game/rules.js'));
const data = require(resolve(outDir, 'data/index.js'));
const unlock = require(resolve(outDir, 'game/unlock.js'));

let failures = 0;
function check(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
  } else {
    failures += 1;
    console.error(`  ✗ ${label}`);
  }
}

const emptyProgress = {
  xp: 0,
  hearts: 5,
  lastPlayedDay: null,
  streakDays: 0,
  lessonScores: {},
  completedLessons: [],
  unlockedBadges: [],
  totalCorrect: 0,
  totalAnswered: 0,
  examBests: {},
};

console.log('Níveis e XP');
check('0 XP => primeiro nível', data.levelForXp(0).level.name === 'Estagiário do Erário');
check('2600 XP => Guardião do Erário', data.levelForXp(2600).level.name === 'Guardião do Erário');
check('progresso do nível entre 0 e 1', data.levelForXp(200).progress > 0 && data.levelForXp(200).progress < 1);
check('nível máximo sem próximo', data.levelForXp(99999).next === null);

console.log('Streaks');
check('primeiro dia => streak 1', rules.nextStreak(null, 0) === 1);
check('mesmo dia mantém streak', rules.nextStreak(rules.todayKey(), 4) === 4);
const yesterday = new Date(Date.now() - 86_400_000);
check('dia seguinte incrementa', rules.nextStreak(rules.todayKey(yesterday), 4) === 5);
const longAgo = new Date(Date.now() - 5 * 86_400_000);
check('falha de dias reinicia', rules.nextStreak(rules.todayKey(longAgo), 9) === 1);

console.log('Desbloqueio de módulos');
const m1 = unlock.moduleUnlockState(emptyProgress, 0);
check('módulo 1 desbloqueado por omissão', m1.unlocked === true);
const m2 = unlock.moduleUnlockState(emptyProgress, 1);
check('módulo 2 bloqueado no início', m2.unlocked === false && m2.hint.includes('Módulo 1'));
const halfDone = {
  ...emptyProgress,
  completedLessons: ['m1-l1', 'm1-l2'],
};
check('metade do módulo 1 desbloqueia o módulo 2', unlock.moduleUnlockState(halfDone, 1).unlocked === true);
check('próxima lição é a primeira em falta', unlock.nextLesson(halfDone)?.lesson.id === 'm1-l3');
check('progresso global conta lições', unlock.overallProgress(emptyProgress).total === data.modules.reduce((n, mod) => n + mod.lessons.length, 0));

console.log('XP das perguntas');
const multi = data.modules[0].lessons[0].questions.find((q) => q.parts?.length);
check('pergunta multi-partes encontrada', Boolean(multi));
check('XP multiplica pelo nº de partes', rules.questionXp(multi, multi.parts.length) === (multi.xp ?? 10) * multi.parts.length);
const simple = data.modules[0].lessons[0].questions.find((q) => !q.parts);
check('pergunta simples vale 10 XP', rules.questionXp(simple, 1) === 10);

console.log('Sprint e banco');
const bank = data.allQuestions();
check('banco com 100+ etapas de resposta', data.questionCount(bank) >= 100);
const sprint = rules.randomSprint(bank, 10);
check('sprint devolve 10 perguntas distintas', sprint.length === 10 && new Set(sprint.map((q) => q.id)).size === 10);
check('sprint inclui perguntas multi-partes', sprint.some((q) => q.parts?.length));
check('shuffle não perde elementos', rules.shuffle([1, 2, 3, 4, 5]).length === 5);
check('ratio protege divisão por zero', rules.ratio(0, 0) === 0 && rules.percent(0.666) === '67%');

console.log('Exame');
check('exame com 20 perguntas', data.examQuestions.length === 20);
check('nota de aprovação 60%', data.examMeta.passRatio === 0.6);
check('cronómetro do exame definido', data.examMeta.secondsPerQuestion === 35);

rmSync(outDir, { recursive: true, force: true });

console.log(`\n${failures === 0 ? '✓' : '✗'} Lógica de jogo: ${failures} falha(s).`);
process.exit(failures === 0 ? 0 : 1);
