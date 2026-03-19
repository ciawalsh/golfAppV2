import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import {
  GlassView,
  isLiquidGlassAvailable,
  isGlassEffectAPIAvailable,
} from 'expo-glass-effect';
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
          backgroundColor:
            Platform.OS === 'ios' ? 'transparent' : colors.tabBackground,
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          position: 'absolute',
          elevation: 0,
        },
        tabBarBackground: () => {
          if (
            Platform.OS === 'ios' &&
            isLiquidGlassAvailable() &&
            isGlassEffectAPIAvailable()
          ) {
            return (
              <GlassView
                style={StyleSheet.absoluteFill}
                glassEffectStyle="regular"
              />
            );
          }
          return (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: 'rgba(20,20,20,0.85)' },
              ]}
            />
          );
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
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ alignItems: 'center' }}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  color={color}
                  size={size}
                />
                {focused && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: '#FFFFFF',
                      marginTop: 2,
                    }}
                  />
                )}
              </View>
            ),
            tabBarLabel: ({ focused, color }) =>
              focused ? (
                <Text style={[typography.tabLabel, { color }]}>
                  {tab.title}
                </Text>
              ) : (
                <Text style={{ fontSize: 0 }}>{''}</Text>
              ),
          }}
        />
      ))}
    </Tabs>
  );
}
