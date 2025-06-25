// src/screens/(dashboard)/MenuItemFormScreen.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, Image, ScrollView, SafeAreaView, TouchableOpacity, Text, View, TextInput, ActivityIndicator, Button as RNButton } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';

import { MenuStackParamList } from '@/navigation/MenuStackNavigator';
import { useRestaurant } from '@/hooks/useRestaurant';
import { createEditMenuItem, getMenusWithItems } from '@/services/apiMenu';
import type { MenuItemFormData, MenuCategoryWithItems } from '@/types';
import CustomPicker from '@/components/CustomPicker';

type MenuItemFormScreenRouteProp = RouteProp<MenuStackParamList, 'MenuItemForm'>;
type MenuItemFormScreenNavigationProp = StackNavigationProp<MenuStackParamList, 'MenuItemForm'>;

export default function MenuItemFormScreen() {
    const navigation = useNavigation<MenuItemFormScreenNavigationProp>();
    const route = useRoute<MenuItemFormScreenRouteProp>();
    const queryClient = useQueryClient();
    const { restaurant } = useRestaurant();

    const { itemId } = route.params || {};
    const isEditMode = !!itemId;

    const { data: menus, isLoading: isLoadingMenus } = useQuery<MenuCategoryWithItems[]>({
        queryKey: ['menus-with-items', restaurant?.id],
        queryFn: () => getMenusWithItems(restaurant!.id),
        enabled: !!restaurant,
    });

    // Tìm món ăn đang có dựa trên itemId được truyền vào
    const existingItem = isEditMode
        ? menus?.flatMap(menu => menu.menu_items).find(item => item.id === itemId)
        : undefined;

    // --- State cho các trường trong form ---
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    // --- LOGIC MỚI: Tự động điền dữ liệu vào form khi ở chế độ sửa ---
    useEffect(() => {
        if (isEditMode && existingItem) {
            setName(existingItem.name);
            setDescription(existingItem.description || '');
            setPrice(existingItem.price.toString());
            setImageUri(existingItem.image_url || null);
            // Tìm và set ID cho danh mục đã chọn
            const parentMenu = menus?.find(menu => menu.id === existingItem.menu_id);
            if (parentMenu) {
                setSelectedCategoryId(parentMenu.id);
            }
        }
    }, [isEditMode, existingItem, menus]);


    const { mutate: saveMenuItem, isPending } = useMutation({
        mutationFn: (data: MenuItemFormData) => createEditMenuItem({
            newItemData: data, id: itemId, restaurantId: restaurant!.id,
        }),
        onSuccess: () => {
            Alert.alert('Thành công', `Đã ${isEditMode ? 'cập nhật' : 'tạo mới'} món ăn.`);
            queryClient.invalidateQueries({ queryKey: ['menus-with-items'] });
            navigation.goBack();
        },
        onError: (err: Error) => Alert.alert('Lỗi', err.message),
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true,
        });
        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setImageBase64(result.assets[0].base64 ?? null);
        }
    };

    const handleSubmit = () => {
        if (!name || !price || !selectedCategoryId) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường bắt buộc.');
            return;
        }
        // Giữ lại ảnh cũ nếu không chọn ảnh mới
        const currentImageUrl = existingItem?.image_url;
        const formData: MenuItemFormData = {
            name, description, price: parseFloat(price) || 0,
            menu_id: selectedCategoryId,
            image_url: imageBase64 ? undefined : currentImageUrl,
            new_image_base64: imageBase64 || undefined,
        };
        saveMenuItem(formData);
    };

    if (isLoadingMenus) {
        return <View style={styles.center}><ActivityIndicator size="large"/></View>;
    }

    const categoryPickerItems = menus?.map(cat => ({
        label: cat.name,
        value: cat.id,
    })) || [];

    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.title}>{isEditMode ? "Sửa Món ăn" : "Thêm Món ăn mới"}</Text>
            <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 48 }}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : <Text>Chọn ảnh</Text>}
                </TouchableOpacity>

                <View>
                    <Text style={styles.label}>Tên món ăn (*)</Text>
                    <TextInput value={name} onChangeText={setName} style={styles.input} />
                </View>

                <View>
                    <Text style={styles.label}>Mô tả</Text>
                    <TextInput value={description} onChangeText={setDescription} multiline style={[styles.input, { height: 80, textAlignVertical: 'top' }]} />
                </View>

                <View>
                    <Text style={styles.label}>Giá (*)</Text>
                    <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
                </View>

                <CustomPicker
                    label="Danh mục (*)"
                    items={categoryPickerItems}
                    selectedValue={selectedCategoryId}
                    onValueChange={(value) => setSelectedCategoryId(value as string)}
                />

                <RNButton title={isPending ? "Đang lưu..." : 'Lưu Món ăn'} onPress={handleSubmit} disabled={isPending} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'white' },
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
    label: { fontWeight: 'bold', marginBottom: 4, color: '#4B5563' },
    input: {
        borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6,
        paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
        fontSize: 16, backgroundColor: '#F9FAFB'
    },
    imagePicker: {
        width: 120, height: 120, borderRadius: 8, backgroundColor: '#F3F4F6',
        justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
        marginBottom: 24, borderWidth: 1, borderColor: '#D1D5DB',
    },
    image: { width: '100%', height: '100%', borderRadius: 8, },
});