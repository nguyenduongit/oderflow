// src/services/apiTables.ts
import { supabase } from '@/lib/supabase';
import type { QrCodeTable } from '@/types';

// Hàm tạo một bàn mới
export async function createTable(tableNumber: number, restaurantId: string) {
  if (!tableNumber || !restaurantId) throw new Error('Số bàn và ID nhà hàng là bắt buộc');

  const { data, error } = await supabase
    .from('tables')
    .insert([{ table_number: tableNumber, restaurant_id: restaurantId }])
    .select()
    .single();

  if (error) {
    console.error(error);
    // Bắt lỗi trùng số bàn
    if (error.code === '23505') {
        throw new Error('Số bàn này đã tồn tại. Vui lòng chọn số khác.');
    }
    throw new Error('Không thể tạo bàn');
  }
  return data;
}

// Hàm lấy tất cả bàn (active và inactive)
export async function getAllTables(restaurantId: string): Promise<QrCodeTable[]> { // Thêm kiểu trả về
    if (!restaurantId) return []; // Thêm điều kiện an toàn
    const { data, error } = await supabase.rpc('get_all_tables', {
        p_restaurant_id: restaurantId,
    });
    if (error) throw new Error('Không thể tải danh sách bàn.');
    return data || []; // Đảm bảo luôn trả về một mảng
}

// Hàm cập nhật trạng thái ẩn/hiện của các bàn
export async function updateTablesActivity({ tableIds, isActive }: { tableIds: string[], isActive: boolean }) {
    const { error } = await supabase.rpc('update_tables_activity', {
        p_table_ids: tableIds,
        p_is_active: isActive,
    });
    if (error) throw new Error('Cập nhật trạng thái bàn thất bại.');
}