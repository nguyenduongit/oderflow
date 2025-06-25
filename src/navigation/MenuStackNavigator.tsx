// src/navigation/MenuStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MenuScreen from '@/screens/(dashboard)/MenuScreen';
import CategoryManagerScreen from '@/screens/(dashboard)/CategoryManagerScreen';
import MenuItemFormScreen from '@/screens/(dashboard)/MenuItemFormScreen';

export type MenuStackParamList = {
  MenuList: undefined;
  CategoryManager: undefined;
  MenuItemForm: { itemId?: string } | undefined;
};

const Stack = createNativeStackNavigator<MenuStackParamList>();

export default function MenuStackNavigator() {
  return (
    <Stack.Navigator
        screenOptions={{
            // Style header đơn giản, không phụ thuộc theme
            headerStyle: {
                backgroundColor: '#FFFFFF',
            },
            headerTintColor: '#111827', // Màu chữ đen
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerShadowVisible: true, // Hiển thị đường viền mờ
        }}
    >
      <Stack.Screen
        name="MenuList"
        component={MenuScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CategoryManager"
        component={CategoryManagerScreen}
        options={{ title: 'Quản lý Danh mục' }}
      />
      <Stack.Screen
        name="MenuItemForm"
        component={MenuItemFormScreen}
        options={{
            presentation: 'modal',
            title: 'Thông tin Món ăn'
        }}
      />
    </Stack.Navigator>
  );
}