import { Stack } from 'expo-router';

export default function LearnLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tips" />
      <Stack.Screen name="dormy" />
      <Stack.Screen name="coach/[coachId]" />
      <Stack.Screen name="course/[courseId]" />
    </Stack>
  );
}
