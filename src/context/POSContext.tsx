import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  MenuItem,
  InventoryItem,
  Order,
  CartItem,
  PortionType,
  OrderType,
  PaymentMode,
  TabType,
  PaymentStatus,
} from '../types';
import { dbService } from '../lib/db';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CustomPriceRequest {
  menuItem: MenuItem;
  portion: PortionType;
}

interface POSContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Menu State
  menuItems: MenuItem[];
  isLoadingMenu: boolean;
  refreshMenu: () => Promise<void>;
  addNewDish: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
  updateDish: (item: MenuItem) => Promise<void>;
  toggleOutOfStockDish: (id: string, isOutOfStock: boolean) => Promise<void>;
  deleteDish: (id: string) => Promise<void>;

  // Inventory State
  inventoryItems: InventoryItem[];
  lowStockItems: InventoryItem[];
  isLoadingInventory: boolean;
  refreshInventory: () => Promise<void>;
  addNewIngredient: (item: Omit<InventoryItem, 'id'>) => Promise<InventoryItem>;
  adjustIngredientStock: (id: string, delta: number) => Promise<void>;
  updateIngredient: (item: InventoryItem) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;

  // Orders & Sales State
  orders: Order[];
  isLoadingOrders: boolean;
  refreshOrders: () => Promise<void>;
  markOrderPaid: (orderId: string) => Promise<void>;

  // Cart / Current Order POS State
  cart: CartItem[];
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: number | null;
  setTableNumber: (table: number | null) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  kitchenNotes: string;
  setKitchenNotes: (notes: string) => void;
  paymentMode: PaymentMode;
  setPaymentMode: (mode: PaymentMode) => void;

  addToCart: (menuItem: MenuItem, portion: PortionType, customPrice?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  getItemPortionCount: (menuItemId: string, portion: PortionType) => number;
  cartTotal: number;
  cartItemCount: number;

  // Checkout Drawer
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;

  // Modals
  customPriceRequest: CustomPriceRequest | null;
  openCustomPriceModal: (menuItem: MenuItem, portion: PortionType) => void;
  closeCustomPriceModal: () => void;
  confirmCustomPrice: (price: number) => void;

  activeReceipt: Order | null;
  openReceiptModal: (order: Order) => void;
  closeReceiptModal: () => void;

  // Actions
  placeOrder: () => Promise<Order | null>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  isCloudConnected: boolean;
  resetDatabase: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('pos');

  // Master Data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Loadings
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Cart & POS Configuration
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState<number | null>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [kitchenNotes, setKitchenNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('upi');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [customPriceRequest, setCustomPriceRequest] = useState<CustomPriceRequest | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const isCloudConnected = dbService.isCloudConnected();

  // Toast System
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Initial Data Fetching
  const refreshMenu = async () => {
    setIsLoadingMenu(true);
    const data = await dbService.fetchMenuItems();
    setMenuItems(data);
    setIsLoadingMenu(false);
  };

  const refreshInventory = async () => {
    setIsLoadingInventory(true);
    const data = await dbService.fetchInventory();
    setInventoryItems(data);
    setIsLoadingInventory(false);
  };

  const refreshOrders = async () => {
    setIsLoadingOrders(true);
    const data = await dbService.fetchOrders();
    setOrders(data);
    setIsLoadingOrders(false);
  };

  useEffect(() => {
    refreshMenu();
    refreshInventory();
    refreshOrders();
  }, []);

  // Low stock computation
  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(item => item.current_quantity <= item.min_threshold);
  }, [inventoryItems]);

  // Cart Calculations
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const getItemPortionCount = (menuItemId: string, portion: PortionType): number => {
    return cart
      .filter(item => item.menuItem.id === menuItemId && item.portion === portion)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // Cart Operations
  const addToCart = (menuItem: MenuItem, portion: PortionType, customPrice?: number) => {
    let resolvedPrice: number | null = null;
    if (customPrice !== undefined) {
      resolvedPrice = customPrice;
    } else if (portion === 'Half') {
      resolvedPrice = menuItem.half_price;
    } else if (portion === 'Full') {
      resolvedPrice = menuItem.full_price;
    }

    // If price is null / variable, trigger custom price modal!
    if (resolvedPrice === null || isNaN(resolvedPrice)) {
      openCustomPriceModal(menuItem, portion);
      return;
    }

    const cartItemId = `${menuItem.id}_${portion}_${resolvedPrice}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          menuItem,
          portion,
          price: resolvedPrice!,
          quantity: 1,
        },
      ];
    });

    showToast(`Added ${menuItem.name} (${portion}) to order`, 'info');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      const target = prev.find(item => item.cartItemId === cartItemId);
      if (!target) return prev;
      const newQty = target.quantity + delta;
      if (newQty <= 0) {
        return prev.filter(item => item.cartItemId !== cartItemId);
      }
      return prev.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
    setKitchenNotes('');
    setCustomerName('');
    setCustomerPhone('');
  };

  // Custom Price Modal
  const openCustomPriceModal = (menuItem: MenuItem, portion: PortionType) => {
    setCustomPriceRequest({ menuItem, portion });
  };

  const closeCustomPriceModal = () => {
    setCustomPriceRequest(null);
  };

  const confirmCustomPrice = (price: number) => {
    if (!customPriceRequest) return;
    const { menuItem, portion } = customPriceRequest;
    addToCart(menuItem, portion, price);
    closeCustomPriceModal();
  };

  // Receipt Modal
  const openReceiptModal = (order: Order) => {
    setActiveReceipt(order);
  };

  const closeReceiptModal = () => {
    setActiveReceipt(null);
  };

  // Place Order Action
  const placeOrder = async (): Promise<Order | null> => {
    if (cart.length === 0) {
      showToast('Your order cart is empty!', 'error');
      return null;
    }

    const orderNum = `SY-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentStatus: PaymentStatus = paymentMode === 'unpaid' ? 'unpaid' : 'paid';

    const orderItemsRecord = cart.map(item => ({
      id: 'oi-' + Math.random().toString(36).substring(2, 8),
      order_id: '',
      menu_item_id: item.menuItem.id,
      item_name: item.menuItem.name,
      category: item.menuItem.category,
      portion: item.portion,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const newOrderData: Omit<Order, 'id' | 'created_at'> = {
      order_number: orderNum,
      order_type: orderType,
      table_number: orderType === 'dine_in' ? (tableNumber || 1) : null,
      customer_name: customerName.trim() || undefined,
      customer_phone: customerPhone.trim() || undefined,
      kitchen_notes: kitchenNotes.trim() || undefined,
      payment_mode: paymentMode,
      payment_status: paymentStatus,
      total_amount: cartTotal,
      item_count: cartItemCount,
      items: orderItemsRecord,
    };

    try {
      const created = await dbService.createOrder(newOrderData);
      setOrders(prev => [created, ...prev]);

      // Confetti celebration
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#F97316', '#22C55E', '#F59E0B', '#FFFFFF'],
        });
      } catch (e) {
        // ignore confetti errors
      }

      showToast(`Order #${created.order_number} placed successfully!`, 'success');
      clearCart();
      setIsDrawerOpen(false);
      openReceiptModal(created);
      return created;
    } catch (err) {
      console.error('Order creation error:', err);
      showToast('Failed to place order. Please try again.', 'error');
      return null;
    }
  };

  // Menu Admin Operations
  const addNewDish = async (dishData: Omit<MenuItem, 'id'>) => {
    const created = await dbService.addMenuItem(dishData);
    setMenuItems(prev => [created, ...prev]);
    showToast(`Added "${created.name}" to menu!`, 'success');
    return created;
  };

  const updateDish = async (dish: MenuItem) => {
    const updated = await dbService.updateMenuItem(dish);
    setMenuItems(prev => prev.map(m => (m.id === dish.id ? updated : m)));
    showToast(`Updated "${dish.name}"!`, 'success');
  };

  const toggleOutOfStockDish = async (id: string, isOutOfStock: boolean) => {
    await dbService.toggleOutOfStock(id, isOutOfStock);
    setMenuItems(prev =>
      prev.map(m => (m.id === id ? { ...m, is_out_of_stock: isOutOfStock } : m))
    );
    showToast(isOutOfStock ? 'Item marked Out of Stock' : 'Item marked Available', 'info');
  };

  const deleteDish = async (id: string) => {
    await dbService.deleteMenuItem(id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
    showToast('Dish removed from master menu', 'info');
  };

  // Inventory Operations
  const addNewIngredient = async (ingredientData: Omit<InventoryItem, 'id'>) => {
    const created = await dbService.addInventoryItem(ingredientData);
    setInventoryItems(prev => [...prev, created]);
    showToast(`Added "${created.name}" to inventory!`, 'success');
    return created;
  };

  const adjustIngredientStock = async (id: string, delta: number) => {
    const updated = await dbService.updateStock(id, delta);
    if (updated) {
      setInventoryItems(prev => prev.map(i => (i.id === id ? updated : i)));
      showToast(
        `${delta > 0 ? '+' : ''}${delta} ${updated.unit} for ${updated.name}`,
        'info'
      );
    }
  };

  const updateIngredient = async (ingredient: InventoryItem) => {
    const updated = await dbService.updateInventoryItem(ingredient);
    setInventoryItems(prev => prev.map(i => (i.id === ingredient.id ? updated : i)));
    showToast(`Updated "${ingredient.name}"!`, 'success');
  };

  const deleteIngredient = async (id: string) => {
    await dbService.deleteInventoryItem(id);
    setInventoryItems(prev => prev.filter(i => i.id !== id));
    showToast('Ingredient removed from inventory', 'info');
  };

  // Orders Admin Operations
  const markOrderPaid = async (orderId: string) => {
    await dbService.updatePaymentStatus(orderId, 'paid');
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, payment_status: 'paid', payment_mode: o.payment_mode === 'unpaid' ? 'cash' : o.payment_mode } : o))
    );
    showToast('Order marked as Paid!', 'success');
  };

  const resetDatabase = () => {
    if (window.confirm('Reset all menu, inventory, and orders to original default seeds?')) {
      dbService.resetToDefaults();
      refreshMenu();
      refreshInventory();
      refreshOrders();
      clearCart();
      showToast('Database reset to defaults!', 'info');
    }
  };

  return (
    <POSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        menuItems,
        isLoadingMenu,
        refreshMenu,
        addNewDish,
        updateDish,
        toggleOutOfStockDish,
        deleteDish,
        inventoryItems,
        lowStockItems,
        isLoadingInventory,
        refreshInventory,
        addNewIngredient,
        adjustIngredientStock,
        updateIngredient,
        deleteIngredient,
        orders,
        isLoadingOrders,
        refreshOrders,
        markOrderPaid,
        cart,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        kitchenNotes,
        setKitchenNotes,
        paymentMode,
        setPaymentMode,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        getItemPortionCount,
        cartTotal,
        cartItemCount,
        isDrawerOpen,
        setIsDrawerOpen,
        customPriceRequest,
        openCustomPriceModal,
        closeCustomPriceModal,
        confirmCustomPrice,
        activeReceipt,
        openReceiptModal,
        closeReceiptModal,
        placeOrder,
        toasts,
        showToast,
        isCloudConnected,
        resetDatabase,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
