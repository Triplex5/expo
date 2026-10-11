import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

import { colors, withAlpha } from '../theme';

/**
 * Fundo "matte black + neon": gradiente escuro, orbes luminosos e,
 * opcionalmente, a fotografia de topo (mansão/supercar) esbatida.
 */
export function Background({
  children,
  hero,
  accent = colors.neonBlue,
}: {
  children: React.ReactNode;
  hero?: number;
  accent?: string;
}) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#06070A', '#0A0E16', '#0D0A18']} style={StyleSheet.absoluteFill} />
      <View style={[styles.orb, styles.orbTop, { backgroundColor: withAlpha(accent, 0.22) }]} />
      <View style={[styles.orb, styles.orbBottom, { backgroundColor: withAlpha('#7A5CFF', 0.18) }]} />
      {hero ? (
        <ImageBackground source={hero} style={styles.hero} imageStyle={styles.heroImage}>
          <LinearGradient
            colors={['rgba(6,7,10,0.15)', 'rgba(6,7,10,0.75)', '#06070A']}
            style={StyleSheet.absoluteFill}
          />
        </ImageBackground>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
  },
  hero: {
    height: 220,
    width: '100%',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  orb: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.5,
  },
  orbTop: {
    top: -160,
    right: -120,
  },
  orbBottom: {
    bottom: -180,
    left: -140,
  },
});
