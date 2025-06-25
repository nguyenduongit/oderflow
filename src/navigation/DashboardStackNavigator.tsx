// src/navigation/DashboardStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '@/screens/(dashboard)/DashboardScreen';
import OrderDetailsScreen from '@/screens/(dashboard)/OrderDetailsScreen';

export type DashboardStackParamList = {
  TableLayoutList: undefined;
  OrderDetails: { tableId: string; tableNumber: number };
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
        <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={({ route }) => ({ title: `Chi tiết Bàn ${route.params.tableNumber}` })}
      />
    </Stack.Navigator>
  );
}