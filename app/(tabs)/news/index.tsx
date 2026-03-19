import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useArticles } from '@/hooks/useArticles';
import { useRssFeed } from '@/hooks/useRssFeed';
import { ArticleCard } from '@/components/ArticleCard';
import { SectionHeader } from '@/components/SectionHeader';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/EmptyState';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';
import { spacing, SCREEN_WIDTH, borderRadius } from '@/constants/spacing';
import { Article, RssItem } from '@/types';

type FeedItem =
  | { type: 'rss-header' }
  | { type: 'sweetspot-header' }
  | { type: 'rss'; item: RssItem }
  | { type: 'article'; item: Article };

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function NewsScreen() {
  const router = useRouter();
  const {
    articles,
    isLoading: articlesLoading,
    refetch: refetchArticles,
  } = useArticles();
  const {
    items: rssItems,
    isLoading: rssLoading,
    refetch: refetchRss,
  } = useRssFeed();

  const isLoading = articlesLoading && rssLoading;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const feedData = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [];

    if (rssItems.length > 0) {
      items.push({ type: 'rss-header' });
      rssItems.slice(0, 10).forEach((item) => {
        items.push({ type: 'rss', item });
      });
    }

    if (articles.length > 0) {
      items.push({ type: 'sweetspot-header' });
      articles.forEach((item) => {
        items.push({ type: 'article', item });
      });
    }

    return items;
  }, [rssItems, articles]);

  const handleRssPress = useCallback(async (item: RssItem) => {
    if (item.link) {
      await WebBrowser.openBrowserAsync(item.link);
    }
  }, []);

  const handleArticlePress = useCallback(
    async (article: Article) => {
      if (article.type === 'EXTERNAL' && article.link) {
        await WebBrowser.openBrowserAsync(article.link);
      } else {
        router.push({
          pathname: '/(tabs)/news/[articleId]',
          params: { articleId: article.id },
        });
      }
    },
    [router],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([refetchArticles(), refetchRss()]);
    setIsRefreshing(false);
  }, [refetchArticles, refetchRss]);

  const getItemKey = (item: FeedItem, index: number): string => {
    switch (item.type) {
      case 'rss-header':
        return 'rss-header';
      case 'sweetspot-header':
        return 'sweetspot-header';
      case 'rss':
        return `rss-${item.item.id}`;
      case 'article':
        return `article-${item.item.id}`;
      default:
        return String(index);
    }
  };

  const renderItem = ({ item }: { item: FeedItem }) => {
    switch (item.type) {
      case 'rss-header':
        return <SectionHeader title="Latest News" />;
      case 'sweetspot-header':
        return <SectionHeader title="From SweetSpot" />;
      case 'rss':
        return (
          <ArticleCard
            title={item.item.title}
            imageUrl={item.item.imageUrl}
            date={formatDate(item.item.publishedDate)}
            source={item.item.source}
            onPress={() => handleRssPress(item.item)}
          />
        );
      case 'article':
        return (
          <ArticleCard
            title={item.item.title}
            imageUrl={item.item.image}
            date={formatDate(item.item.date)}
            source="SweetSpot"
            description={item.item.description}
            onPress={() => handleArticlePress(item.item)}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Text style={styles.screenTitle}>News</Text>
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonLoader
              key={i}
              width={SCREEN_WIDTH - spacing.lg * 2}
              height={100}
              radius={borderRadius.md}
              style={styles.skeletonItem}
            />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.screenTitle}>News</Text>
      <FlatList
        data={feedData}
        keyExtractor={getItemKey}
        renderItem={renderItem}
        ListEmptyComponent={
          <EmptyState
            title="No news available"
            subtitle="Check back later for the latest golf news"
            icon="newspaper-variant-outline"
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenTitle: {
    ...typography.title2,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  skeletonList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  skeletonItem: {
    alignSelf: 'center',
  },
});
