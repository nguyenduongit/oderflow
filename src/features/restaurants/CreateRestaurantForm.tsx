// src/features/restaurants/CreateRestaurantForm.tsx

import React, { useState } from 'react';
import { StyleSheet, Alert, View, Text, TextInput } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRestaurant } from '@/services/apiRestaurants';
import Button from '@/components/Button'; // Sử dụng Button tùy chỉnh

export default function CreateRestaurantForm() {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    const { mutate, isPending } = useMutation({
        mutationFn: createRestaurant,
        onSuccess: () => {
            Alert.alert('Thành công', 'Nhà hàng của bạn đã được tạo!');
            // Làm mới lại query 'restaurant' để DashboardScreen hiển thị sơ đồ bàn
            queryClient.invalidateQueries({ queryKey: ['restaurant'] });
        },
        onError: (err: Error) => Alert.alert('Lỗi', err.message),
    });

    const handleSubmit = () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Tên nhà hàng là bắt buộc');
            return;
        }
        mutate({ name, address, phone_number: phone });
    };

    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.title}>Chào mừng bạn!</Text>
                <Text style={styles.subtitle}>Hãy bắt đầu bằng cách tạo thông tin nhà hàng của bạn.</Text>
            </View>

            <View style={styles.form}>
                <View>
                    <Text style={styles.label}>Tên nhà hàng (*)</Text>
                    <TextInput
                        placeholder="Ví dụ: Phở Thìn"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        editable={!isPending}
                    />
                </View>

                <View>
                    <Text style={styles.label}>Địa chỉ</Text>
                    <TextInput
                        placeholder="Ví dụ: 13 Lò Đúc, Hà Nội"
                        value={address}
                        onChangeText={setAddress}
                        style={styles.input}
                        editable={!isPending}
                    />
                </View>

                <View>
                    <Text style={styles.label}>Số điện thoại</Text>
                    <TextInput
                        placeholder="Số điện thoại liên hệ"
                        value={phone}
                        onChangeText={setPhone}
                        style={styles.input}
                        keyboardType='phone-pad'
                        editable={!isPending}
                    />
                </View>
            </View>

            <Button
                title="Tạo Nhà Hàng"
                onPress={handleSubmit}
                isLoading={isPending}
                style={styles.button}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#F9FAFB',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6B7280',
        marginBottom: 32,
    },
    form: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 16,
        fontSize: 16,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 8,
    }
});