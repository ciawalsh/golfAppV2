declare module 'react-native-rss-parser' {
  interface RssEnclosure {
    url: string;
    type?: string;
    length?: string;
  }

  interface RssLink {
    url: string;
    rel?: string;
  }

  interface RssItem {
    id: string;
    title: string;
    description?: string;
    published?: string;
    links?: RssLink[];
    enclosures?: RssEnclosure[];
    authors?: { name: string }[];
    categories?: string[];
  }

  interface RssFeed {
    title: string;
    description?: string;
    links?: RssLink[];
    items: RssItem[];
  }

  export function parse(xml: string): Promise<RssFeed>;
}
