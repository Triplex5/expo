import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { colors, fonts, radius, shadow, spacing, withAlpha } from '../theme';

export function NeonButton({
  label,
  onPress,
  gradient = ['#2ED8FF', '#7A5CFF'],
  disabled,
  loading,
  compact,
  style,
  testID,
}: {
  label: string;
  onPress: () => void;
  gradient?: readonly [string, string] | readonly string[];
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  testID?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stops = gradient as any;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.buttonShell,
        compact && styles.buttonCompact,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#232A36', '#1A1F28'] : stops}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.buttonFill, shadow.neon(disabled ? '#000000' : (gradient[0] as string), 0.45, 16)]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={[styles.buttonLabel, compact && { fontSize: 14 }]}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  style,
  tone = colors.titanium,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  tone?: string;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.ghost, style]}>
      <Text style={[styles.ghostLabel, { color: tone }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({
  children,
  style,
  glow,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  glow?: string;
}) {
  return (
    <View style={[styles.card, glow ? { borderColor: withAlpha(glow, 0.45) } : null, style]}>
      {children}
    </View>
  );
}

export function ProgressBar({
  value,
  colors: barColors = ['#2ED8FF', '#7A5CFF'],
  height = 10,
  track = '#1A1F28',
}: {
  value: number;
  colors?: readonly [string, string] | readonly string[];
  height?: number;
  track?: string;
}) {
  const clamped = Math.max(0, Math.min(1, value));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stops = barColors as any;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: track }]}>
      <LinearGradient
        colors={stops}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          borderRadius: height / 2,
          minWidth: clamped > 0 ? height : 0,
        }}
      />
    </View>
  );
}

export function Chip({
  label,
  glyph,
  tone = colors.neonBlue,
  filled,
  style,
}: {
  label: string;
  glyph?: string;
  tone?: string;
  filled?: boolean;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        styles.chip,
        { borderColor: withAlpha(tone, 0.45), backgroundColor: filled ? withAlpha(tone, 0.18) : 'transparent' },
        style,
      ]}
    >
      {glyph ? <Text style={styles.chipGlyph}>{glyph}</Text> : null}
      <Text style={[styles.chipLabel, { color: filled ? tone : colors.titanium }]}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

export function Hearts({ value, max = 5 }: { value: number; max?: number }) {
  const items = Array.from({ length: max }, (_, i) => i < value);
  return (
    <View style={styles.heartsRow}>
      {items.map((filled, index) => (
        <Text key={index} style={[styles.heart, { opacity: filled ? 1 : 0.25 }]}>
          {filled ? '❤️' : '🖤'}
        </Text>
      ))}
    </View>
  );
}

export function StatChip({ glyph, value, label, tone = colors.neonBlue }: { glyph: string; value: string; label: string; tone?: string }) {
  return (
    <View style={[styles.statChip, { borderColor: withAlpha(tone, 0.35) }]}>
      <Text style={styles.statGlyph}>{glyph}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  buttonShell: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  buttonCompact: {
    alignSelf: 'flex-start',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonFill: {
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  buttonLabel: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.4,
  },
  ghost: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ghostLabel: {
    fontSize: 14,
    fontFamily: fonts.semi,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 6,
  },
  chipGlyph: {
    fontSize: 12,
  },
  chipLabel: {
    fontSize: 12,
    fontFamily: fonts.semi,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  sectionHint: {
    color: colors.titaniumDark,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  heart: {
    fontSize: 12,
  },
  statChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    gap: 2,
  },
  statGlyph: {
    fontSize: 16,
  },
  statValue: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.black,
  },
  statLabel: {
    color: colors.titaniumDark,
    fontSize: 10,
    fontFamily: fonts.semi,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
});
