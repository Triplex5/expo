import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Background } from '../components/Background';
import { Card, Chip, GhostButton, ProgressBar, SectionTitle } from '../components/ui';
import { moduleStats, modules } from '../data';
import { moduleProgress, moduleUnlockState } from '../game/unlock';
import { percent } from '../game/rules';
import { haptics } from '../haptics';
import { useGame } from '../store/GameProvider';
import { colors, fonts, radius, spacing, withAlpha } from '../theme';
import type { Lesson } from '../types';

const HERO_SUPERCAR = require('../../assets/hero-supercar.png');

const KIND_META: Record<Lesson['kind'], { glyph: string; label: string }> = {
  licao: { glyph: '📘', label: 'LIÇÃO' },
  teste: { glyph: '🧪', label: 'TESTE' },
  exame: { glyph: '🎓', label: 'EXAME' },
};

export function ModuleScreen({
  moduleId,
  onBack,
  onOpenLesson,
}: {
  moduleId: string;
  onBack: () => void;
  onOpenLesson: (lessonId: string) => void;
}) {
  const { progress } = useGame();
  const moduleIndex = Math.max(0, modules.findIndex((m) => m.id === moduleId));
  const module = modules[moduleIndex];
  const stats = moduleStats(module);
  const mp = moduleProgress(progress, module);
  const unlock = moduleUnlockState(progress, moduleIndex);

  return (
    <Background hero={HERO_SUPERCAR} accent={module.accent[0]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GhostButton label="← Voltar" onPress={onBack} style={styles.back} />

        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kicker}>MÓDULO {module.index}</Text>
            <Text style={styles.title}>{module.title}</Text>
            <Text style={styles.tagline}>{module.tagline}</Text>
          </View>
          <Chip label={`${mp.done}/${mp.total}`} glyph="✅" tone={module.accent[0]} filled />
        </View>

        <ProgressBar value={mp.ratio} colors={module.accent} height={10} />
        <Text style={styles.metaLine}>
          {stats.questions} perguntas · {stats.tests} avaliações · melhor nota {percent(mp.best)}
        </Text>

        {!unlock.unlocked ? (
          <Card glow={colors.warn} style={styles.lockCard}>
            <Text style={styles.lockTitle}>🔒 Módulo bloqueado</Text>
            <Text style={styles.lockText}>{unlock.hint}</Text>
          </Card>
        ) : null}

        <SectionTitle hint="toca para jogar">Lições & avaliações</SectionTitle>
        {module.lessons.map((lesson, index) => {
          const done = progress.completedLessons.includes(lesson.id);
          const best = progress.lessonScores[lesson.id] ?? 0;
          const kindMeta = KIND_META[lesson.kind];
          return (
            <Pressable
              key={lesson.id}
              onPress={() => {
                haptics.media();
                onOpenLesson(lesson.id);
              }}
              style={styles.lessonRow}
            >
              <LinearGradient
                colors={done ? ['#27E08A', '#12B5A0'] : module.accent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lessonIcon}
              >
                <Text style={styles.lessonGlyph}>{done ? '✓' : kindMeta.glyph}</Text>
              </LinearGradient>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.lessonKicker}>
                  {kindMeta.label} {index + 1} · {lesson.questions.length} PERGUNTAS
                  {lesson.secondsPerQuestion ? ` · ${lesson.secondsPerQuestion}s` : ''}
                </Text>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonTagline} numberOfLines={1}>
                  {lesson.tagline}
                </Text>
              </View>
              <View style={styles.lessonRight}>
                <Text style={[styles.best, { color: done ? colors.success : colors.titaniumDark }]}>
                  {best ? percent(best) : '—'}
                </Text>
                <Text style={styles.lessonCta}>{done ? 'REPETIR' : 'JOGAR'}</Text>
              </View>
            </Pressable>
          );
        })}

        <Card style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <Text style={styles.tipKicker}>DICA DE ESTUDO</Text>
          <Text style={styles.tipText}>
            Termina o teste do módulo sem dicas para desbloquear o emblema «Aprovado por Unanimidade».
          </Text>
        </Card>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  kicker: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.4,
  },
  title: {
    color: colors.white,
    fontSize: 24,
    fontFamily: fonts.black,
  },
  tagline: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
    marginTop: 2,
  },
  metaLine: {
    color: colors.titaniumDark,
    fontSize: 11,
    fontFamily: fonts.medium,
    marginTop: spacing.sm,
  },
  lockCard: {
    marginTop: spacing.lg,
    gap: 4,
  },
  lockTitle: {
    color: colors.warn,
    fontSize: 14,
    fontFamily: fonts.black,
  },
  lockText: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lessonIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonGlyph: {
    fontSize: 20,
    color: colors.white,
  },
  lessonKicker: {
    color: colors.titaniumDark,
    fontSize: 9,
    fontFamily: fonts.black,
    letterSpacing: 1,
  },
  lessonTitle: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  lessonTagline: {
    color: colors.titanium,
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  lessonRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  best: {
    fontSize: 13,
    fontFamily: fonts.black,
  },
  lessonCta: {
    color: colors.neonBlue,
    fontSize: 9,
    fontFamily: fonts.black,
    letterSpacing: 1,
  },
  tipKicker: {
    color: withAlpha(colors.gold, 0.9),
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.2,
  },
  tipText: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
    lineHeight: 17,
  },
});
