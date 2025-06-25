// src/navigation/DashboardStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '@/screens/(dashboard)/DashboardScreen';

export type DashboardStackParamList = {
  TableLayoutList: undefined;
  // Thêm các màn hình chi tiết ở đây sau, ví dụ: OrderDetails: { tableId: string }
};

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStackNavigator() {
  return (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#111827',
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: true,
        }}
    >
      <Stack.Screen
        name="TableLayoutList"
        component={DashboardScreen}
        options={{ title: 'Sơ đồ bàn' }} // Đặt tiêu đề cho header ở đây
      />
    </Stack.Navigator>
  );
}