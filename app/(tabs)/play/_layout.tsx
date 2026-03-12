import { Stack } from 'expo-router';

export default function PlayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="select-course" />
      <Stack.Screen name="select-tee" />
      <Stack.Screen name="round/[roundId]" />
      <Stack.Screen name="round-detail/[roundId]" />
      <Stack.Screen name="shot-tracker" />
    </Stack>
  );
}
