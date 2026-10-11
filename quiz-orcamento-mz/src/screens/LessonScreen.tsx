import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AnswerOption, type OptionState } from '../components/AnswerOption';
import { BadgeStrip, LockedBadgePill } from '../components/BadgeChip';
import { Background } from '../components/Background';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { StepperRow } from '../components/StepperRow';
import { Card, Chip, GhostButton, Hearts, NeonButton, ProgressBar, StatChip } from '../components/ui';
import { allQuestions, badgeById, examMeta, examQuestions, lessonById } from '../data';
import { GAME_RULES, percent, randomSprint } from '../game/rules';
import { haptics } from '../haptics';
import { useGame } from '../store/GameProvider';
import { colors, fonts, spacing, withAlpha } from '../theme';
import type { LessonKind, Question } from '../types';

type Mode = 'auto' | 'licao' | 'teste' | 'exame' | 'sprint';

interface SessionMeta {
  mode: Mode;
  lessonId: string;
  title: string;
  subtitle: string;
  accent: [string, string];
  secondsPerQuestion: number;
  passRatio: number;
  showStepperBlurb: string;
}

function buildMeta(mode: Mode, lessonId?: string): { meta: SessionMeta; questions: Question[] } {
  if (mode === 'exame') {
    return {
      meta: {
        mode,
        lessonId: examMeta.id,
        title: examMeta.title,
        subtitle: examMeta.tagline,
        accent: ['#FFD166', '#FF8A3D'],
        secondsPerQuestion: examMeta.secondsPerQuestion,
        passRatio: examMeta.passRatio,
        showStepperBlurb: 'Exame cronometrado',
      },
      questions: examQuestions,
    };
  }
  if (mode === 'sprint') {
    return {
      meta: {
        mode,
        lessonId: 'blitz-10',
        title: 'Blitz 10',
        subtitle: '10 perguntas aleatórias com cronómetro.',
        accent: ['#2ED8FF', '#7A5CFF'],
        secondsPerQuestion: 20,
        passRatio: 0.7,
        showStepperBlurb: 'Sprint cronometrado',
      },
      questions: randomSprint(allQuestions(), 10),
    };
  }
  const lesson = lessonId ? lessonById(lessonId) : null;
  if (!lesson) {
    return {
      meta: {
        mode,
        lessonId: 'desconhecida',
        title: 'Lição',
        subtitle: '',
        accent: ['#2ED8FF', '#7A5CFF'],
        secondsPerQuestion: 0,
        passRatio: 0.7,
        showStepperBlurb: '',
      },
      questions: [],
    };
  }
  return {
    meta: {
      mode: lesson.kind === 'licao' ? 'licao' : 'teste',
      lessonId: lesson.id,
      title: lesson.title,
      subtitle: lesson.tagline,
      accent: lesson.kind === 'licao' ? ['#2ED8FF', '#7A5CFF'] : ['#C04CFF', '#7A5CFF'],
      secondsPerQuestion: lesson.secondsPerQuestion ?? 0,
      passRatio: lesson.kind === 'licao' ? 0.7 : 0.7,
      showStepperBlurb: lesson.kind === 'licao' ? 'Lição' : 'Teste cronometrado',
    },
    questions: lesson.questions,
  };
}

