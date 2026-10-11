import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Feedback táctil com degradação suave:
 * em web (ou sem suporte) as chamadas são silenciosamente ignoradas.
 */
function safe(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return;
  fn().catch(() => undefined);
}

export const haptics = {
  tap: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  media: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  error: () => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  select: () => safe(() => Haptics.selectionAsync()),
};
