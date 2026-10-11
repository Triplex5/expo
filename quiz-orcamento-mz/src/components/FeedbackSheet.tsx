import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, withAlpha } from '../theme';
import { NeonButton } from './ui';

/**
 * Barra de feedback estilo Duolingo: 1 linha de explicação + botão CONTÍNUAR.
 * Nunca apresenta texto longo — só o "porquê" essencial e a norma de suporte.
 */
export function FeedbackSheet({
  correct,
  feedback,
  source,
  onContinue,
  continueLabel = 'CONTINUAR',
  accent = colors.neonBlue,
  extra,
}: {
  correct: boolean;
  feedback: string;
  source?: string;
  onContinue: () => void;
  continueLabel?: string;
  accent?: string;
  extra?: React.ReactNode;
}) {
  const tone = correct ? colors.success : colors.danger;
  return (
    <View style={[styles.sheet, { borderTopColor: withAlpha(tone, 0.6), backgroundColor: withAlpha('#0B0D12', 0.97) }]}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: withAlpha(tone, 0.18), borderColor: tone }]}>
          <Text style={[styles.badgeLabel, { color: tone }]}>{correct ? 'CERTO' : 'REVER'}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.feedback} numberOfLines={3}>
            {feedback}
          </Text>
          {source ? <Text style={styles.source}>{source}</Text> : null}
        </View>
      </View>
      {extra}
      <NeonButton
        label={continueLabel}
        onPress={onContinue}
        gradient={[tone, correct ? accent : '#FF8A3D']}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderTopWidth: 2,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  badge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontSize: 11,
    fontFamily: fonts.black,
    letterSpacing: 1,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  feedback: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.semi,
    lineHeight: 20,
  },
  source: {
    color: colors.titaniumDark,
    fontSize: 11,
    fontFamily: fonts.medium,
  },
  cta: {
    marginTop: spacing.xs,
  },
});
