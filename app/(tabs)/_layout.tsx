import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { typography } from '@/constants/typography';

type TabIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const TAB_CONFIG: {
  name: string;
  title: string;
  icon: TabIcon;
}[] = [
  { name: 'learn', title: 'Learn', icon: 'book-open-variant' },
  { name: 'play', title: 'Play', icon: 'golf-tee' },
  { name: 'community', title: 'Community', icon: 'account-group' },
  { name: 'news', title: 'News', icon: 'newspaper-variant' },
  { name: 'more', title: 'More', icon: 'dots-horizontal' },
];

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBackground,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          ...typography.tabLabel,
        },
      }}
    >
      {TAB_CONFIG.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name={tab.icon}
                color={color}
                size={size}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
