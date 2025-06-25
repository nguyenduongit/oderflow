// src/screens/(dashboard)/OrderDetailsScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import _ from 'lodash';
// Import các icon bạn đã có
import { Send, XCircle, CircleDollarSign } from 'lucide-react-native';

import { DashboardStackParamList } from '@/navigation/DashboardStackNavigator';
import { getTableDetails, confirmOrderBatch, updateOverallOrderStatus, completeOrderAndSession } from '@/services/apiOrders';
import { OrderItem, OrderItemStatus } from '@/types';
import Button from '@/components/Button';
import { supabase } from '@/lib/supabase';

type ScreenRouteProp = RouteProp<DashboardStackParamList, 'OrderDetails'>;

const itemStatusDisplay: Record<OrderItemStatus, { text: string; color: string }> = {
    pending: { text: 'Chờ xác nhận', color: '#6B7280' },
    confirmed: { text: 'Đã gửi bếp', color: '#3B82F6' },
    preparing: { text: 'Đang làm', color: '#F59E0B' },
    ready: { text: 'Sẵn sàng', color: '#10B981' },
    served: { text: 'Đã phục vụ', color: '#10B981' },
    out_of_stock: { text: 'Hết hàng', color: '#EF4444' },
    cancelled: { text: 'Đã hủy', color: '#EF4444' },
};

export default function OrderDetailsScreen() {
    const route = useRoute<ScreenRouteProp>();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { tableId } = route.params;

    const { data, isLoading, isError } = useQuery({
        queryKey: ['table-details', tableId],
        queryFn: () => getTableDetails(tableId),
        enabled: !!tableId,
        refetchInterval: 5000, // Tự động làm mới sau mỗi 5 giây
    });

    // ... Mutations giữ nguyên ...
    const { mutate: sendToKitchen, isPending: isSending } = useMutation({
        mutationFn: ({ orderId, batchNumber }: { orderId: string, batchNumber: number }) => confirmOrderBatch(orderId, batchNumber),
        onSuccess: () => Alert.alert("Thành công", "Đã gửi yêu cầu xuống bếp!"),
        onError: (err: Error) => Alert.alert("Lỗi", err.message),
    });

    const { mutate: cancelOrder, isPending: isCancelling } = useMutation({
        mutationFn: (orderId: string) => updateOverallOrderStatus(orderId, 'cancelled'),
        onSuccess: () => {
            Alert.alert("Thành công", "Đơn hàng đã được hủy!");
            queryClient.invalidateQueries({ queryKey: ['tables-status'] });
            navigation.goBack();
        },
        onError: (err: Error) => Alert.alert("Lỗi", err.message),
    });

    const { mutate: confirmPayment, isPending: isPaying } = useMutation({
        mutationFn: completeOrderAndSession,
        onSuccess: () => {
            Alert.alert("Thành công", "Thanh toán thành công! Bàn đã được giải phóng.");
            queryClient.invalidateQueries({ queryKey: ['tables-status'] });
            navigation.goBack();
        },
        onError: (err: Error) => Alert.alert("Lỗi", err.message),
    });


    if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;
    if (isError || !data) return <View style={styles.center}><Text>Lỗi tải dữ liệu.</Text></View>;

    const { table_info, active_order } = data;
    if (!active_order) return <View style={styles.center}><Text>Bàn {table_info.table_number} hiện đang trống.</Text></View>;

    const groupedItems = _.groupBy(active_order.order_items, 'batch_number');
    const isOrderFinished = ['paid', 'cancelled'].includes(active_order.status);
    const isProcessing = isSending || isCancelling || isPaying;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Đơn hàng bàn {table_info.table_number}</Text>
                        <Text style={styles.orderInfo}>Mã đơn: {active_order.id.substring(0, 8)}</Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{active_order.status}</Text>
                    </View>
                </View>

                {Object.entries(groupedItems).map(([batchNumber, items]) => {
                    const needsConfirmation = items.some(item => item.status === 'pending');
                    return (
                        <View key={batchNumber} style={styles.batchContainer}>
                            <Text style={styles.batchTitle}>Lần gọi #{batchNumber}</Text>
                            {items.map(item => (
                                <View key={item.id} style={styles.itemRow}>
                                    <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                                    <Text style={styles.itemName}>{item.item_name}</Text>
                                    <Text style={{ color: itemStatusDisplay[item.status]?.color || '#000' }}>
                                        {itemStatusDisplay[item.status]?.text || item.status}
                                    </Text>
                                </View>
                            ))}
                            {needsConfirmation && !isOrderFinished && (
                                <View style={styles.batchActions}>
                                    <Button
                                        title="Gửi xuống bếp"
                                        // THÊM ICON VÀO ĐÂY
                                        icon={<Send size={16} color="white" />}
                                        onPress={() => sendToKitchen({ orderId: active_order.id, batchNumber: Number(batchNumber) })}
                                        isLoading={isSending || isProcessing}
                                        style={{ flex: 1 }}
                                    />
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalPrice}>{new Intl.NumberFormat('vi-VN').format(active_order.total_amount)}đ</Text>
                </View>
                {!isOrderFinished && (
                    <View style={styles.footerActions}>
                        <Button
                            title="Hủy Đơn"
                            variant="danger"
                            // THÊM ICON VÀO ĐÂY
                            icon={<XCircle size={18} color="white" />}
                            onPress={() => cancelOrder(active_order.id)}
                            isLoading={isCancelling || isProcessing}
                            style={{ flex: 1 }}
                        />
                        <Button
                            title="Thanh toán"
                            // THÊM ICON VÀO ĐÂY
                            icon={<CircleDollarSign size={18} color="white" />}
                            onPress={() => confirmPayment(active_order.id)}
                            isLoading={isPaying || isProcessing}
                            style={{ flex: 1, marginLeft: 10 }}
                        />
                    </View>
                )}
            </View>
        </View>
    );
}

// ... styles giữ nguyên ...
const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    scrollContent: { paddingBottom: 150 },
    header: { padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    orderInfo: { fontSize: 14, color: '#6B7280', marginTop: 4 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#DBEAFE' },
    statusText: { color: '#1E40AF', fontWeight: '600' },
    batchContainer: { marginTop: 12, backgroundColor: 'white' },
    batchTitle: { fontSize: 18, fontWeight: '600', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    itemQuantity: { width: 40, fontSize: 16, color: '#6B7280', fontWeight: 'bold' },
    itemName: { flex: 1, fontSize: 16 },
    itemStatus: { fontSize: 14, fontStyle: 'italic' },
    batchActions: { paddingTop: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6', padding: 16 },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'white', padding: 16, paddingTop: 12,
        borderTopWidth: 1, borderTopColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, paddingBottom: 30,
    },
    totalContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    totalLabel: { fontSize: 18, color: '#4B5563' },
    totalPrice: { fontSize: 22, fontWeight: 'bold', color: '#1E40AF' },
    footerActions: { flexDirection: 'row' },
});