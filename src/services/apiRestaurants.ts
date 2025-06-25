// src/services/apiRestaurants.ts
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './apiAuth';
import type { NewRestaurantData } from '@/types'; // Sẽ tạo sau

/**
 * Lấy thông tin nhà hàng dựa trên ID của người dùng đang đăng nhập.
 */
export async function getRestaurantByOwner() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Không tìm thấy người dùng");

    const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', user.id)
        .single(); // Chỉ lấy 1 kết quả

    // Bỏ qua lỗi 'không tìm thấy dòng nào' vì đây là trường hợp hợp lệ khi user chưa tạo nhà hàng
    if (error && error.code !== 'PGRST116') {
        console.error("Lỗi khi lấy thông tin nhà hàng:", error);
        throw new Error('Không thể tải dữ liệu nhà hàng');
    }

    return data;
}

/**
 * Tạo một nhà hàng mới.
 */
export async function createRestaurant(newRestaurant: NewRestaurantData) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Không tìm thấy người dùng");

    const { data, error } = await supabase
        .from('restaurants')
        .insert([{ ...newRestaurant, owner_id: user.id }])
        .select()
        .single();

    if (error) {
        console.error(error);
        throw new Error('Không thể tạo nhà hàng');
    }

    return data;
}