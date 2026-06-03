import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { AppText } from './AppText';
import { useUnreadMessageCount } from '../../lib/apiHooks';

const { width } = Dimensions.get('window');

const TAB_BAR_WIDTH = width - 48; // 24px padding on each side
const TAB_ITEM_WIDTH = TAB_BAR_WIDTH / 5; // 5 tabs

export function PremiumTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useThemeColors();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 16);
  const { data: unread } = useUnreadMessageCount();

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={[
        styles.tabBar,
        { backgroundColor: theme.isDark ? '#231F35' : '#FFFFFF', borderColor: theme.border },
        theme.isDark ? Shadow.md : Shadow.lg,
      ]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
          if (route.name === 'marketplace') iconName = isFocused ? 'compass' : 'compass-outline';
          if (route.name === 'teams') iconName = isFocused ? 'people' : 'people-outline';
          if (route.name === 'messages') iconName = isFocused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              iconName={iconName}
              onPress={onPress}
              onLongPress={onLongPress}
              badgeCount={route.name === 'messages' ? unread : undefined}
            />
          );
        })}
      </View>
    </View>
  );
}

interface TabItemProps {
  isFocused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  onLongPress: () => void;
  badgeCount?: number;
}

function TabItem({ isFocused, iconName, onPress, onLongPress, badgeCount }: TabItemProps) {
  const theme = useThemeColors();
  const progress = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPressIn={() => {
        Animated.spring(scale, { toValue: 0.85, friction: 5, tension: 150, useNativeDriver: true }).start();
      }}
      onPressOut={() => {
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 150, useNativeDriver: true }).start();
      }}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={1}
    >
      <Animated.View style={[styles.iconContainer, { transform: [{ translateY }, { scale }] }]}>
        <Ionicons
          name={iconName}
          size={24}
          color={isFocused ? Colors.brand : theme.textTertiary}
        />
        {!!badgeCount && badgeCount > 0 && (
          <View style={styles.badgeContainer}>
            <AppText style={styles.badgeText}>{badgeCount}</AppText>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent', // Make container transparent so it floats
  },
  tabBar: {
    flexDirection: 'row',
    width: TAB_BAR_WIDTH,
    height: 64,
    borderRadius: Radius.full,
    borderWidth: 0.5,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tabItem: {
    width: TAB_ITEM_WIDTH - 4,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Outfit_700Bold',
  },
});
