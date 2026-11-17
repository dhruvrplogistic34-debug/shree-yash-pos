export type CuisineType = 'Chinese' | 'Indian' | string;

export type CategoryType = 'Soups' | 'Starters' | 'Noodles' | 'Rice' | string;

export interface MenuItem {
  id: string;
  name: string;
  cuisine: string;
  category: string;
  is_veg: boolean;
  half_price: number | null; // null means custom / market price
  full_price: number | null; // null means custom / market price
  is_out_of_stock?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type PortionType = 'Half' | 'Full' | 'Custom';

export interface CartItem {
  cartItemId: string; // unique for this entry (e.g. dishId + portion + customPrice)
  menuItem: MenuItem;
  portion: PortionType;
  price: number;
  quantity: number;
}

export type OrderType = 'dine_in' | 'takeaway';

export type PaymentMode = 'upi' | 'cash' | 'unpaid';

export type PaymentStatus = 'paid' | 'unpaid';

export interface OrderItemRecord {
  id: string;
  order_id: string;
  menu_item_id?: string;
  item_name: string;
  category: string;
  portion: PortionType;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  order_type: OrderType;
  table_number: number | null; // 1-15 for dine_in
  customer_name?: string;
  customer_phone?: string;
  kitchen_notes?: string;
  payment_mode: PaymentMode;
  payment_status: PaymentStatus;
  total_amount: number;
  item_count: number;
  items: OrderItemRecord[];
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  current_quantity: number;
  unit: 'kg' | 'liters' | 'packets' | 'pcs' | string;
  min_threshold: number;
  category?: string;
  updated_at?: string;
}

export type TabType = 'pos' | 'menu' | 'inventory' | 'analytics';

export type DateFilterType = 'today' | 'yesterday' | 'week' | 'month' | 'custom';
