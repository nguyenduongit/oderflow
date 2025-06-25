// src/services/apiSubscription.ts
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types'; // Sẽ tạo sau

export async function getActiveSubscription(restaurantId: string): Promise<Subscription | null> {
    if (!restaurantId) return null;

    const { data, error } = await supabase
        .from('subscriptions')
        .select(`
            status,
            plans (
                name,
                max_tables
            )
        `)
        .eq('restaurant_id', restaurantId)
        .eq('status', 'active')
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error("Lỗi khi lấy gói đăng ký:", error);
        throw new Error('Không thể tải thông tin gói đăng ký.');
    }

    // Supabase trả về `plans` là một object, không phải mảng, khi select như trên.
    // Cần đảm bảo kiểu dữ liệu trả về khớp với định nghĩa của chúng ta.
    return data as Subscription | null;
}