import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeStrip } from '../components/BadgeChip';
import { Background } from '../components/Background';
import { Card, Chip, GhostButton, Hearts, ProgressBar, SectionTitle, StatChip } from '../components/ui';
import { BADGES, moduleStats, modules } from '../data';
import { haptics } from '../haptics';
import { moduleProgress, moduleUnlockState, nextLesson, overallProgress } from '../game/unlock';
import { percent } from '../game/rules';
import { useGame } from '../store/GameProvider';
import { colors, fonts, radius, spacing, withAlpha } from '../theme';
import type { Module } from '../types';

const HERO_MANSION = require('../../assets/hero-mansion.png');

export function HomeScreen({
  onOpenModule,
  onOpenLesson,
  onOpenExam,
  onOpenSprint,
  onOpenBadges,
  onOpenLibrary,
}: {
  onOpenModule: (moduleId: string) => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenExam: () => void;
  onOpenSprint: () => void;
  onOpenBadges: () => void;
  onOpenLibrary: () => void;
}) {
  const { progress, level, refillHearts } = useGame();
  const next = nextLesson(progress);
  const overall = overallProgress(progress);
  const unlockedBadges = BADGES.filter((b) => progress.unlockedBadges.includes(b.id));

  return (
    <Background hero={HERO_MANSION}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandKicker}>REPÚBLICA DE MOÇAMBIQUE · FORMAÇÃO</Text>
            <Text style={styles.brand}>Quiz Orçamento MZ</Text>
          </View>
          <Chip label={`Nv. ${level.index + 1}`} glyph={level.glyph} tone={colors.neonViolet} filled />
        </View>

        {/* Cartão do jogador */}
        <Card glow={colors.neonBlue} style={styles.playerCard}>
          <View style={styles.playerTop}>
            <View style={styles.playerIdentity}>
              <Text style={styles.levelName}>{level.name}</Text>
              <Text style={styles.levelXp}>
                {progress.xp} XP {level.nextXp ? `· faltam ${Math.max(0, level.nextXp - progress.xp)}` : '· nível máximo'}
              </Text>
            </View>
            <Hearts value={progress.hearts} />
          </View>
          <ProgressBar value={level.progress} height={12} />
          <View style={styles.statsRow}>
            <StatChip glyph="🔥" value={`${progress.streakDays}d`} label="Streak" tone={colors.neonMagenta} />
            <StatChip glyph="🎯" value={percent(overall.accuracy)} label="Precisão" tone={colors.success} />
            <StatChip glyph="🏅" value={`${unlockedBadges.length}/${BADGES.length}`} label="Medalhas" tone={colors.gold} />
          </View>
          {progress.hearts === 0 ? (
            <GhostButton label="Recarregar corações" tone={colors.danger} onPress={refillHearts} style={styles.refill} />
          ) : null}
        </Card>

        {/* Acção principal: continuar */}
        {next ? (
          <>
            <SectionTitle hint={`${overall.done}/${overall.total} lições`}>Continuar a formação</SectionTitle>
            <Pressable
              onPress={() => {
                haptics.media();
                onOpenLesson(next.lesson.id);
              }}
              style={styles.continueCard}
            >
              <LinearGradient
                colors={[withAlpha(next.module.accent[0], 0.35), withAlpha(next.module.accent[1], 0.25)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.continueRow}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.continueKicker}>MÓDULO {next.module.index}</Text>
                  <Text style={styles.continueTitle}>{next.lesson.title}</Text>
                  <Text style={styles.continueTagline}>{next.lesson.tagline}</Text>
                </View>
                <View style={[styles.playBadge, { borderColor: next.module.accent[0] }]}>
                  <Text style={styles.playGlyph}>▶</Text>
                </View>
              </View>
              <ProgressBar value={overall.ratio} colors={next.module.accent} height={8} />
            </Pressable>
          </>
        ) : (
          <Card style={styles.continueCard}>
            <Text style={styles.continueKicker}>CURSO COMPLETO</Text>
            <Text style={styles.continueTitle}>Estás pronto para o Exame Final 🎓</Text>
          </Card>
        )}

        {/* Desafios */}
        <SectionTitle>Desafios rápidos</SectionTitle>
        <View style={styles.challengeRow}>
          <Pressable style={styles.challenge} onPress={onOpenExam}>
            <LinearGradient
              colors={['#FFD166', '#FF8A3D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.challengeFill}
            >
              <Text style={styles.challengeGlyph}>🎓</Text>
              <Text style={styles.challengeTitle}>Exame Final</Text>
              <Text style={styles.challengeHint}>20 perguntas · passar com 60%</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.challenge} onPress={onOpenSprint}>
            <LinearGradient
              colors={['#2ED8FF', '#7A5CFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.challengeFill}
            >
              <Text style={styles.challengeGlyph}>⚡</Text>
              <Text style={styles.challengeTitle}>Blitz 10</Text>
              <Text style={styles.challengeHint}>10 perguntas aleatórias</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Medalhas */}
        <SectionTitle hint={`${unlockedBadges.length} conquistadas`}>Emblemas de mérito</SectionTitle>
        <Card>
          {unlockedBadges.length ? (
            <BadgeStrip badges={unlockedBadges} />
          ) : (
            <Text style={styles.emptyText}>Conclui a tua primeira lição para ganhar o primeiro emblema.</Text>
          )}
          <GhostButton label="Ver todas as medalhas" onPress={onOpenBadges} style={{ marginTop: spacing.md }} />
        </Card>

        {/* Módulos */}
        <SectionTitle hint="4 módulos · 13 lições · 100+ perguntas">Trilha de aprendizagem</SectionTitle>
        {modules.map((module, index) => {
          const stats = moduleStats(module);
          const state = moduleUnlockState(progress, index);
          const mp = moduleProgress(progress, module);
          return (
            <ModuleRow
              key={module.id}
              module={module}
              stats={stats}
              locked={!state.unlocked}
              hint={state.hint}
              done={mp.done}
              total={mp.total}
              ratio={mp.ratio}
              onPress={() => {
                haptics.media();
                onOpenModule(module.id);
              }}
            />
          );
        })}

        <GhostButton
          label="📖 Biblioteca de normas (leitura rápida)"
          onPress={onOpenLibrary}
          style={{ marginTop: spacing.lg }}
        />

        <Text style={styles.footer}>
          Jogo educativo sobre o Controlo da Execução Orçamental · Lei 9/2002, Lei 26/2009, Lei 13/97 e Lei 14/2020
        </Text>
      </ScrollView>
    </Background>
  );
}

function ModuleRow({
  module,
  stats,
  locked,
  hint,
  done,
  total,
  ratio,
  onPress,
}: {
  module: Module;
  stats: { lessons: number; questions: number; tests: number };
  locked: boolean;
  hint: string;
  done: number;
  total: number;
  ratio: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={locked ? undefined : onPress} style={[styles.moduleRow, locked && { opacity: 0.55 }]}>
      <LinearGradient
        colors={module.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.moduleAccent}
      />
      <View style={styles.moduleBody}>
        <View style={styles.moduleHeaderRow}>
          <Text style={styles.moduleIndex}>MÓDULO {module.index}</Text>
          <Text style={styles.moduleMeta}>
            {locked ? '🔒' : `${done}/${total} lições`}
          </Text>
        </View>
        <Text style={styles.moduleTitle}>{module.title}</Text>
        <Text style={styles.moduleTagline} numberOfLines={1}>
          {locked ? hint : module.tagline}
        </Text>
        <View style={styles.moduleFooter}>
          <View style={{ flex: 1 }}>
            <ProgressBar value={ratio} colors={module.accent} height={6} />
          </View>
          <Text style={styles.moduleStats}>
            {stats.questions} perguntas · {stats.tests} testes
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    paddingTop: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandKicker: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.semi,
    letterSpacing: 1.4,
  },
  brand: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fonts.black,
    letterSpacing: -0.4,
  },
  playerCard: {
    gap: spacing.md,
  },
  playerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerIdentity: {
    gap: 2,
  },
  levelName: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  levelXp: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  refill: {
    marginTop: spacing.xs,
  },
  continueCard: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  continueKicker: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.2,
  },
  continueTitle: {
    color: colors.white,
    fontSize: 19,
    fontFamily: fonts.bold,
  },
  continueTagline: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  playBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    color: colors.white,
    fontSize: 18,
  },
  challengeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  challenge: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  challengeFill: {
    padding: spacing.lg,
    gap: 4,
    minHeight: 122,
    justifyContent: 'center',
  },
  challengeGlyph: {
    fontSize: 22,
  },
  challengeTitle: {
    color: '#07080B',
    fontSize: 16,
    fontFamily: fonts.black,
  },
  challengeHint: {
    color: 'rgba(7,8,11,0.75)',
    fontSize: 11,
    fontFamily: fonts.semi,
  },
  emptyText: {
    color: colors.titanium,
    fontSize: 13,
    fontFamily: fonts.medium,
    lineHeight: 18,
  },
  moduleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  moduleAccent: {
    width: 6,
  },
  moduleBody: {
    flex: 1,
    padding: spacing.lg,
    gap: 4,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moduleIndex: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.2,
  },
  moduleMeta: {
    color: colors.titanium,
    fontSize: 11,
    fontFamily: fonts.semi,
  },
  moduleTitle: {
    color: colors.white,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  moduleTagline: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  moduleFooter: {
    marginTop: spacing.sm,
    gap: 6,
  },
  moduleStats: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  footer: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.medium,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 15,
  },
});
