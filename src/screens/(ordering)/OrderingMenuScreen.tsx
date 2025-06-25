// src/screens/ordering/OrderingMenuScreen.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react'; // Thêm useEffect, useMemo
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, ActivityIndicator, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Plus, Lock } from 'lucide-react-native';

import { OrderingStackParamList } from '@/navigation/OrderingNavigator';
import { getMenuByTable } from '@/services/apiOrdering';
// Bỏ import 'MenuCategoryWithItems' không dùng
import type { MenuItem } from '@/types';
import { useCartStore } from '@/store/cartStore';
import Cart from '@/features/ordering/Cart';

type ScreenRouteProp = RouteProp<OrderingStackParamList, 'OrderingMenu'>;

// --- Component con ---
// Đổi tên để tránh xung đột với type 'MenuItem'
const MenuItemComponent = ({ item }: { item: MenuItem }) => {
    const addItemToCart = useCartStore((state) => state.addItem);
    const isSessionActive = true;

    const handleAddItem = () => {
        addItemToCart(item);
        Alert.alert("Đã thêm", `Đã thêm "${item.name}" vào giỏ hàng!`);
    };

    return (
        <View style={styles.menuItemContainer}>
            {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            ) : (
                <View style={styles.itemImagePlaceholder} />
            )}
            <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.description ? (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : null}
                <Text style={styles.itemPrice}>
                  {`${new Intl.NumberFormat('vi-VN').format(item.price)}đ`}
                </Text>
            </View>
            <TouchableOpacity style={[styles.addButton, !isSessionActive && styles.disabledButton]} onPress={handleAddItem} disabled={!isSessionActive}>
                <Plus size={20} color="white" />
            </TouchableOpacity>
        </View>
    );
};


// --- Màn hình chính ---
export default function OrderingMenuScreen() {
    const route = useRoute<ScreenRouteProp>();
    // Bỏ sessionId không sử dụng
    const { tableId } = route.params;

    const setRestaurantId = useCartStore((state) => state.setRestaurantId);

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const categoryLayouts = useRef<Record<string, number>>({});

    const { data: menuData, isLoading, isError } = useQuery({
        queryKey: ['menu-for-table', tableId],
        queryFn: () => getMenuByTable(tableId),
        enabled: !!tableId,
    });

    const isSessionActive = true;

    useEffect(() => {
        if (menuData?.restaurant?.id) {
            setRestaurantId(menuData.restaurant.id);
        }
    }, [menuData, setRestaurantId]);

    // Sửa cảnh báo exhaustive-deps
    const validMenu = useMemo(() => {
        return menuData?.menu?.filter(cat => cat.menu_items && cat.menu_items.length > 0) || [];
    }, [menuData]);


    useEffect(() => {
        if (!activeCategory && validMenu.length > 0) {
            setActiveCategory(validMenu[0].id);
        }
    }, [validMenu, activeCategory]);

    const handleCategoryClick = (categoryId: string) => {
        const y = categoryLayouts.current[categoryId];
        if (y !== undefined) {
            scrollViewRef.current?.scrollTo({ y: y, animated: true });
        }
    };

    const handleScroll = (event: { nativeEvent: { contentOffset: { y: number } } }) => {
        const scrollPosition = event.nativeEvent.contentOffset.y;
        let currentCategory = null;

        for (const categoryId in categoryLayouts.current) {
            const layoutY = categoryLayouts.current[categoryId];
            if (scrollPosition >= layoutY - 10) {
                currentCategory = categoryId;
            }
        }
        if (currentCategory && currentCategory !== activeCategory) {
            setActiveCategory(currentCategory);
        }
    };


    if (isLoading) {
        return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    }

    if (isError || !menuData) {
        return <View style={styles.center}><Text>Không thể tải thực đơn. Vui lòng thử lại.</Text></View>;
    }

    const { restaurant } = menuData;

    return (
        <SafeAreaView style={styles.safeArea}>
            {!isSessionActive && (
                <View style={styles.sessionEndedBanner}>
                    <Lock size={16} color="#856404" />
                    <Text style={styles.sessionEndedText}>Phiên gọi món đã kết thúc.</Text>
                </View>
            )}

            <View style={styles.header}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.tableInfo}>Bàn số {restaurant.table_number}</Text>
            </View>

            <View style={styles.categoryNav}>
                <FlatList
                    data={validMenu}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.categoryButton, activeCategory === item.id && styles.activeCategoryButton]}
                            onPress={() => handleCategoryClick(item.id)}
                        >
                            <Text style={[styles.categoryButtonText, activeCategory === item.id && styles.activeCategoryText]}>
                                {item.name}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={item => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                />
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {validMenu.map(category => (
                    <View
                        key={category.id}
                        onLayout={(event) => {
                            categoryLayouts.current[category.id] = event.nativeEvent.layout.y;
                        }}
                    >
                        <Text style={styles.categoryTitle}>{category.name}</Text>
                        {/* Sửa lại tên component để không bị lỗi */}
                        {category.menu_items.map(item => <MenuItemComponent key={item.id} item={item} />)}
                    </View>
                ))}
                 {/* Thêm một khoảng trống ở dưới để cuộn không bị che */}
                <View style={{ height: 100 }} />
            </ScrollView>
            <Cart />
        </SafeAreaView>
    );
}

// Giữ nguyên styles
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'white' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    header: {
        paddingVertical: 12, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
        alignItems: 'center',
    },
    restaurantName: { fontSize: 24, fontWeight: 'bold' },
    tableInfo: { fontSize: 16, color: '#6B7280', marginTop: 4 },
    categoryNav: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    categoryButton: {
        paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20, backgroundColor: '#F3F4F6',
        marginRight: 10,
    },
    activeCategoryButton: { backgroundColor: '#3B82F6' },
    categoryButtonText: { fontWeight: '600', color: '#4B5563' },
    activeCategoryText: { color: 'white' },
    categoryTitle: {
        fontSize: 22, fontWeight: 'bold',
        paddingHorizontal: 16, marginTop: 24, marginBottom: 16,
    },
    menuItemContainer: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 12,
    },
    itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 16 },
    itemImagePlaceholder: {
        width: 80, height: 80,
        borderRadius: 8, marginRight: 16,
        backgroundColor: '#F3F4F6',
    },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600' },
    itemDescription: { fontSize: 14, color: '#6B7280', marginVertical: 4 },
    itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#1E40AF' },
    addButton: {
        backgroundColor: '#3B82F6', borderRadius: 20,
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'center',
    },
    disabledButton: { backgroundColor: '#9CA3AF' },
    sessionEndedBanner: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 10, backgroundColor: '#FFF3CD',
    },
    sessionEndedText: { color: '#856404', marginLeft: 8, fontWeight: '600' },
});