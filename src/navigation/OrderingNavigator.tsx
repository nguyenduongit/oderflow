// src/navigation/OrderingNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StartSessionScreen from '@/screens/(ordering)/StartSessionScreen';
import OrderingMenuScreen from '@/screens/(ordering)/OrderingMenuScreen';

export type OrderingStackParamList = {
    // Không cần màn hình Scanner nữa vì chúng ta sẽ vào thẳng từ URL
    StartSession: { tableId: string };
    OrderingMenu: { tableId: string; sessionId: string };
};

const Stack = createNativeStackNavigator<OrderingStackParamList>();

export default function OrderingNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="StartSession" component={StartSessionScreen} />
            <Stack.Screen name="OrderingMenu" component={OrderingMenuScreen} />
        </Stack.Navigator>
    );
}