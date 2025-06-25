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

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'payment_requested' | 'paid' | 'cancelled';
export type OrderItemStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'out_of_stock' | 'cancelled';

export interface OrderItem {
    id: string;
    quantity: number;
    unit_price: number;
    item_name: string;
    batch_number: number;
    status: OrderItemStatus;
}

export interface OrderDetail {
    id: string;
    created_at: string;
    status: OrderStatus;
    total_amount: number;
    order_items: OrderItem[];
}