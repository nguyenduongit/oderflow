export interface SignupCredentials {
  fullName?: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
export interface NewRestaurantData {
  name: string;
  address?: string;
  phone_number?: string;
}
export interface TableWithStatus {
  id: string;
  table_number: number;
  status: 'vacant' | 'occupied';
  active_order_id: string | null;
  is_active: boolean;
}
export interface MenuItem {
  id: string;
  menu_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export interface MenuCategoryWithItems {
  id: string;
  name: string;
  menu_items: MenuItem[];
}

export type MenuItemFormData = {
  name: string;
  description?: string;
  price: number;
  menu_id: string;
  image_url?: string;
  new_image_base64?: string; // Dữ liệu ảnh mới dưới dạng base64
};
export interface Plan {
    name: string;
    max_tables: number;
}

export interface Subscription {
    status: 'active' | 'expired' | 'cancelled';
    plans: Plan | null;
}

export interface QrCodeTable {
  id: string;
  table_number: number;
  is_active: boolean;
}

export interface OrderingMenuData {
  restaurant: {
    id: string;
    name: string;
    table_number: number;
  };
  menu: MenuCategoryWithItems[];
}