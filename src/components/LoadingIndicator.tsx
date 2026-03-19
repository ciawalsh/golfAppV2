import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';

interface LoadingIndicatorProps {
  size?: number;
  variant?: 'light' | 'dark';
}

const animations = {
  light: require('../../assets/animations/loadingLight.json'),
  dark: require('../../assets/animations/loadingDark.json'),
};

export function LoadingIndicator({
  size = 120,
  variant = 'light',
}: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={animations[variant]}
        autoPlay
        loop
        style={{ width: size, height: size }}
      />
    </View>
  );
}

/** Simpler fallback for contexts where Lottie may not be available */
export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <ActivityIndicator
      size={size > 30 ? 'large' : 'small'}
      color={colors.accent}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
