// src/services/apiOrders.ts
import { supabase } from '@/lib/supabase';
import type { TableWithStatus } from '@/types';

export async function getTablesWithStatus(restaurantId: string): Promise<TableWithStatus[]> {
  if (!restaurantId) return [];

  // Hàm RPC này trên Supabase giờ sẽ được sửa lại để chỉ lấy các bàn active
  // SELECT ... FROM tables WHERE restaurant_id = p_restaurant_id AND is_active = TRUE
  const { data, error } = await supabase.rpc('get_tables_with_status', {
    p_restaurant_id: restaurantId,
  });

  if (error) {
    console.error('Lỗi khi lấy trạng thái bàn:', error);
    throw new Error('Không thể tải trạng thái các bàn.');
  }
  return data || [];
}