export function LessonScreen({
  mode,
  lessonId,
  accent,
  onExit,
  onGoToExam,
}: {
  mode: Mode;
  lessonId?: string;
  accent?: [string, string];
  onExit: () => void;
  onGoToExam?: () => void;
}) {
  const { meta, questions } = useMemo(() => buildMeta(mode, lessonId), [mode, lessonId]);
  const themeAccent = accent ?? meta.accent;

  const { progress, finishLesson, loseHeart, refillHearts } = useGame();

  const [stepIndex, setStepIndex] = useState(0); // pergunta activa
  const [partIndex, setPartIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [phase, setPhase] = useState<'answering' | 'feedback' | 'done'>('answering');
  const [solvedParts, setSolvedParts] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [hintCost, setHintCost] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [fastStreak, setFastStreak] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(meta.secondsPerQuestion);
  const [hearts, setHearts] = useState(progress.hearts);
  const [wrongAnswers, setWrongAnswers] = useState<{ prompt: string; answer: string; source?: string }[]>([]);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [noHearts, setNoHearts] = useState(false);
  const [result, setResult] = useState<{
    xp: number;
    ratio: number;
    newBadges: string[];
    levelUp: string | null;
  } | null>(null);

  const xpFloat = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<() => void>(() => undefined);

  const totalSteps = useMemo(
    () => questions.reduce((sum, q) => sum + (q.parts ? q.parts.length : 1), 0),
    [questions],
  );

  const current = questions[stepIndex];
  const parts = current?.parts ?? [];
  const isMulti = parts.length > 0;
  const step = isMulti ? parts[partIndex] : current;
  const stepXp = (() => {
    if (!current) return GAME_RULES.xpPerCorrect;
    if (current.xp) return current.xp;
    return GAME_RULES.xpPerCorrect;
  })();

  const stepsDone = useMemo(
    () =>
      questions.slice(0, stepIndex).reduce((sum, q) => sum + (q.parts ? q.parts.length : 1), 0) +
      (isMulti ? solvedParts.length : phase === 'feedback' ? 1 : 0),
    [questions, stepIndex, isMulti, solvedParts.length, phase],
  );

  /** Erro = perde um coração (HUD + progresso persistido). */
  const penaliseHeart = useCallback(() => {
    setHearts((h) => Math.max(0, h - 1));
    loseHeart();
  }, [loseHeart]);

  /** Avalia a resposta da etapa actual. */
  const handleSelect = useCallback(
    (optionIndex: number) => {
      if (phase !== 'answering' || !step) return;
      setSelected(optionIndex);
      const isCorrect = optionIndex === step.answer;
      const usedSpeedBonus = Boolean(meta.secondsPerQuestion) && secondsLeft > meta.secondsPerQuestion * 0.5;

      if (isCorrect) {
        haptics.success();
        setCorrectCount((n) => n + 1);
        setFastStreak((n) => n + 1);
        setXpEarned((xp) => xp + stepXp + (usedSpeedBonus ? GAME_RULES.speedBonus : 0));
        setSolvedParts((solved) => (isMulti ? [...solved, partIndex] : solved));
        Animated.sequence([
          Animated.timing(xpFloat, { toValue: 1, duration: 260, useNativeDriver: true }),
          Animated.timing(xpFloat, { toValue: 0, duration: 260, useNativeDriver: true }),
        ]).start();
      } else {
        haptics.error();
        setFastStreak(0);
        penaliseHeart();
        setWrongAnswers((list) => [
          ...list,
          { prompt: step.prompt, answer: step.options[step.answer], source: step.source },
        ]);
      }
      setLastCorrect(isCorrect);
      setPhase('feedback');
    },
    [phase, step, meta.secondsPerQuestion, secondsLeft, stepXp, isMulti, partIndex, xpFloat, penaliseHeart],
  );

  /** Tempo esgotado = resposta incorrecta. */
  const handleTimeout = useCallback(() => {
    if (phase !== 'answering' || !step || noHearts) return;
    haptics.error();
    setSelected(null);
    setLastCorrect(false);
    setFastStreak(0);
    penaliseHeart();
    setWrongAnswers((list) => [
      ...list,
      { prompt: step.prompt, answer: step.options[step.answer], source: step.source },
    ]);
    setPhase('feedback');
  }, [phase, step, penaliseHeart, noHearts]);

  useEffect(() => {
    timeoutRef.current = handleTimeout;
  }, [handleTimeout]);

  // Cronómetro por pergunta.
  useEffect(() => {
    if (!meta.secondsPerQuestion) return;
    if (phase !== 'answering' || noHearts) return;
    setSecondsLeft(meta.secondsPerQuestion);
    const deadline = Date.now() + meta.secondsPerQuestion * 1000;
    const id = setInterval(() => {
      const remain = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remain);
      if (remain <= 0) {
        clearInterval(id);
        timeoutRef.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [meta.secondsPerQuestion, phase, stepIndex, partIndex, noHearts]);

  // Fim dos corações: pausa e pede recarga.
  useEffect(() => {
    if (hearts <= 0 && phase !== 'done') setNoHearts(true);
  }, [hearts, phase]);

  const finish = useCallback(
    (finalCorrect: number) => {
      const ratio = totalSteps ? finalCorrect / totalSteps : 0;
      const netXp = Math.max(0, xpEarned - hintCost);
      const kind: LessonKind = meta.mode === 'exame' ? 'exame' : meta.mode === 'teste' ? 'teste' : 'licao';
      const output = finishLesson({
        lessonId: meta.lessonId,
        kind,
        xpGained: netXp,
        ratio,
        correct: finalCorrect,
        total: totalSteps,
        fastStreak,
      });
      setResult({ xp: netXp, ratio, newBadges: output.newBadges, levelUp: output.levelUp });
      setPhase('done');
      if (ratio >= meta.passRatio) haptics.success();
      else haptics.heavy();
    },
    [totalSteps, xpEarned, hintCost, meta, finishLesson, fastStreak],
  );

  const advance = useCallback(() => {
    if (!current) return;
    if (isMulti && partIndex < parts.length - 1) {
      setPartIndex((p) => p + 1);
      setSelected(null);
      setPhase('answering');
      return;
    }
    if (stepIndex + 1 < questions.length) {
      setStepIndex((s) => s + 1);
      setPartIndex(0);
      setSolvedParts([]);
      setSelected(null);
      setHintVisible(false);
      setPhase('answering');
      return;
    }
    finish(correctCount);
  }, [current, isMulti, partIndex, parts.length, stepIndex, questions.length, finish, correctCount]);

  const restart = useCallback(() => {
    setStepIndex(0);
    setPartIndex(0);
    setSelected(null);
    setSolvedParts([]);
    setCorrectCount(0);
    setXpEarned(0);
    setHintCost(0);
    setHintVisible(false);
    setFastStreak(0);
    setWrongAnswers([]);
    setResult(null);
    setNoHearts(false);
    setHearts(GAME_RULES.maxHearts);
    refillHearts();
    setPhase('answering');
  }, [refillHearts]);

  if (!current && phase !== 'done') {
    return (
      <Background accent={withAlpha(themeAccent[0], 0.3)}>
        <View style={styles.centered}>
          <Card style={{ gap: spacing.md }}>
            <Text style={styles.doneTitle}>Sem perguntas disponíveis.</Text>
            <NeonButton label="Voltar" onPress={onExit} gradient={themeAccent} />
          </Card>
        </View>
      </Background>
    );
  }

  if (phase === 'done' && result) {
    const passed = result.ratio >= meta.passRatio;
    const newBadges = result.newBadges
      .map((id) => badgeById(id))
      .filter((badge): badge is NonNullable<typeof badge> => Boolean(badge));
    return (
      <Background accent={withAlpha(passed ? colors.success : colors.danger, 0.3)}>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.resultContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.resultEmoji}>{passed ? '🏆' : '💪'}</Text>
          <Text style={styles.resultTitle}>
            {meta.mode === 'exame'
              ? passed
                ? 'Aprovado no Exame Final!'
                : 'Ainda não foi desta'
              : passed
                ? 'Sessão concluída!'
                : 'Quase lá!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {percent(result.ratio)} de respostas correctas · {correctCount}/{totalSteps}
          </Text>

          {result.levelUp ? (
            <Card glow={colors.gold} style={styles.levelCard}>
              <Text style={styles.levelUpLabel}>SUBIU DE NÍVEL</Text>
              <Text style={styles.levelUpName}>{result.levelUp}</Text>
            </Card>
          ) : null}

          <View style={styles.statsRow}>
            <StatChip glyph="⚡" value={`+${result.xp}`} label="XP ganho" tone={colors.neonBlue} />
            <StatChip
              glyph={passed ? '✅' : '🎯'}
              value={percent(result.ratio)}
              label={meta.mode === 'exame' ? 'Nota' : 'Precisão'}
              tone={passed ? colors.success : colors.warn}
            />
            <StatChip glyph="🔥" value={`${progress.streakDays}d`} label="Streak" tone={colors.neonMagenta} />
          </View>

          {newBadges.length ? (
            <Card glow={colors.gold} style={{ gap: spacing.md }}>
              <Text style={styles.sectionLabel}>NOVOS EMBLEMAS</Text>
              <BadgeStrip badges={newBadges} />
            </Card>
          ) : null}

          {wrongAnswers.length ? (
            <Card style={{ gap: spacing.md }}>
              <Text style={styles.sectionLabel}>REVER ({wrongAnswers.length})</Text>
              {wrongAnswers.slice(0, 5).map((item, index) => (
                <View key={`${item.prompt}-${index}`} style={styles.reviewRow}>
                  <Text style={styles.reviewPrompt} numberOfLines={2}>
                    {item.prompt}
                  </Text>
                  <Text style={styles.reviewAnswer}>✓ {item.answer}</Text>
                </View>
              ))}
            </Card>
          ) : (
            <Card glow={colors.success}>
              <Text style={styles.sectionLabel}>PERFEITO</Text>
              <Text style={styles.perfectText}>Zero erros. Nada a rever. 🎯</Text>
            </Card>
          )}

          {!passed ? <LockedBadgePill badge={{ id: 't', name: 'Para passar', description: `Precisas de ${percent(meta.passRatio)} de acertos.`, glyph: '🎯', tier: 'neon' }} /> : null}

          <NeonButton label="REPETIR SESSÃO" onPress={restart} gradient={themeAccent} />
          {meta.mode !== 'exame' && onGoToExam ? (
            <GhostButton label="Ir para o Exame Final" tone={colors.gold} onPress={onGoToExam} />
          ) : null}
          <GhostButton label="Voltar ao início" onPress={onExit} />
        </ScrollView>
      </Background>
    );
  }

  const optionState = (index: number): OptionState => {
    if (phase === 'answering') return selected === index ? 'selected' : 'idle';
    if (!step) return 'muted';
    if (index === step.answer) return 'correct';
    if (selected === index) return 'wrong';
    return 'muted';
  };

  const timerRatio = meta.secondsPerQuestion ? secondsLeft / meta.secondsPerQuestion : 1;

  return (
    <Background accent={withAlpha(themeAccent[0], 0.28)}>
      <View style={styles.header}>
        <Pressable onPress={onExit} style={styles.closeButton} accessibilityLabel="Sair da sessão">
          <Text style={styles.closeGlyph}>✕</Text>
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: spacing.md }}>
          <ProgressBar value={totalSteps ? stepsDone / totalSteps : 0} colors={themeAccent} height={12} />
        </View>
        <Hearts value={hearts} />
      </View>

      <View style={styles.titleRow}>
        <Chip label={meta.showStepperBlurb} glyph={meta.mode === 'exame' ? '🎓' : '📘'} tone={themeAccent[0]} filled />
        <View style={styles.titleInfo}>
          <Text style={styles.titleText} numberOfLines={1}>
            {meta.title}
          </Text>
          <Text style={styles.xpText}>+{xpEarned - hintCost} XP</Text>
        </View>
      </View>

      {meta.secondsPerQuestion ? (
        <View style={styles.timerRow}>
          <Text style={[styles.timerLabel, { color: timerRatio < 0.35 ? colors.danger : colors.titanium }]}>
            ⏱ {secondsLeft}s
          </Text>
          <View style={{ flex: 1 }}>
            <ProgressBar
              value={timerRatio}
              colors={timerRatio < 0.35 ? ['#FF4D6D', '#FF8A3D'] : themeAccent}
              height={5}
            />
          </View>
        </View>
      ) : null}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {isMulti ? (
          <StepperRow parts={parts} activeIndex={partIndex} accent={themeAccent[0]} solvedIndexes={solvedParts} />
        ) : null}

        <View style={styles.promptWrap}>
          <Text style={styles.promptIndex}>
            PERGUNTA {stepIndex + 1}/{questions.length}
            {isMulti ? ` · PARTE ${partIndex + 1}/${parts.length}` : ''}
          </Text>
          <Text style={styles.prompt}>{step?.prompt}</Text>
          <Animated.Text
            style={[
              styles.xpFloat,
              {
                opacity: xpFloat,
                transform: [
                  {
                    translateY: xpFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -18] }),
                  },
                ],
              },
            ]}
          >
            +{stepXp} XP
          </Animated.Text>
        </View>

        {(step?.options ?? []).map((option, index) => (
          <AnswerOption
            key={option}
            label={option}
            index={index}
            state={optionState(index)}
            disabled={phase !== 'answering'}
            accent={themeAccent[0]}
            onPress={() => handleSelect(index)}
          />
        ))}

        {phase === 'answering' && step?.hint && !hintVisible ? (
          <GhostButton
            label={`💡 Dica (−${GAME_RULES.hintCost} XP)`}
            tone={colors.warn}
            onPress={() => {
              setHintVisible(true);
              setHintCost((cost) => cost + GAME_RULES.hintCost);
            }}
          />
        ) : null}

        {hintVisible && step?.hint ? (
          <Card glow={colors.warn} style={{ marginTop: spacing.md }}>
            <Text style={styles.hintText}>💡 {step.hint}</Text>
          </Card>
        ) : null}
      </ScrollView>

      {phase === 'feedback' && step ? (
        <FeedbackSheet
          correct={lastCorrect}
          feedback={lastCorrect ? step.feedback : `Certo: ${step.options[step.answer]}`}
          source={step.source}
          accent={themeAccent[0]}
          onContinue={advance}
          continueLabel={isMulti && partIndex < parts.length - 1 ? 'PARTE SEGUINTE' : stepIndex + 1 < questions.length ? 'CONTINUAR' : 'VER RESULTADO'}
        />
      ) : null}

      {noHearts ? (
        <View style={styles.overlay}>
          <Card glow={colors.danger} style={styles.overlayCard}>
            <Text style={styles.resultEmoji}>💔</Text>
            <Text style={styles.overlayTitle}>Ficaste sem corações</Text>
            <Text style={styles.overlayText}>
              Erros custam corações. Recarrega e continua — na função pública, os erros custam dinheiro.
            </Text>
            <NeonButton
              label="RECARREGAR E CONTINUAR"
              gradient={['#FF4D6D', '#FF8A3D']}
              onPress={() => {
                refillHearts();
                setHearts(GAME_RULES.maxHearts);
                setNoHearts(false);
              }}
            />
            <GhostButton label="Sair da sessão" onPress={onExit} />
          </Card>
        </View>
      ) : null}
    </Background>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.sm,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeGlyph: {
    color: colors.titanium,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  titleInfo: {
    flex: 1,
  },
  titleText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  xpText: {
    color: colors.neonBlue,
    fontSize: 11,
    fontFamily: fonts.semi,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  timerLabel: {
    fontSize: 12,
    fontFamily: fonts.black,
    width: 46,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 220,
  },
  promptWrap: {
    marginBottom: spacing.lg,
    minHeight: 68,
  },
  promptIndex: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  prompt: {
    color: colors.white,
    fontSize: 22,
    fontFamily: fonts.bold,
    lineHeight: 29,
  },
  xpFloat: {
    position: 'absolute',
    right: 0,
    top: 0,
    color: colors.success,
    fontSize: 13,
    fontFamily: fonts.black,
  },
  hintText: {
    color: colors.white,
    fontSize: 13,
    fontFamily: fonts.semi,
    lineHeight: 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  overlayCard: {
    width: '100%',
    gap: spacing.md,
    alignItems: 'center',
  },
  overlayTitle: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.black,
  },
  overlayText: {
    color: colors.titanium,
    fontSize: 13,
    fontFamily: fonts.medium,
    textAlign: 'center',
    lineHeight: 18,
  },
  resultContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    alignItems: 'stretch',
  },
  resultEmoji: {
    fontSize: 54,
    textAlign: 'center',
  },
  resultTitle: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fonts.black,
    textAlign: 'center',
  },
  resultSubtitle: {
    color: colors.titanium,
    fontSize: 13,
    fontFamily: fonts.semi,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  levelCard: {
    alignItems: 'center',
    gap: 4,
  },
  levelUpLabel: {
    color: colors.gold,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.4,
  },
  levelUpName: {
    color: colors.white,
    fontSize: 20,
    fontFamily: fonts.black,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.4,
  },
  reviewRow: {
    gap: 2,
    borderLeftWidth: 2,
    borderLeftColor: withAlpha(colors.danger, 0.7),
    paddingLeft: spacing.md,
  },
  reviewPrompt: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  reviewAnswer: {
    color: colors.success,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  perfectText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.semi,
  },
  doneTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
});
