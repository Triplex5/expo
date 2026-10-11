#!/usr/bin/env node
/**
 * Validador do banco de perguntas.
 * Garante o requisito de UI: ZERO blocos de texto longo.
 *
 *   node scripts/validate-bank.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = resolve(root, '.tmp-bank');

const LIMITS = {
  prompt: 95,
  option: 46,
  feedback: 130,
  source: 40,
  partLabel: 20,
  optionsMin: 2,
  optionsMax: 4,
  partsMin: 2,
  partsMax: 4,
};

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  'npx',
  [
    'tsc',
    'src/data/module1.ts',
    'src/data/module2.ts',
    'src/data/module3.ts',
    'src/data/module4.ts',
    'src/data/exam.ts',
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
  ],
  { cwd: root, stdio: 'inherit' },
);

const require = createRequire(import.meta.url);
const load = (name, exportName) => {
  const mod = require(resolve(outDir, 'data', name));
  if (exportName && mod[exportName]) return mod[exportName];
  if (mod.default) return mod.default;
  const keys = Object.keys(mod).filter((key) => key !== '__esModule');
  return mod[keys[0]];
};

const modules = [
  load('module1.js', 'module1'),
  load('module2.js', 'module2'),
  load('module3.js', 'module3'),
  load('module4.js', 'module4'),
];
const examQuestions = load('exam.js', 'examQuestions');

const problems = [];
const ids = new Set();
let steps = 0;

function checkStep(question, step, where) {
  steps += 1;
  const { prompt, options, answer, feedback, source } = step;

  if (!prompt || prompt.length > LIMITS.prompt) {
    problems.push(`${where}: enunciado com ${prompt?.length ?? 0} caracteres (máx ${LIMITS.prompt}) → "${prompt}"`);
  }
  if (!Array.isArray(options) || options.length < LIMITS.optionsMin || options.length > LIMITS.optionsMax) {
    problems.push(`${where}: precisa de ${LIMITS.optionsMin}-${LIMITS.optionsMax} opções`);
  }
  const longOption = (options ?? []).find((o) => o.length > LIMITS.option);
  if (longOption) problems.push(`${where}: opção longa (${longOption.length}) → "${longOption}"`);
  if (new Set(options ?? []).size !== (options ?? []).length) {
    problems.push(`${where}: opções repetidas`);
  }
  if (typeof answer !== 'number' || answer < 0 || answer >= (options ?? []).length) {
    problems.push(`${where}: resposta correcta inválida (${answer})`);
  }
  if (!feedback || feedback.length > LIMITS.feedback) {
    problems.push(`${where}: feedback ausente ou longo (${feedback?.length ?? 0})`);
  }
  if (source && source.length > LIMITS.source) {
    problems.push(`${where}: fonte longa (${source.length})`);
  }
}

for (const module of modules) {
  for (const lesson of module.lessons) {
    if (!lesson.questions.length) problems.push(`${lesson.id}: lição sem perguntas`);
    for (const question of lesson.questions) {
      if (ids.has(question.id)) problems.push(`id duplicado: ${question.id}`);
      ids.add(question.id);

      const where = `${lesson.id}/${question.id}`;
      if (question.parts?.length) {
        if (question.parts.length < LIMITS.partsMin || question.parts.length > LIMITS.partsMax) {
          problems.push(`${where}: multi-partes com ${question.parts.length} etapas`);
        }
        question.parts.forEach((part, index) => {
          if (!part.label || part.label.length > LIMITS.partLabel) {
            problems.push(`${where}: rótulo da etapa ${index + 1} inválido`);
          }
          checkStep(question, part, `${where}#p${index + 1}`);
        });
      } else {
        checkStep(question, question, where);
      }
    }
  }
}

for (const question of examQuestions) {
  if (ids.has(question.id)) problems.push(`id duplicado: ${question.id}`);
  ids.add(question.id);
  if (question.parts?.length) {
    question.parts.forEach((part, index) => checkStep(question, part, `exame/${question.id}#p${index + 1}`));
  } else {
    checkStep(question, question, `exame/${question.id}`);
  }
}

rmSync(outDir, { recursive: true, force: true });

const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
console.log('— Banco de perguntas Quiz Orçamento MZ —');
console.log(`Módulos: ${modules.length} · Lições/Testes: ${totalLessons} · Etapas de resposta: ${steps}`);
console.log(`Limites: enunciado ≤ ${LIMITS.prompt} car., opção ≤ ${LIMITS.option}, feedback ≤ ${LIMITS.feedback}`);

if (problems.length) {
  console.error(`\n✗ ${problems.length} problemas encontrados:`);
  for (const problem of problems) console.error(` · ${problem}`);
  process.exit(1);
}
console.log('\n✓ Sem blocos de texto longo: todas as etapas passam nos limites.');
if (!existsSync(root)) process.exit(0);
