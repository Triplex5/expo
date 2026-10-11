import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BadgeChip, BadgeStrip } from '../components/BadgeChip';
import { Background } from '../components/Background';
import { Card, GhostButton, NeonButton, SectionTitle, StatChip } from '../components/ui';
import { BADGES, LEVELS, modules } from '../data';
import { percent } from '../game/rules';
import { overallProgress } from '../game/unlock';
import { useGame } from '../store/GameProvider';
import { colors, fonts, spacing, withAlpha } from '../theme';

export function BadgesScreen({ onBack }: { onBack: () => void }) {
  const { progress, level, resetAll } = useGame();
  const [confirming, setConfirming] = useState(false);
  const overall = overallProgress(progress);
  const unlockedBadges = BADGES.filter((b) => progress.unlockedBadges.includes(b.id));

  return (
    <Background accent={colors.gold}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <GhostButton label="← Voltar" onPress={onBack} style={{ alignSelf: 'flex-start' }} />
        <Text style={styles.kicker}>PROGRESSO & CONQUISTAS</Text>
        <Text style={styles.title}>Emblemas de Mérito</Text>
        <Text style={styles.subtitle}>
          {unlockedBadges.length} de {BADGES.length} emblemas conquistados
        </Text>

        {unlockedBadges.length ? (
          <Card glow={colors.gold} style={{ gap: spacing.md }}>
            <Text style={styles.sectionLabel}>CONQUISTADOS</Text>
            <BadgeStrip badges={unlockedBadges} size={58} />
          </Card>
        ) : null}

        <View style={styles.statsRow}>
          <StatChip glyph="⚡" value={`${progress.xp}`} label="XP total" tone={colors.neonBlue} />
          <StatChip glyph="🎯" value={percent(overall.accuracy)} label="Precisão" tone={colors.success} />
          <StatChip glyph="🔥" value={`${progress.streakDays}d`} label="Streak" tone={colors.neonMagenta} />
        </View>

        <SectionTitle hint="toque nos desbloqueados para rever">Álbum completo</SectionTitle>
        <View style={styles.grid}>
          {BADGES.map((badge) => (
            <BadgeChip key={badge.id} badge={badge} unlocked={progress.unlockedBadges.includes(badge.id)} />
          ))}
        </View>

        <SectionTitle>Escada de níveis</SectionTitle>
        <Card style={{ gap: spacing.md }}>
          {LEVELS.map((item) => {
            const active = item.index === level.index;
            const reached = progress.xp >= item.minXp;
            return (
              <View key={item.name} style={styles.levelRow}>
                <Text style={styles.levelGlyph}>{item.glyph}</Text>
                <Text
                  style={[
                    styles.levelName,
                    { color: active ? colors.white : reached ? colors.titanium : colors.titaniumDark },
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={[styles.levelXp, { color: reached ? colors.neonBlue : colors.titaniumDark }]}>
                  {item.minXp} XP
                </Text>
              </View>
            );
          })}
        </Card>

        <SectionTitle>Detalhe por módulo</SectionTitle>
        {modules.map((module) => {
          const best = Math.max(
            0,
            ...module.lessons.map((lesson) => progress.lessonScores[lesson.id] ?? 0),
          );
          const done = module.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
          return (
            <Card key={module.id} style={styles.moduleRow}>
              <View style={[styles.dot, { backgroundColor: module.accent[0] }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.moduleTitle}>
                  M{module.index} · {module.title}
                </Text>
                <Text style={styles.moduleMeta}>
                  {done}/{module.lessons.length} lições · melhor nota {percent(best)}
                </Text>
              </View>
            </Card>
          );
        })}

        <SectionTitle>Zona de risco</SectionTitle>
        {confirming ? (
          <Card glow={colors.danger} style={{ gap: spacing.md }}>
            <Text style={styles.dangerText}>Apagar todo o progresso (XP, medalhas e notas)?</Text>
            <NeonButton
              label="SIM, APAGAR TUDO"
              gradient={['#FF4D6D', '#FF8A3D']}
              onPress={() => {
                resetAll();
                setConfirming(false);
              }}
            />
            <GhostButton label="Cancelar" onPress={() => setConfirming(false)} />
          </Card>
        ) : (
          <GhostButton label="Apagar progresso" tone={colors.danger} onPress={() => setConfirming(true)} />
        )}
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
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  kicker: {
    color: withAlpha(colors.gold, 0.9),
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.4,
  },
  title: {
    color: colors.white,
    fontSize: 26,
    fontFamily: fonts.black,
  },
  subtitle: {
    color: colors.titanium,
    fontSize: 12,
    fontFamily: fonts.medium,
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.black,
    letterSpacing: 1.4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  levelGlyph: {
    fontSize: 16,
  },
  levelName: {
    flex: 1,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  levelXp: {
    fontSize: 12,
    fontFamily: fonts.black,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moduleTitle: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  moduleMeta: {
    color: colors.titaniumDark,
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  dangerText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.semi,
  },
});
