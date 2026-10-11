import { Platform } from 'react-native';

/**
 * Design system "Titanium & Neon".
 * Inspiração: arquitectura minimalista de luxo (matte black / titânio) +
 * iluminação neon azul-violeta de supercars em estúdio escuro.
 */
export const colors = {
  bg: '#06070A',
  bgElevated: '#0B0D12',
  surface: '#101319',
  surfaceAlt: '#161A22',
  border: '#242B37',
  borderStrong: '#323B4B',

  white: '#FFFFFF',
  titanium: '#8B96A8',
  titaniumDark: '#5A6474',

  neonBlue: '#2ED8FF',
  neonViolet: '#7A5CFF',
  neonMagenta: '#C04CFF',

  success: '#27E08A',
  danger: '#FF4D6D',
  warn: '#FFB020',
  gold: '#FFD166',

  overlay: 'rgba(6,7,10,0.72)',
} as const;

export const gradients = {
  screen: ['#06070A', '#0A0E16', '#0D0A18'] as const,
  neon: [colors.neonBlue, colors.neonViolet] as const,
  neonSoft: ['#123246', '#241C4A'] as const,
  gold: ['#FFD166', '#FF9F1C'] as const,
  success: ['#27E08A', '#12B5A0'] as const,
  twilight: ['#0B0D12', '#1A1130'] as const,
} as const;

export const moduleAccents = {
  azul: ['#2ED8FF', '#2E6BFF'] as [string, string],
  violeta: ['#7A5CFF', '#B14CFF'] as [string, string],
  magenta: ['#C04CFF', '#7A5CFF'] as [string, string],
  ciano: ['#2ED8FF', '#27E08A'] as [string, string],
  ouro: ['#FFD166', '#FF8A3D'] as [string, string],
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const fonts = {
  /** Pesos usados em todo o app (fontes do sistema para não bloquear o bundle). */
  black: '800' as const,
  bold: '700' as const,
  semi: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const shadow = {
  neon: (color: string, opacity = 0.5, radiusPx = 18) =>
    Platform.select({
      web: { boxShadow: `0 0 ${radiusPx}px ${color}${Math.round(opacity * 99)
        .toString(16)
        .padStart(2, '0')}` as unknown as undefined },
      default: {
        shadowColor: color,
        shadowOpacity: opacity,
        shadowRadius: radiusPx,
        shadowOffset: { width: 0, height: 0 },
        elevation: 8,
      },
    }) ?? {},
};

/** Converte "#RRGGBB" + alpha em rgba(). */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const value = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
