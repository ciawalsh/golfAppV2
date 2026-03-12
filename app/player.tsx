import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoPlayer } from '@/components/VideoPlayer';

export default function PlayerScreen() {
  const { videoUrl, title, coachName } = useLocalSearchParams<{
    videoUrl: string;
    title: string;
    coachName?: string;
  }>();
  const router = useRouter();

  return (
    <VideoPlayer
      videoUrl={videoUrl ?? ''}
      title={title ?? 'Video'}
      coachName={coachName}
      onClose={() => router.back()}
    />
  );
}
