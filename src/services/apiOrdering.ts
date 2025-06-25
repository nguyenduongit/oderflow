// src/services/apiOrdering.ts
import { supabase } from '@/lib/supabase';
import type { OrderingMenuData } from '@/types';

// Hàm này gọi RPC trên Supabase để tạo một phiên gọi món mới cho bàn
export async function createOrderingSession(tableId: string): Promise<string | null> {
    if (!tableId) throw new Error('Cần có ID của bàn để tạo phiên.');

    // Giả sử bạn có một hàm RPC tên là 'create_new_session' trên Supabase
    // Hàm này nhận vào table_id và trả về session_id (dưới dạng uuid)
    const { data, error } = await supabase.rpc('create_new_session', {
        p_table_id: tableId,
    });

    if (error) {
        console.error('Lỗi khi tạo phiên gọi món:', error);
        throw new Error('Không thể bắt đầu phiên gọi món mới.');
    }

    // data trả về từ RPC chính là sessionId
    return data;
}

export async function getMenuByTable(tableId: string): Promise<OrderingMenuData | null> {
  if (!tableId) return null;

  // Giả sử bạn có hàm RPC 'get_restaurant_and_menu_by_table' trên Supabase
  const { data, error } = await supabase.rpc('get_restaurant_and_menu_by_table', {
    p_table_id: tableId,
  });

  if (error) {
    console.error('Lỗi khi lấy menu theo bàn:', error);
    throw new Error('Không thể tìm thấy thực đơn cho bàn này.');
  }

  return data;
}