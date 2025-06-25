// src/screens/(dashboard)/MenuScreen.tsx
import React, { useState } from 'react';
import { StyleSheet, Image, View, Text, ActivityIndicator, FlatList, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MenuStackParamList } from '@/navigation/MenuStackNavigator';
import { useRestaurant } from '@/hooks/useRestaurant';
import { getMenusWithItems, deleteMenuItem } from '@/services/apiMenu';
import type { MenuItem, MenuCategoryWithItems } from '@/types';
import Button from '@/components/Button';
import { ChevronDown, ChevronUp, MoreVertical, Trash2, Edit } from 'lucide-react-native';

// --- Component con ---

const MenuItemCard = ({ item, isMenuOpen, onToggleMenu, onEdit, onDelete }: {
    item: MenuItem;
    isMenuOpen: boolean;
    onToggleMenu: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    return (
        <View style={styles.itemContainer}>
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
            />
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text> : null}
                <Text style={styles.itemPrice}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                </Text>
            </View>

            {/* PHẦN MENU SỬA/XÓA */}
            <View>
                <TouchableOpacity onPress={onToggleMenu} style={styles.moreButton}>
                    <MoreVertical size={20} color="#6B7280" />
                </TouchableOpacity>

                {isMenuOpen && (
                    <View style={styles.actionMenu}>
                        <TouchableOpacity style={styles.actionMenuItem} onPress={onEdit}>
                            <Edit size={16} color="#3B82F6" style={{ marginRight: 8 }}/>
                            <Text style={{ color: '#3B82F6' }}>Sửa</Text>
                        </TouchableOpacity>
                        <View style={styles.actionMenuDivider} />
                        <TouchableOpacity style={styles.actionMenuItem} onPress={onDelete}>
                            <Trash2 size={16} color="#EF4444" style={{ marginRight: 8 }}/>
                            <Text style={{ color: '#EF4444' }}>Xóa</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const CollapsibleCategory = ({ category, navigation, openMenuItemId, setOpenMenuItemId }: {
    category: MenuCategoryWithItems;
    navigation: any;
    openMenuItemId: string | null;
    setOpenMenuItemId: (id: string | null) => void;
}) => {
    const [expanded, setExpanded] = useState(true);
    const queryClient = useQueryClient();

    const { mutate: removeItem } = useMutation({
        mutationFn: deleteMenuItem,
        onSuccess: () => {
            Alert.alert("Thành công", "Đã xóa món ăn.");
            queryClient.invalidateQueries({ queryKey: ['menus-with-items'] });
        },
        onError: (err: Error) => Alert.alert("Lỗi", err.message),
    });

    const confirmDelete = (item: MenuItem) => {
        Alert.alert(
            "Xác nhận xóa", `Bạn có chắc muốn xóa món "${item.name}"?`,
            [{ text: "Hủy" }, { text: "Xóa", style: 'destructive', onPress: () => removeItem(item.id) }]
        );
    };

    return (
        <View style={styles.categoryContainer}>
            <TouchableOpacity style={styles.categoryHeader} onPress={() => setExpanded(!expanded)}>
                <Text style={styles.categoryTitle}>{category.name}</Text>
                {expanded ? <ChevronUp color="#4B5563" /> : <ChevronDown color="#4B5563" />}
            </TouchableOpacity>
            {expanded && (
                <View>
                    {category.menu_items.length > 0 ? (
                        category.menu_items.map((item, index) => (
                            <React.Fragment key={item.id}>
                                <MenuItemCard
                                    item={item}
                                    isMenuOpen={openMenuItemId === item.id}
                                    onToggleMenu={() => setOpenMenuItemId(openMenuItemId === item.id ? null : item.id)}
                                    onEdit={() => {
                                        setOpenMenuItemId(null);
                                        navigation.navigate('MenuItemForm', { itemId: item.id });
                                    }}
                                    onDelete={() => {
                                        setOpenMenuItemId(null);
                                        confirmDelete(item);
                                    }}
                                />
                                {index < category.menu_items.length - 1 && <View style={styles.divider} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Text style={styles.emptyListText}>Chưa có món ăn nào.</Text>
                    )}
                </View>
            )}
        </View>
    );
};


// --- Component chính ---

type MenuScreenNavigationProp = StackNavigationProp<MenuStackParamList, 'MenuList'>;

export default function MenuScreen() {
    const { restaurant } = useRestaurant();
    const navigation = useNavigation<MenuScreenNavigationProp>();
    // SỬA LỖI 2: Quản lý state tập trung
    const [openMenuItemId, setOpenMenuItemId] = useState<string | null>(null);

    const { data: menus, isLoading } = useQuery({
        queryKey: ['menus-with-items', restaurant?.id],
        queryFn: () => getMenusWithItems(restaurant!.id),
        enabled: !!restaurant,
    });

    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large"/></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
             {/* Backdrop để đóng menu đang mở khi nhấn ra ngoài danh sách */}
            {openMenuItemId && (
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setOpenMenuItemId(null)} />
            )}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Quản lý Menu</Text>
                <View style={styles.headerButtons}>
                    <Button title="Danh mục" onPress={() => navigation.navigate('CategoryManager')} variant="secondary" style={styles.headerButton} textStyle={styles.headerButtonText} />
                    <Button title="Thêm Món" onPress={() => navigation.navigate('MenuItemForm')} style={[styles.headerButton, { marginLeft: 8 }]} textStyle={styles.headerButtonText} />
                </View>
            </View>

            <FlatList
                data={menus}
                renderItem={({ item }) => (
                    <CollapsibleCategory
                        category={item}
                        navigation={navigation}
                        openMenuItemId={openMenuItemId}
                        setOpenMenuItemId={setOpenMenuItemId}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 24 }}
                ListEmptyComponent={<View style={[styles.center, {padding: 16}]}><Text style={{color: '#6B7280'}}>Chưa có danh mục nào.</Text></View>}
            />
        </SafeAreaView>
    );
}

// --- Styles ---

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white',
        borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    headerButtons: { flexDirection: 'row' },
    headerButton: { paddingVertical: 8, paddingHorizontal: 12 },
    headerButtonText: { fontSize: 14 },
    categoryContainer: {
        backgroundColor: 'white', borderRadius: 8, marginHorizontal: 16, marginTop: 16,
        overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB',
    },
    categoryHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, backgroundColor: '#F9FAFB',
    },
    categoryTitle: { fontSize: 18, fontWeight: '600' },
    itemContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white' },
    itemImage: { width: 64, height: 64, borderRadius: 8, marginRight: 16 },
    itemDetails: { flex: 1, justifyContent: 'center' },
    itemName: { fontSize: 16, fontWeight: '500' },
    itemDescription: { marginVertical: 4, color: '#6B7280', fontSize: 13 },
    itemPrice: { color: '#1D4ED8', fontWeight: '600', marginTop: 4 },
    emptyListText: { padding: 16, color: '#6B7280', fontStyle: 'italic' },
    divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 16 + 64 + 16 },
    moreButton: { padding: 8 },
    // SỬA LỖI 1: Điều chỉnh lại style của menu
    actionMenu: {
        position: 'absolute', top: 0, right: 10,
        backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
        elevation: 5, zIndex: 10,
        minWidth: 120, // Đảm bảo có đủ chiều rộng
    },
    actionMenuItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12,
    },
    actionMenuDivider: { height: 1, backgroundColor: '#F3F4F6' },
});