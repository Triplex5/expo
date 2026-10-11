import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import type { BadgeDef } from '../types';
import { colors, fonts, radius, spacing, withAlpha } from '../theme';

const TIER_TONES: Record<BadgeDef['tier'], [string, string]> = {
  bronze: ['#C97B3D', '#8A4F1F'],
  prata: ['#C7D0DC', '#7E8894'],
  ouro: ['#FFD166', '#FF9F1C'],
  neon: ['#2ED8FF', '#7A5CFF'],
};

export function BadgeChip({ badge, unlocked, size = 68 }: { badge: BadgeDef; unlocked: boolean; size?: number }) {
  const tones = TIER_TONES[badge.tier];
  return (
    <View style={[styles.wrapper, { width: size + 24 }]}>
      <LinearGradient
        colors={unlocked ? tones : ['#1A1F28', '#12161D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.medal,
          { width: size, height: size, borderRadius: size / 2, opacity: unlocked ? 1 : 0.55 },
        ]}
      >
        <Text style={[styles.glyph, { fontSize: size * 0.42 }]}>{unlocked ? badge.glyph : '🔒'}</Text>
      </LinearGradient>
      <Text style={[styles.name, { color: unlocked ? colors.white : colors.titaniumDark }]} numberOfLines={2}>
        {badge.name}
      </Text>
    </View>
  );
}

export function BadgeStrip({ badges, size = 54 }: { badges: BadgeDef[]; size?: number }) {
  return (
    <View style={styles.strip}>
      {badges.map((badge) => {
        const tones = TIER_TONES[badge.tier];
        return (
          <LinearGradient
            key={badge.id}
            colors={tones}
            style={[
              styles.mini,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <Text style={{ fontSize: size * 0.45 }}>{badge.glyph}</Text>
          </LinearGradient>
        );
      })}
    </View>
  );
}

export function LockedBadgePill({ badge }: { badge: BadgeDef }) {
  return (
    <View style={[styles.locked, { borderColor: withAlpha('#7A5CFF', 0.35) }]}>
      <Text style={styles.lockedGlyph}>🔒</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.lockedName}>{badge.name}</Text>
        <Text style={styles.lockedDesc}>{badge.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  medal: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    color: colors.white,
  },
  name: {
    fontSize: 11,
    fontFamily: fonts.semi,
    textAlign: 'center',
    lineHeight: 14,
  },
  strip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mini: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.bgElevated,
  },
  lockedGlyph: {
    fontSize: 20,
  },
  lockedName: {
    color: colors.titanium,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  lockedDesc: {
    color: colors.titaniumDark,
    fontSize: 11,
    fontFamily: fonts.medium,
  },
});
