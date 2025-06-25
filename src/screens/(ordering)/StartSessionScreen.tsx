// src/screens/ordering/StartSessionScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation } from '@tanstack/react-query';

import { OrderingStackParamList } from '@/navigation/OrderingNavigator';
import { createOrderingSession } from '@/services/apiOrdering';

type ScreenRouteProp = RouteProp<OrderingStackParamList, 'StartSession'>;
type ScreenNavigationProp = StackNavigationProp<OrderingStackParamList, 'StartSession'>;

export default function StartSessionScreen() {
    const route = useRoute<ScreenRouteProp>();
    const navigation = useNavigation<ScreenNavigationProp>();
    const { tableId } = route.params;

    // SỬA Ở ĐÂY: Bỏ biến isPending không sử dụng
    const { mutate: startSession } = useMutation({
        mutationFn: () => createOrderingSession(tableId),
        onSuccess: (sessionId) => {
            if (sessionId) {
                navigation.replace('OrderingMenu', { tableId, sessionId });
            } else {
                Alert.alert('Lỗi', 'Không thể tạo phiên gọi món. Vui lòng thử lại.');
                navigation.goBack();
            }
        },
        onError: (error: Error) => {
            Alert.alert('Lỗi', `Không thể bắt đầu phiên: ${error.message}`);
            navigation.goBack();
        }
    });

    useEffect(() => {
        if (tableId) {
            startSession();
        }
    }, [tableId, startSession]);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>Đang tạo phiên gọi món...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    }
});