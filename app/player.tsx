import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoCommentThread } from '@/components/VideoCommentThread';
import { VideoPlayer } from '@/components/VideoPlayer';

// TODO: Discussion bubble icon in header (Sprint 4 polish)
// TODO: Up Next row for related videos (Sprint 5)

export default function PlayerScreen() {
  const { videoId, videoUrl, title, coachName } = useLocalSearchParams<{
    videoId?: string;
    videoUrl: string;
    title: string;
    coachName?: string;
  }>();
  const router = useRouter();
  const hasVideoId = typeof videoId === 'string' && videoId.length > 0;

  return (
    <VideoPlayer
      videoUrl={videoUrl ?? ''}
      title={title ?? 'Video'}
      coachName={coachName}
      onClose={() => router.back()}
    >
      {hasVideoId ? <VideoCommentThread videoId={videoId} /> : null}
    </VideoPlayer>
  );
}
