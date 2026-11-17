import { MenuItem, InventoryItem, Order, OrderItemRecord, PaymentStatus } from '../types';
import { INITIAL_MENU_ITEMS } from '../data/seedMenu';
import { INITIAL_INVENTORY_ITEMS } from '../data/seedInventory';
import { INITIAL_ORDERS } from '../data/seedOrders';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  MENU: 'shree_yash_menu_items_v1',
  INVENTORY: 'shree_yash_inventory_items_v1',
  ORDERS: 'shree_yash_orders_v1',
};

// ==================== INITIALIZATION & LOCAL CACHE ====================

export const getStoredMenu = (): MenuItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MENU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
      return INITIAL_MENU_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading menu from localStorage:', err);
    return INITIAL_MENU_ITEMS;
  }
};

export const getStoredInventory = (): InventoryItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
      return INITIAL_INVENTORY_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading inventory from localStorage:', err);
    return INITIAL_INVENTORY_ITEMS;
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading orders from localStorage:', err);
    return INITIAL_ORDERS;
  }
};

// ==================== UNIFIED REPOSITORY ====================

export const dbService = {
  // Check backend type
  isCloudConnected(): boolean {
    return isSupabaseConfigured && supabase !== null;
  },

  // --- MENU OPERATIONS ---
  async fetchMenuItems(): Promise<MenuItem[]> {
    if (this.isCloudConnected() && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('category', { ascending: true })
          .order('name', { ascending: true });
        
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local cache', e);
      }
    }
    return getStoredMenu();
  },

  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      ...item,
      id: 'menu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloudConnected() && supabase) {
      try {
        const { data, error } = await supabase
          .from('menu_items')
          .insert([newItem])
          .select()
          .single();
        if (!error && data) {
          const current = getStoredMenu();
          const updated = [data, ...current];
          localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
          return data;
        }
      } catch (e) {
        console.warn('Supabase insert failed, saving locally', e);
      }
    }

    const current = getStoredMenu();
    const updated = [newItem, ...current];
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
    return newItem;
  },

  async updateMenuItem(item: MenuItem): Promise<MenuItem> {
    const updatedItem = { ...item, updated_at: new Date().toISOString() };

    if (this.isCloudConnected() && supabase) {
      try {
        await supabase
          .from('menu_items')
          .update(updatedItem)
          .eq('id', item.id);
      } catch (e) {
        console.warn('Supabase update failed, saving locally', e);
      }
    }

    const current = getStoredMenu();
    const updated = current.map(m => (m.id === item.id ? updatedItem : m));
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
    return updatedItem;
  },

  async toggleOutOfStock(id: string, isOutOfStock: boolean): Promise<void> {
    if (this.isCloudConnected() && supabase) {
      try {
        await supabase
          .from('menu_items')
          .update({ is_out_of_stock: isOutOfStock, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase toggle failed', e);
      }
    }

    const current = getStoredMenu();
    const updated = current.map(m => (m.id === id ? { ...m, is_out_of_stock: isOutOfStock } : m));
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
  },

  async deleteMenuItem(id: string): Promise<void> {
    if (this.isCloudConnected() && supabase) {
      try {
        await supabase.from('menu_items').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete failed', e);
      }
    }

    const current = getStoredMenu();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(updated));
  },

  // --- INVENTORY OPERATIONS ---
  async fetchInventory(): Promise<InventoryItem[]> {
    if (this.isCloudConnected() && supabase) {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .order('name', { ascending: true });
        if (!error && data && data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(data));
          return data;
        }
      } catch (e) {
        console.warn('Supabase inventory fetch failed', e);
      }
    }
    return getStoredInventory();
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const newItem: InventoryItem = {
      ...item,
      id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      updated_at: new Date().toISOString(),
    };

    if (this.isCloudConnected() && supabase) {
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .insert([newItem])
          .select()
          .single();
        if (!error && data) {
          const current = getStoredInventory();
          localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify([...current, data]));
          return data;
        }
      } catch (e) {
        console.warn('Supabase inventory insert failed', e);
      }
    }

    const current = getStoredInventory();
    const updated = [...current, newItem];
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(updated));
    return newItem;
  },

  async updateStock(id: string, delta: number): Promise<InventoryItem | null> {
    const current = getStoredInventory();
    const target = current.find(i => i.id === id);
    if (!target) return null;

    const newQty = Math.max(0, Math.round((target.current_quantity + delta) * 10) / 10);
    const updatedItem = {
      ...target,
      current_quantity: newQty,
      updated_at: new Date().toISOString(),
    };

    if (this.isCloudConnected() && supabase) {
      try {
        await supabase
          .from('inventory_items')
          .update({ current_quantity: newQty, updated_at: updatedItem.updated_at })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase updateStock failed', e);
      }
    }

    const updatedList = current.map(i => (i.id === id ? updatedItem : i));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(updatedList));
    return updatedItem;
  },

  async updateInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    const updatedItem = { ...item, updated_at: new Date().toISOString() };

    if (this.isCloudConnected() && supabase) {
      try {
        await supabase.from('inventory_items').update(updatedItem).eq('id', item.id);
      } catch (e) {
        console.warn('Supabase updateInventoryItem failed', e);
      }
    }

    const current = getStoredInventory();
    const updatedList = current.map(i => (i.id === item.id ? updatedItem : i));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(updatedList));
    return updatedItem;
  },

  async deleteInventoryItem(id: string): Promise<void> {
    if (this.isCloudConnected() && supabase) {
      try {
        await supabase.from('inventory_items').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase delete inventory failed', e);
      }
    }

    const current = getStoredInventory();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(updated));
  },

  // --- ORDERS OPERATIONS ---
  async fetchOrders(): Promise<Order[]> {
    if (this.isCloudConnected() && supabase) {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false });

        if (!ordersError && ordersData && ordersData.length > 0) {
          const mapped: Order[] = ordersData.map((ord: any) => ({
            ...ord,
            items: ord.order_items || [],
          }));
          localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mapped));
          return mapped;
        }
      } catch (e) {
        console.warn('Supabase fetch orders failed', e);
      }
    }
    return getStoredOrders();
  },

  async createOrder(orderData: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      created_at: new Date().toISOString(),
    };

    if (this.isCloudConnected() && supabase) {
      try {
        const { items, ...orderRecord } = newOrder;
        const { data, error } = await supabase
          .from('orders')
          .insert([orderRecord])
          .select()
          .single();

        if (!error && data) {
          if (items && items.length > 0) {
            const itemsToInsert = items.map(item => ({
              ...item,
              order_id: data.id,
            }));
            await supabase.from('order_items').insert(itemsToInsert);
          }
        }
      } catch (e) {
        console.warn('Supabase createOrder failed, saving locally', e);
      }
    }

    const current = getStoredOrders();
    const updated = [newOrder, ...current];
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return newOrder;
  },

  async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<void> {
    if (this.isCloudConnected() && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ payment_status: status, payment_mode: status === 'paid' ? 'cash' : 'unpaid' })
          .eq('id', orderId);
      } catch (e) {
        console.warn('Supabase updatePaymentStatus failed', e);
      }
    }

    const current = getStoredOrders();
    const updated = current.map(o => (o.id === orderId ? { ...o, payment_status: status, payment_mode: status === 'paid' ? (o.payment_mode === 'unpaid' ? 'cash' : o.payment_mode) : 'unpaid' } : o));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  },

  // Reset database back to factory seeds if needed
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(INITIAL_MENU_ITEMS));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY_ITEMS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  }
};
