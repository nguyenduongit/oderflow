// src/services/apiOrders.ts
import { supabase } from '@/lib/supabase';
import type { TableWithStatus } from '@/types';
import type { OrderDetail } from '@/types';

export async function getTablesWithStatus(restaurantId: string): Promise<TableWithStatus[]> {
    if (!restaurantId) return [];
    const { data, error } = await supabase.rpc('get_tables_with_status', { p_restaurant_id: restaurantId });
    if (error) throw new Error('Không thể tải trạng thái các bàn.');
    return data || [];
}

export async function getTableDetails(tableId: string): Promise<{ table_info: { id: string; table_number: number }; active_order: OrderDetail | null }> {
    if (!tableId) throw new Error("Cần có ID của bàn.");
    const { data, error } = await supabase.rpc('get_table_details', { p_table_id: tableId });
    if (error) throw new Error('Không thể tải chi tiết bàn.');
    return data;
}

// --- CÁC HÀM API MỚI ---

// Gọi RPC để gửi một loạt món xuống bếp
export async function confirmOrderBatch(orderId: string, batchNumber: number) {
    const { error } = await supabase.rpc('confirm_order_batch', {
        p_order_id: orderId,
        p_batch_number: batchNumber,
    });
    if (error) throw new Error('Không thể gửi yêu cầu xuống bếp.');
}

// Cập nhật trạng thái chung của một đơn hàng (vd: 'cancelled')
export async function updateOverallOrderStatus(orderId: string, newStatus: string) {
    const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();
    if (error) throw new Error('Không thể cập nhật trạng thái đơn hàng.');
    return data;
}

// Gọi RPC để xác nhận thanh toán và đóng phiên
export async function completeOrderAndSession(orderId: string) {
    const { error } = await supabase.rpc('complete_order_and_session', {
        p_order_id: orderId,
    });
    if (error) throw new Error("Không thể hoàn tất đơn hàng và giải phóng bàn.");
}