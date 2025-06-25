// src/navigation/SettingsStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SettingsScreen from '@/screens/(dashboard)/SettingsScreen';
import RestaurantInfoScreen from '@/screens/(dashboard)/RestaurantInfoScreen';
import QrCodeScreen from '@/screens/(dashboard)/QrCodeScreen';
import SubscriptionScreen from '@/screens/(dashboard)/SubscriptionScreen';

export type SettingsStackParamList = {
  SettingsList: undefined;
  RestaurantInfo: undefined;
  QrCode: undefined;
  Subscription: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#111827',
            headerTitleStyle: { fontWeight: 'bold' },
        }}
    >
      <Stack.Screen
        name="SettingsList"
        component={SettingsScreen}
        options={{ headerShown: false }} // Màn hình gốc sẽ có header tùy chỉnh
      />
      <Stack.Screen
        name="RestaurantInfo"
        component={RestaurantInfoScreen}
        options={{ title: 'Thông tin quán' }}
      />
      <Stack.Screen
        name="QrCode"
        component={QrCodeScreen}
        options={{ title: 'Quản lý mã QR' }}
      />
       <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Gói đăng ký' }}
      />
    </Stack.Navigator>
  );
}