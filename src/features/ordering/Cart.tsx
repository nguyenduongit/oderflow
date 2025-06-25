// src/features/ordering/Cart.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView, FlatList, Alert } from 'react-native';
import { ShoppingCart, Plus, Minus, Trash2, X } from 'lucide-react-native';
import { useCartStore, CartItem } from '@/store/cartStore';
import Button from '@/components/Button';

// Component con để hiển thị một món hàng trong giỏ
const CartRow = ({ item }: { item: CartItem }) => {
    const { increaseQuantity, decreaseQuantity, removeItem } = useCartStore();

    return (
        <View style={styles.cartRow}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{new Intl.NumberFormat('vi-VN').format(item.price)}đ</Text>
            </View>
            <View style={styles.quantityControls}>
                <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.controlButton}>
                    <Minus size={16} color="#4B5563" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={styles.controlButton}>
                    <Plus size={16} color="#4B5563" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );
};

// Component Giỏ hàng chính
export default function Cart() {
    const [isVisible, setIsVisible] = useState(false);
    // Lấy state từ store
    const items = useCartStore((state) => state.items);
    const totalItems = useCartStore((state) => state.totalItems());

    const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);

    const handleSubmitOrder = () => {
        // TODO: Xử lý logic gửi đơn hàng ở đây
        Alert.alert("Gửi đơn hàng", "Chức năng này sẽ được phát triển ở các bước tiếp theo.");
        setIsVisible(false);
    }

    return (
        <>
            {/* Nút bấm nổi để mở giỏ hàng */}
            <TouchableOpacity style={styles.cartButton} onPress={() => setIsVisible(true)}>
                <ShoppingCart size={28} color="white" />
                {totalItems > 0 && (
                    <View style={styles.badgeContainer}>
                        <Text style={styles.badgeText}>{totalItems}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Modal hiển thị chi tiết giỏ hàng */}
            <Modal
                visible={isVisible}
                animationType="slide"
                onRequestClose={() => setIsVisible(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Giỏ hàng của bạn</Text>
                        <TouchableOpacity onPress={() => setIsVisible(false)}>
                            <X size={28} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={items}
                        renderItem={({ item }) => <CartRow item={item} />}
                        keyExtractor={item => item.id}
                        ListEmptyComponent={<Text style={styles.emptyText}>Giỏ hàng đang trống.</Text>}
                        contentContainerStyle={{ padding: 16 }}
                    />

                    {items.length > 0 && (
                        <View style={styles.modalFooter}>
                             <View style={styles.totalContainer}>
                                <Text style={styles.totalLabel}>Tổng cộng:</Text>
                                <Text style={styles.totalPrice}>
                                    {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ
                                </Text>
                            </View>
                            <Button
                                title="Gửi đơn hàng"
                                onPress={handleSubmitOrder}
                            />
                        </View>
                    )}
                </SafeAreaView>
            </Modal>
        </>
    );
}


const styles = StyleSheet.create({
    cartButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2563EB',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        color: '#4B5563',
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cartRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
    },
    itemPrice: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    controlButton: {
        padding: 8,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#6B7280',
    },
});