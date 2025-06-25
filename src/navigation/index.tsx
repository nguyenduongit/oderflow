// src/navigation/index.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useUser } from '@/hooks/useUser';
import AuthScreen from '@/screens/(auth)/AuthScreen';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import DashboardNavigator from './DashboardNavigator';
import OrderingNavigator from './OrderingNavigator';

const prefix = Linking.createURL('/');

export type RootStackParamList = {
  Auth: undefined;
  Dashboard: undefined;
  // Sửa lại kiểu dữ liệu của route Ordering để linh hoạt hơn
  Ordering: { screen: string, params?: { tableId: string } };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const SplashScreen = () => (
    <View style={styles.splashContainer}><ActivityIndicator size='large' color="#3B82F6" /></View>
);

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useUser();

  // --- THAY ĐỔI QUAN TRỌNG Ở ĐÂY ---
  const linking = {
    prefixes: [prefix],
    config: {
        screens: {
            // Định nghĩa luồng cha
            Ordering: {
                path: 'ordering', // Đường dẫn cơ sở
                screens: {
                    // Định nghĩa các màn hình con bên trong
                    StartSession: ':tableId', // Nối vào đường dẫn cha -> "ordering/:tableId"
                },
            },
            // Bạn có thể thêm các route khác ở đây
            // Dashboard: 'dashboard',
        },
    },
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer linking={linking} fallback={<Text>Đang tải...</Text>}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
           <Stack.Group>
             <Stack.Screen name="Dashboard" component={DashboardNavigator} />
             <Stack.Screen name="Ordering" component={OrderingNavigator} />
           </Stack.Group>
        ) : (
           <Stack.Group>
             <Stack.Screen name="Auth" component={AuthScreen} />
             <Stack.Screen name="Ordering" component={OrderingNavigator} />
           </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});