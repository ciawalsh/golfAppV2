import { useQuery } from '@tanstack/react-query';
import * as rssParser from 'react-native-rss-parser';
import { RssItem } from '@/types';

interface RssSource {
  url: string;
  name: string;
}

const RSS_SOURCES: RssSource[] = [
  { url: 'https://golf.com/feed/', name: 'Golf.com' },
  { url: 'https://www.golfmonthly.com/feeds/all', name: 'Golf Monthly' },
];

async function fetchSingleFeed(source: RssSource): Promise<RssItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: { Accept: 'application/rss+xml, application/xml, text/xml' },
    });
    if (!response.ok) return [];

    const text = await response.text();
    const parsed = await rssParser.parse(text);

    return parsed.items.slice(0, 15).map((item, idx) => {
      // Try to extract image from various RSS fields
      let imageUrl: string | undefined;
      if (item.enclosures?.[0]?.url) {
        imageUrl = item.enclosures[0].url;
      }

      return {
        id: item.id || `${source.name}_${idx}`,
        title: item.title ?? '',
        link: item.links?.[0]?.url ?? '',
        description: item.description,
        imageUrl,
        publishedDate: item.published ?? '',
        source: source.name,
      };
    });
  } catch (err) {
    if (__DEV__) {
      console.warn(`[RSS] Failed to fetch ${source.name}:`, err);
    }
    return [];
  }
}

async function fetchAllFeeds(): Promise<RssItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSingleFeed(source)),
  );

  const allItems: RssItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // Sort by date (newest first), with fallback for missing dates
  return allItems.sort((a, b) => {
    const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
    const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
    return dateB - dateA;
  });
}

export function useRssFeed() {
  const query = useQuery({
    queryKey: ['rss-feed'],
    queryFn: fetchAllFeeds,
    staleTime: 15 * 60 * 1000, // 15 minutes
    retry: 1, // RSS sources can be flaky
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
