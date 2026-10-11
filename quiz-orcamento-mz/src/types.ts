/**
 * Tipos do motor de jogo "Quiz Orçamento MZ".
 *
 * Regra de ouro do conteúdo: NADA de blocos longos.
 *  - `prompt`      -> 1 frase, máximo ~90 caracteres.
 *  - `options`     -> 2 a 4 hipóteses, máximo ~28 caracteres cada.
 *  - `feedback`    -> 1 linha (reforço positivo ou correcção), máximo ~110 caracteres.
 *  - `source`      -> norma de suporte, formato curto: "Lei 14/2020, art. 51.º".
 */

/** Uma etapa de uma pergunta multi-partes (ex.: circuito Executivo → TA → AR). */
export interface QuestionPart {
  /** Rótulo curto da etapa mostrado no "stepper": "O Executivo gasta". */
  label: string;
  prompt: string;
  options: string[];
  answer: number;
  feedback: string;
  source?: string;
  /** Dica opcional de 1 linha (custa 3 XP). */
  hint?: string;
}

export interface Question {
  id: string;
  /** Pergunta directa e curta. */
  prompt: string;
  options: string[];
  answer: number;
  /** Reforço de 1 linha explicado com o porquê. */
  feedback: string;
  /** Norma/base legal em formato curto. */
  source?: string;
  /** XP base da pergunta (por etapa, no caso de multi-partes). */
  xp?: number;
  /** Etapas sequenciais. O jogador só avança após concluir todas. */
  parts?: QuestionPart[];
  /** Dica opcional de 1 linha (custou 3 XP quando usada). */
  hint?: string;
}

export type LessonKind = 'licao' | 'teste' | 'exame';

export interface Lesson {
  id: string;
  title: string;
  /** Linha única sobre o foco da lição. */
  tagline: string;
  kind: LessonKind;
  /** Segundos por pergunta em testes/exames (blitz). 0 = sem cronómetro. */
  secondsPerQuestion?: number;
  /** Bónus de XP por concluir a lição sem erros. */
  perfectBonus?: number;
  questions: Question[];
}

export interface Module {
  id: string;
  index: number;
  title: string;
  tagline: string;
  /** Gradiente de acento (neon) do módulo. */
  accent: [string, string];
  badgeId: string;
  lessons: Lesson[];
}

export interface BadgeDef {
  id: string;
  name: string;
  /** 1 linha, no máximo. */
  description: string;
  glyph: string;
  tier: 'bronze' | 'prata' | 'ouro' | 'neon';
}

export interface LevelDef {
  index: number;
  name: string;
  minXp: number;
  glyph: string;
}

/** Progresso persistido do jogador. */
export interface Progress {
  xp: number;
  hearts: number;
  /** Data (YYYY-MM-DD) da última lição concluída, para o streak. */
  lastPlayedDay: string | null;
  streakDays: number;
  /** lição_id -> melhor percentagem (0..1). */
  lessonScores: Record<string, number>;
  /** lição_id -> lição já concluída. */
  completedLessons: string[];
  unlockedBadges: string[];
  totalCorrect: number;
  totalAnswered: number;
  examBests: Record<string, number>;
}

export interface AnswerRecord {
  questionId: string;
  partIndex: number;
  optionIndex: number;
  correct: boolean;
  seconds: number;
}
