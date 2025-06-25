// src/services/apiMenu.ts
import { supabase } from '@/lib/supabase';
import { decode } from 'base64-arraybuffer'; // Import thêm
import type { MenuItemFormData } from '@/types'; // Import thêm

// Lấy tất cả danh mục VÀ các món ăn lồng bên trong
export async function getMenusWithItems(restaurantId: string) {
    if (!restaurantId) return [];

    const { data, error } = await supabase
        .from('menus')
        .select('*, menu_items(*)')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error(error);
        throw new Error('Không thể tải danh mục và món ăn');
    }
    return data;
}

// HÀM MỚI: Tạo một danh mục mới
export async function createCategory(name: string, restaurantId: string) {
    if (!name || !restaurantId) throw new Error('Tên danh mục và ID nhà hàng là bắt buộc');

    const { data, error } = await supabase
        .from('menus')
        .insert([{ name, restaurant_id: restaurantId }])
        .select()
        .single();

    if (error) {
        console.error('Lỗi khi tạo danh mục:', error);
        throw new Error('Không thể tạo danh mục mới.');
    }
    return data;
}

// HÀM MỚI: Xóa một danh mục
export async function deleteCategory(id: string) {
    // Lưu ý: Cần cấu hình 'ON DELETE CASCADE' trong database
    // để khi xóa danh mục, các món ăn thuộc danh mục đó cũng bị xóa.
    const { error } = await supabase.from('menus').delete().eq('id', id);

    if (error) {
        console.error('Lỗi khi xóa danh mục:', error);
        throw new Error('Không thể xóa danh mục.');
    }
}

// Hàm tạo/sửa món ăn
export async function createEditMenuItem({
  newItemData,
  id,
  restaurantId,
}: {
  newItemData: MenuItemFormData;
  id?: string;
  restaurantId: string;
}) {
  let imageUrlForDb = newItemData.image_url as string | undefined;

  // Xử lý upload ảnh nếu có ảnh mới được chọn
  if (newItemData.new_image_base64) {
    const fileName = `<span class="math-inline">\{restaurantId\}/</span>{Date.now()}.jpg`;
    const { data: uploadData, error: storageError } = await supabase.storage
      .from('menu-images') // Tên bucket của bạn trên Supabase
      .upload(fileName, decode(newItemData.new_image_base64), {
        contentType: 'image/jpeg',
      });

    if (storageError) {
      console.error('Lỗi upload ảnh:', storageError);
      throw new Error('Không thể tải ảnh món ăn lên.');
    }
    // Lấy URL công khai của ảnh vừa upload
    imageUrlForDb = `<span class="math-inline">\{process\.env\.EXPO\_PUBLIC\_SUPABASE\_URL\}/storage/v1/object/public/menu\-images/</span>{uploadData.path}`;
  }

  // Chuẩn bị dữ liệu để insert/update
  const dataToUpsert = {
    name: newItemData.name,
    description: newItemData.description,
    price: newItemData.price,
    menu_id: newItemData.menu_id,
    restaurant_id: restaurantId,
    image_url: imageUrlForDb,
  };

  let query;
  // Nếu có 'id' -> update, nếu không -> insert
  if (id) {
    query = supabase.from('menu_items').update(dataToUpsert).eq('id', id);
  } else {
    query = supabase.from('menu_items').insert([dataToUpsert]);
  }

  const { data, error } = await query.select().single();

  if (error) {
    console.error(`Lỗi khi ${id ? 'cập nhật' : 'tạo'} món ăn:`, error);
    throw new Error(`Không thể ${id ? 'cập nhật' : 'tạo'} món ăn.`);
  }

  return data;
}

// Hàm xóa món ăn
export async function deleteMenuItem(id: string) {
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) {
        console.error('Lỗi khi xóa món ăn:', error);
        throw new Error('Không thể xóa món ăn.');
    }
}