/**
 * VideoPlayer component using expo-video (SDK 55+).
 *
 * Decision: expo-video chosen over expo-av because expo-av is deprecated
 * and removed in SDK 55. expo-video provides a simpler API via useVideoPlayer
 * hook, better performance, and native player controls.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/video/
 */
import {
  useEffect,
  useCallback,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { View, Text, Pressable, StyleSheet, AppState } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resolveStorageUrl, clearUrlCache } from '@/services/storageUrl';
import { LoadingSpinner } from '@/components/LoadingIndicator';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { borderRadius, spacing } from '@/constants/spacing';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  coachName?: string;
  onClose: () => void;
  children?: ReactNode;
}

export function VideoPlayer({
  videoUrl,
  title,
  coachName,
  onClose,
  children,
}: VideoPlayerProps) {
  const insets = useSafeAreaInsets();
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);
  const [resolveError, setResolveError] = useState(false);
  const isMountedRef = useRef(true);
  const hasBody = children != null;

  // Resolve gs:// URLs on mount
  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;

    async function resolve() {
      try {
        const url = await resolveStorageUrl(videoUrl);
        if (!cancelled && isMountedRef.current) {
          if (url) {
            setResolvedUrl(url);
          } else {
            setResolveError(true);
          }
        }
      } catch {
        if (!cancelled && isMountedRef.current) {
          setResolveError(true);
        }
      } finally {
        if (!cancelled && isMountedRef.current) {
          setIsResolving(false);
        }
      }
    }

    resolve();
    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [videoUrl]);

  const handleRetry = useCallback(() => {
    setResolveError(false);
    setIsResolving(true);
    setResolvedUrl(null);
    // Clear cache so we get a fresh URL from the SDK
    clearUrlCache();
    resolveStorageUrl(videoUrl).then((url) => {
      if (isMountedRef.current) {
        if (url) {
          setResolvedUrl(url);
        } else {
          setResolveError(true);
        }
        setIsResolving(false);
      }
    });
  }, [videoUrl]);

  if (isResolving) {
    return (
      <View style={styles.container}>
        <View style={[styles.playerSection, styles.playerSectionFull]}>
          <Header
            title={title}
            coachName={coachName}
            onClose={onClose}
            topInset={insets.top}
          />
          <View style={styles.centered}>
            <LoadingSpinner size={48} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (resolveError || !resolvedUrl) {
    return (
      <View style={styles.container}>
        <View style={[styles.playerSection, styles.playerSectionFull]}>
          <Header
            title={title}
            coachName={coachName}
            onClose={onClose}
            topInset={insets.top}
          />
          <PlaybackErrorState onRetry={handleRetry} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.playerSection, !hasBody && styles.playerSectionFull]}
      >
        <Header
          title={title}
          coachName={coachName}
          onClose={onClose}
          topInset={insets.top}
        />
        <PlayerView url={resolvedUrl} expanded={!hasBody} />
      </View>
      {hasBody ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

function Header({
  title,
  coachName,
  onClose,
  topInset,
}: {
  title: string;
  coachName?: string;
  onClose: () => void;
  topInset: number;
}) {
  return (
    <View style={[styles.header, { paddingTop: topInset + spacing.sm }]}>
      <Pressable style={styles.closeButton} onPress={onClose} hitSlop={8}>
        <MaterialCommunityIcons
          name="close"
          size={24}
          color={colors.textPrimary}
        />
      </Pressable>
      <View style={styles.headerInfo}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {coachName ? (
          <Text style={styles.coachName} numberOfLines={1}>
            {coachName}
          </Text>
        ) : null}
      </View>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function PlayerView({ url, expanded }: { url: string; expanded: boolean }) {
  // Use VideoSourceObject so AVPlayer gets a content-type hint for
  // Firebase Storage URLs that lack a file extension.
  const source = useMemo(
    () => ({ uri: url, contentType: 'auto' as const }),
    [url],
  );

  const player = useVideoPlayer(source, (p) => {
    p.play();
  });

  // Pause on background, resume on foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        player.play();
      } else {
        player.pause();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player]);

  return (
    <View
      style={[
        styles.playerContainer,
        expanded && styles.playerContainerExpanded,
      ]}
    >
      <VideoView
        player={player}
        style={styles.player}
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

function PlaybackErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.centered}>
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={48}
        color={colors.error}
      />
      <Text style={styles.loadingText}>Failed to load video.</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <MaterialCommunityIcons
          name="refresh"
          size={18}
          color={colors.textPrimary}
        />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  playerSection: {
    backgroundColor: colors.videoPlayerBg,
  },
  playerSectionFull: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerSpacer: {
    width: 36,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  coachName: {
    ...typography.caption1,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.callout,
    color: colors.textSecondary,
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
  playerContainer: {
    justifyContent: 'center',
    paddingBottom: spacing.lg,
  },
  playerContainerExpanded: {
    flex: 1,
  },
  player: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
});
