import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { BadgesScreen } from './src/screens/BadgesScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { ModuleScreen } from './src/screens/ModuleScreen';
import { GameProvider } from './src/store/GameProvider';
import { colors } from './src/theme';

type Route =
  | { name: 'home' }
  | { name: 'module'; moduleId: string }
  | { name: 'lesson'; lessonId: string }
  | { name: 'exam' }
  | { name: 'sprint' }
  | { name: 'badges' }
  | { name: 'library' };

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style="light" />
        <Shell />
      </GameProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const route = stack[stack.length - 1];
  const fade = useRef(new Animated.Value(1)).current;
  const routeKey = JSON.stringify(route);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
  }, [routeKey, fade]);

  const push = useCallback((next: Route) => setStack((current) => [...current, next]), []);
  const back = useCallback(() => setStack((current) => (current.length > 1 ? current.slice(0, -1) : current)), []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <Animated.View style={[styles.screen, { opacity: fade }]} key={routeKey}>
          {route.name === 'home' ? (
            <HomeScreen
              onOpenModule={(moduleId) => push({ name: 'module', moduleId })}
              onOpenLesson={(lessonId) => push({ name: 'lesson', lessonId })}
              onOpenExam={() => push({ name: 'exam' })}
              onOpenSprint={() => push({ name: 'sprint' })}
              onOpenBadges={() => push({ name: 'badges' })}
              onOpenLibrary={() => push({ name: 'library' })}
            />
          ) : null}

          {route.name === 'module' ? (
            <ModuleScreen
              moduleId={route.moduleId}
              onBack={back}
              onOpenLesson={(lessonId) => push({ name: 'lesson', lessonId })}
            />
          ) : null}

          {route.name === 'lesson' ? (
            <LessonScreen
              mode="auto"
              lessonId={route.lessonId}
              onExit={back}
              onGoToExam={() => push({ name: 'exam' })}
            />
          ) : null}

          {route.name === 'exam' ? (
            <LessonScreen mode="exame" onExit={back} />
          ) : null}

          {route.name === 'sprint' ? <LessonScreen mode="sprint" onExit={back} /> : null}

          {route.name === 'badges' ? <BadgesScreen onBack={back} /> : null}

          {route.name === 'library' ? (
            <LibraryScreen onBack={back} onOpenModule={(moduleId) => push({ name: 'module', moduleId })} />
          ) : null}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  screen: {
    flex: 1,
  },
});
