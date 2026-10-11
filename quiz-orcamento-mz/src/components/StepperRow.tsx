import { StyleSheet, Text, View } from 'react-native';

import type { QuestionPart } from '../types';
import { colors, fonts, radius, spacing, withAlpha } from '../theme';

/**
 * Mostra as etapas da pergunta multi-partes.
 * O jogador vê exactamente quantas partes faltam e qual está activa.
 */
export function StepperRow({
  parts,
  activeIndex,
  accent,
  solvedIndexes,
}: {
  parts: QuestionPart[];
  activeIndex: number;
  accent: string;
  solvedIndexes: number[];
}) {
  return (
    <View style={styles.row}>
      {parts.map((part, index) => {
        const solved = solvedIndexes.includes(index);
        const active = index === activeIndex;
        const tone = solved ? colors.success : active ? accent : colors.borderStrong;
        return (
          <View key={part.label + index} style={styles.item}>
            <View
              style={[
                styles.dot,
                {
                  borderColor: tone,
                  backgroundColor: solved || active ? withAlpha(tone, 0.2) : 'transparent',
                },
              ]}
            >
              <Text style={[styles.dotLabel, { color: tone }]}>{solved ? '✓' : index + 1}</Text>
            </View>
            <Text
              style={[
                styles.label,
                { color: active ? colors.white : colors.titaniumDark },
                active && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {part.label}
            </Text>
            {index < parts.length - 1 ? <View style={[styles.line, { backgroundColor: withAlpha(tone, 0.5) }]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: {
    fontSize: 12,
    fontFamily: fonts.black,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.semi,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  labelActive: {
    fontSize: 11,
  },
  line: {
    position: 'absolute',
    top: 15,
    right: -8,
    height: 1.5,
    width: 16,
    borderRadius: radius.pill,
  },
});
