import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing } from '@/constants/spacing';
import { useAppStore } from '@/stores/appStore';

export default function OnboardingScreen() {
  const router = useRouter();
  const setOnboardingComplete = useAppStore((s) => s.setOnboardingComplete);

  const handleGetStarted = () => {
    setOnboardingComplete(true);
    router.replace('/(tabs)/learn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="golf" size={96} color={colors.accent} />
        <Text style={styles.title}>Welcome to SweetSpot</Text>
        <Text style={styles.description}>
          Improve your golf game with lessons from PGA and European Tour
          professionals.
        </Text>
      </View>
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
    marginTop: spacing.xxl,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});
