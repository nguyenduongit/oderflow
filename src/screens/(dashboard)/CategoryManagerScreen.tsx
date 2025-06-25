// src/screens/(dashboard)/CategoryManagerScreen.tsx

import React, { useState } from 'react';
import { View, Alert, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { createCategory, deleteCategory, getMenusWithItems } from '@/services/apiMenu';
import { useRestaurant } from '@/hooks/useRestaurant';
import type { MenuCategoryWithItems } from '@/types';
// Import component feature của chúng ta
import CategoryManager from '@/features/categories/CategoryManager';

export default function CategoryManagerScreen() {
    const queryClient = useQueryClient();
    const { restaurant } = useRestaurant();
    const [newCategoryName, setNewCategoryName] = useState('');

    // --- PHẦN LOGIC VÀ DATA FETCHING NẰM Ở ĐÂY ---
    const { data: menus, isLoading } = useQuery({
        queryKey: ['menus-with-items', restaurant?.id],
        queryFn: () => getMenusWithItems(restaurant!.id),
        enabled: !!restaurant,
    });

    const invalidateQueries = () => {
        queryClient.invalidateQueries({ queryKey: ['menus-with-items'] });
    }

    const { mutate: addCategory, isPending: isAdding } = useMutation({
        mutationFn: (name: string) => createCategory(name, restaurant!.id),
        onSuccess: () => {
            setNewCategoryName('');
            invalidateQueries();
            Alert.alert('Thành công', 'Đã thêm danh mục mới.');
        },
        onError: (err: Error) => Alert.alert('Lỗi', err.message),
    });

    const { mutate: removeCategory } = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            invalidateQueries();
            Alert.alert('Thành công', 'Đã xóa danh mục.');
        },
        onError: (err: Error) => Alert.alert('Lỗi', err.message),
    });

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục.');
            return;
        }
        addCategory(newCategoryName.trim());
    };

    const confirmDelete = (category: MenuCategoryWithItems) => {
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc muốn xóa danh mục "${category.name}"?`,
            [
                { text: 'Hủy' },
                { text: 'Xóa', style: 'destructive', onPress: () => removeCategory(category.id) },
            ]
        );
    };

    // --- PHẦN RENDER ---
    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large"/></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Màn hình này chỉ render component feature và truyền props vào */}
            {menus && (
                <CategoryManager
                    menus={menus}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    onAddCategory={handleAddCategory}
                    onDeleteCategory={confirmDelete}
                    isAdding={isAdding}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});