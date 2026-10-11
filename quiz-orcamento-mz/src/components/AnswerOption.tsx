import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { haptics } from '../haptics';
import { colors, fonts, radius, shadow, spacing, withAlpha } from '../theme';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'muted';

export function AnswerOption({
  label,
  index,
  state,
  onPress,
  disabled,
  accent = colors.neonBlue,
}: {
  label: string;
  index: number;
  state: OptionState;
  onPress: () => void;
  disabled?: boolean;
  accent?: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'correct' || state === 'wrong') {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.02, duration: 110, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [state, scale]);

  const palette = (() => {
    switch (state) {
      case 'selected':
        return { border: accent, bg: withAlpha(accent, 0.14), text: colors.white };
      case 'correct':
        return { border: colors.success, bg: withAlpha(colors.success, 0.16), text: colors.white };
      case 'wrong':
        return { border: colors.danger, bg: withAlpha(colors.danger, 0.16), text: colors.white };
      case 'muted':
        return { border: colors.border, bg: 'transparent', text: colors.titaniumDark };
      default:
        return { border: colors.borderStrong, bg: colors.surface, text: colors.white };
    }
  })();

  const badge = ['A', 'B', 'C', 'D'][index] ?? '•';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={() => {
          haptics.tap();
          onPress();
        }}
        disabled={disabled}
        style={[
          styles.option,
          {
            borderColor: palette.border,
            backgroundColor: palette.bg,
            opacity: state === 'muted' ? 0.6 : 1,
          },
          state === 'selected' ? shadow.neon(accent, 0.35, 14) : null,
          state === 'correct' ? shadow.neon(colors.success, 0.35, 14) : null,
          state === 'wrong' ? shadow.neon(colors.danger, 0.35, 14) : null,
        ]}
      >
        <View
          style={[
            styles.bullet,
            {
              borderColor: state === 'idle' ? withAlpha(accent, 0.6) : palette.border,
              backgroundColor: state === 'idle' ? withAlpha(accent, 0.12) : withAlpha(palette.border, 0.18),
            },
          ]}
        >
          <Text style={[styles.bulletLabel, { color: state === 'idle' ? accent : palette.border }]}>{badge}</Text>
        </View>
        <Text
          style={[styles.label, { color: palette.text }]}
          numberOfLines={3}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  bullet: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletLabel: {
    fontSize: 14,
    fontFamily: fonts.black,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.semi,
    lineHeight: 21,
  },
});
