import React from 'react';
import { usePOS } from '../context/POSContext';
import {
  ShoppingBag,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  Utensils,
  Package,
  CreditCard,
  Banknote,
  Clock,
  Sparkles,
} from 'lucide-react';
import { VegBadge } from './VegBadge';

export const CheckoutDrawer: React.FC = () => {
  const {
    cart,
    cartItemCount,
    cartTotal,
    isDrawerOpen,
    setIsDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
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
    placeOrder,
  } = usePOS();

  if (cartItemCount === 0 && !isDrawerOpen) {
    return null;
  }

  const quickNotes = ['Less Spicy', 'No Ajinomoto', 'Extra Schezwan', 'Crispy', 'Separate Gravy'];

  const addQuickNote = (note: string) => {
    if (!kitchenNotes) {
      setKitchenNotes(note);
    } else if (!kitchenNotes.includes(note)) {
      setKitchenNotes(`${kitchenNotes}, ${note}`);
    }
  };

  return (
    <>
      {/* Backdrop for open drawer */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity animate-in fade-in"
        />
      )}

      {/* Floating Sticky Bar (When Closed) */}
      {!isDrawerOpen && cartItemCount > 0 && (
        <div className="fixed bottom-[72px] left-0 right-0 z-40 px-3 max-w-md mx-auto pointer-events-auto">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-2xl p-3.5 shadow-2xl flex items-center justify-between border border-orange-400/30 transition transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="relative bg-black/25 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold text-sm">
                <ShoppingBag className="w-4 h-4" />
                <span>{cartItemCount}</span>
              </div>
              <div className="text-left">
                <div className="text-xs text-orange-100 font-medium">Current Order</div>
                <div className="text-base font-extrabold tracking-tight">₹{cartTotal}</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold bg-white/20 px-3 py-1.5 rounded-xl uppercase tracking-wider backdrop-blur-xs">
              <span>Checkout</span>
              <ChevronUp className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Expanded Sliding Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto bg-[#1A1D24] border-t border-[#2F3443] rounded-t-3xl shadow-drawer flex flex-col max-h-[88vh] animate-in slide-in-from-bottom duration-300">
          {/* Drawer Handle & Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Order Summary
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {cartItemCount} items
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 transition text-xs flex items-center gap-1 font-medium"
                  title="Clear all items"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[11px]">Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Order Details */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto opacity-30" />
                <p className="text-sm font-medium">Your order tray is currently empty</p>
                <p className="text-xs text-zinc-600">Select dishes from the menu to build an order</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cart.map(item => (
                  <div
                    key={item.cartItemId}
                    className="bg-[#12141A] border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="mt-1">
                        <VegBadge isVeg={item.menuItem.is_veg} size="sm" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-sm font-bold text-white truncate">
                          {item.menuItem.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                          <span className="bg-zinc-800/90 text-brand-orange px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {item.portion}
                          </span>
                          <span>₹{item.price} each</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity - / + Counter */}
                    <div className="flex items-center gap-1.5 bg-zinc-800/90 rounded-xl p-1 border border-zinc-700/40">
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, -1)}
                        className="w-7 h-7 rounded-lg bg-zinc-700/60 hover:bg-zinc-600 text-zinc-200 flex items-center justify-center transition active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.cartItemId, 1)}
                        className="w-7 h-7 rounded-lg bg-brand-orange hover:bg-orange-600 text-white flex items-center justify-center transition active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right w-14 flex-shrink-0">
                      <span className="text-sm font-extrabold text-white">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ORDER TYPE SELECTION (Dine-In vs Takeaway) */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-brand-orange" /> Order Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('dine_in')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    orderType === 'dine_in'
                      ? 'bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange/30'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  Dine-In
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('takeaway')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    orderType === 'takeaway'
                      ? 'bg-brand-orange/20 border-brand-orange text-white shadow-glow-orange/30'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Takeaway / Parcel
                </button>
              </div>

              {/* TABLE #1 to #15 SELECTOR (if Dine-In) */}
              {orderType === 'dine_in' && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-300">Select Table Number:</span>
                    <span className="text-brand-orange font-bold">
                      Table #{tableNumber || 'None'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setTableNumber(num)}
                        className={`h-9 rounded-xl border text-xs font-black transition active:scale-95 ${
                          tableNumber === num
                            ? 'bg-brand-orange text-white border-orange-400 shadow-glow-orange'
                            : 'bg-zinc-800/80 border-zinc-700/60 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        T-{num}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* KITCHEN NOTES INPUT & QUICK CHIPS */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Kitchen Instructions
              </label>
              <input
                type="text"
                value={kitchenNotes}
                onChange={e => setKitchenNotes(e.target.value)}
                placeholder="e.g. Less spicy, No Ajinomoto, crispy..."
                className="w-full bg-[#12141A] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange transition"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickNotes.map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => addQuickNote(n)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-zinc-800/90 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/40 active:scale-95 transition"
                  >
                    + {n}
                  </button>
                ))}
              </div>
            </div>

            {/* OPTIONAL CUSTOMER DETAILS */}
            <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Customer Details (Optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="bg-[#12141A] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange transition"
                />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Phone (WhatsApp)"
                  className="bg-[#12141A] border border-zinc-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange transition"
                />
              </div>
            </div>

            {/* PAYMENT MODE SELECTOR */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/80">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('upi')}
                  className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
                    paymentMode === 'upi'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-glow-veg/30'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  UPI / QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('cash')}
                  className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
                    paymentMode === 'cash'
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-amber-400" />
                  Cash
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('unpaid')}
                  className={`py-2 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
                    paymentMode === 'unpaid'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                      : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Clock className="w-4 h-4 text-rose-400" />
                  Pending
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Sticky Action Footer */}
          <div className="p-4 border-t border-zinc-800 bg-[#12141A]">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-zinc-400 font-semibold">Grand Total:</span>
              <span className="text-2xl font-black text-white">₹{cartTotal}</span>
            </div>
            <button
              type="button"
              onClick={placeOrder}
              disabled={cart.length === 0}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-black text-base shadow-glow-orange flex items-center justify-center gap-2 active:scale-98 transition"
            >
              <Utensils className="w-5 h-5" />
              Place Order &amp; Generate Bill
            </button>
          </div>
        </div>
      )}
    </>
  );
};
