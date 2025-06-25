// src/navigation/DashboardNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, BookOpen, Settings, BarChart2 } from 'lucide-react-native';

// THAY ĐỔI: Import DashboardStackNavigator
import DashboardStackNavigator from './DashboardStackNavigator';
import MenuStackNavigator from './MenuStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import AnalyticsScreen from '@/screens/(dashboard)/AnalyticsScreen';

const { Navigator, Screen } = createBottomTabNavigator();

function CustomTabBar({ state, descriptors, navigation }: any) {
  const icons: { [key: string]: React.ReactNode } = {
      // THAY ĐỔI: Cập nhật tên route
      DashboardStack: <Home size={24} color={state.index === 0 ? '#2563EB' : '#6B7280'} />,
      MenuStack: <BookOpen size={24} color={state.index === 1 ? '#2563EB' : '#6B7280'} />,
      Analytics: <BarChart2 size={24} color={state.index === 2 ? '#2563EB' : '#6B7280'} />,
      SettingsStack: <Settings size={24} color={state.index === 3 ? '#2563EB' : '#6B7280'} />,
  };

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel as string;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabButton}
          >
            {icons[route.name]}
            <Text style={{ color: isFocused ? '#2563EB' : '#6B7280', fontSize: 12, marginTop: 4 }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function DashboardNavigator() {
  return (
    <Navigator
        screenOptions={{ headerShown: false }}
        tabBar={props => <CustomTabBar {...props} />}
    >
      {/* THAY ĐỔI: Component của tab đầu tiên bây giờ là DashboardStackNavigator */}
      <Screen
        name="DashboardStack"
        component={DashboardStackNavigator}
        options={{ tabBarLabel: 'Sơ đồ bàn' }}
      />
      <Screen
        name="MenuStack"
        component={MenuStackNavigator}
        options={{ tabBarLabel: 'Menu' }}
      />
      <Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Thống kê' }}
      />
      <Screen
        name="SettingsStack"
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Cài đặt' }}
      />
    </Navigator>
  );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        height: 65,
        paddingBottom: 5,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});