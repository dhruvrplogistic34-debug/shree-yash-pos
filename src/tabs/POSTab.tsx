import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { MenuItem, PortionType } from '../types';
import { Search, X, Plus, Minus, AlertCircle } from 'lucide-react';
import { VegBadge } from '../components/VegBadge';

export const POSTab: React.FC = () => {
  const {
    menuItems,
    isLoadingMenu,
    addToCart,
    updateCartQuantity,
    getItemPortionCount,
    cart,
    openCustomPriceModal,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegFilter, setVegFilter] = useState<'All' | 'Veg' | 'NonVeg'>('All');

  // Discover distinct cuisines and categories from actual menu
  const cuisines = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(item => {
      if (item.cuisine) set.add(item.cuisine);
    });
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(item => {
      if (selectedCuisine === 'All' || item.cuisine === selectedCuisine) {
        if (item.category) set.add(item.category);
      }
    });
    return ['All', ...Array.from(set)];
  }, [menuItems, selectedCuisine]);

  // Filtered menu items
  const filteredDishes = useMemo(() => {
    return menuItems.filter(item => {
      // Cuisine match
      if (selectedCuisine !== 'All' && item.cuisine !== selectedCuisine) {
        return false;
      }
      // Category match
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Veg/NonVeg match
      if (vegFilter === 'Veg' && !item.is_veg) return false;
      if (vegFilter === 'NonVeg' && item.is_veg) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.cuisine.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [menuItems, selectedCuisine, selectedCategory, vegFilter, searchQuery]);

  // Group filtered dishes by Category for structured restaurant ordering
  const dishesByCategory = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    filteredDishes.forEach(dish => {
      const cat = dish.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(dish);
    });
    return Array.from(map.entries());
  }, [filteredDishes]);

  const handlePortionClick = (dish: MenuItem, portion: PortionType) => {
    if (dish.is_out_of_stock) return;

    const price = portion === 'Half' ? dish.half_price : dish.full_price;
    if (price === null) {
      openCustomPriceModal(dish, portion);
    } else {
      addToCart(dish, portion);
    }
  };

  const handleIncrement = (dish: MenuItem, portion: PortionType) => {
    if (dish.is_out_of_stock) return;
    const price = portion === 'Half' ? dish.half_price : dish.full_price;
    if (price === null) {
      // For custom price items, find existing cart item or open modal
      const existing = cart.find(
        i => i.menuItem.id === dish.id && i.portion === portion
      );
      if (existing) {
        updateCartQuantity(existing.cartItemId, 1);
      } else {
        openCustomPriceModal(dish, portion);
      }
    } else {
      const cartItemId = `${dish.id}_${portion}_${price}`;
      updateCartQuantity(cartItemId, 1);
    }
  };

  const handleDecrement = (dish: MenuItem, portion: PortionType) => {
    // Find matching cart item
    const existing = cart.find(
      i => i.menuItem.id === dish.id && i.portion === portion
    );
    if (existing) {
      updateCartQuantity(existing.cartItemId, -1);
    }
  };

  return (
    <div className="pb-36 pt-2 px-3 sm:px-4 max-w-4xl mx-auto space-y-3.5">
      {/* Search & Fast Veg/Non-Veg Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search 50+ dishes (e.g. Hakka, Soup, Manchurian)..."
            className="w-full bg-[#1A1D24] border border-zinc-800 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cuisine & Veg/Non-Veg Fast Switchers */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          {/* Cuisine Pill Tabs */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {cuisines.map(c => (
              <button
                key={c}
                onClick={() => {
                  setSelectedCuisine(c);
                  setSelectedCategory('All');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCuisine === c
                    ? 'bg-brand-orange text-white shadow-glow-orange/30'
                    : 'bg-[#1A1D24] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {c === 'All' ? 'All Cuisines' : c}
              </button>
            ))}
          </div>

          {/* Quick Veg/Non-Veg Filter */}
          <div className="flex items-center gap-1 bg-[#1A1D24] border border-zinc-800 p-0.5 rounded-xl flex-shrink-0">
            <button
              onClick={() => setVegFilter('All')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                vegFilter === 'All' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setVegFilter('Veg')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                vegFilter === 'Veg'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Veg
            </button>
            <button
              onClick={() => setVegFilter('NonVeg')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                vegFilter === 'NonVeg'
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                  : 'text-zinc-400'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Non-Veg
            </button>
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-white text-zinc-950 font-bold shadow-md'
                  : 'bg-[#1A1D24]/90 text-zinc-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              {cat === 'All' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Dishes List */}
      {isLoadingMenu ? (
        <div className="py-20 text-center text-zinc-500">
          <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading menu dishes...</p>
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="py-16 text-center text-zinc-500 bg-[#1A1D24]/50 border border-zinc-800/60 rounded-3xl p-6">
          <AlertCircle className="w-10 h-10 mx-auto text-zinc-600 mb-2" />
          <h4 className="text-sm font-bold text-zinc-300">No dishes match your filters</h4>
          <p className="text-xs text-zinc-500 mt-1">Try clearing your search query or filters.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {dishesByCategory.map(([categoryName, dishes]) => (
            <div key={categoryName} className="space-y-2">
              {/* Category Sticky Heading */}
              <div className="flex items-center justify-between sticky top-[61px] z-20 bg-[#0F1115]/95 backdrop-blur-xs py-1 px-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-orange flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-brand-orange rounded-full" />
                  {categoryName}
                  <span className="text-[11px] font-medium text-zinc-500">
                    ({dishes.length})
                  </span>
                </h3>
              </div>

              {/* Grid of Dishes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {dishes.map(dish => {
                  const halfCount = getItemPortionCount(dish.id, 'Half');
                  const fullCount = getItemPortionCount(dish.id, 'Full');
                  const isOutOfStock = Boolean(dish.is_out_of_stock);

                  return (
                    <div
                      key={dish.id}
                      className={`relative bg-[#1A1D24] border rounded-2xl p-3 flex flex-col justify-between gap-2.5 transition ${
                        isOutOfStock
                          ? 'opacity-45 border-zinc-800/50 bg-zinc-900/40 pointer-events-none'
                          : 'border-[#262A36] hover:border-zinc-700 shadow-sm'
                      }`}
                    >
                      {/* Top Row: Badge, Name, Out of Stock pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="mt-0.5 flex-shrink-0">
                            <VegBadge isVeg={dish.is_veg} size="md" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                              {dish.name}
                            </h4>
                            <div className="text-[11px] text-zinc-400 font-medium">
                              {dish.cuisine} &bull; {dish.category}
                            </div>
                          </div>
                        </div>

                        {isOutOfStock && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/50 flex-shrink-0">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* Bottom Row: Side-by-Side Half / Full Tap Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-800/60">
                        {/* HALF BUTTON / COUNTER */}
                        <div className="relative">
                          {halfCount === 0 ? (
                            <button
                              type="button"
                              onClick={() => handlePortionClick(dish, 'Half')}
                              disabled={isOutOfStock}
                              className="w-full py-2 px-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 border border-zinc-700/60 text-left transition flex items-center justify-between"
                            >
                              <span className="text-[11px] font-bold text-zinc-300">Half</span>
                              <span className="text-xs font-black text-brand-orange">
                                {dish.half_price !== null ? `₹${dish.half_price}` : 'Custom'}
                              </span>
                            </button>
                          ) : (
                            <div className="w-full py-1 px-1 rounded-xl bg-brand-orange/15 border border-brand-orange/40 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleDecrement(dish, 'Half')}
                                className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white flex items-center justify-center transition active:scale-90"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <div className="text-center">
                                <span className="text-[10px] font-bold text-brand-orange block leading-none">
                                  Half
                                </span>
                                <span className="text-xs font-black text-white leading-tight">
                                  {halfCount}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleIncrement(dish, 'Half')}
                                className="w-6 h-6 rounded-lg bg-brand-orange text-white flex items-center justify-center transition active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* FULL BUTTON / COUNTER */}
                        <div className="relative">
                          {fullCount === 0 ? (
                            <button
                              type="button"
                              onClick={() => handlePortionClick(dish, 'Full')}
                              disabled={isOutOfStock}
                              className="w-full py-2 px-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 active:scale-95 border border-zinc-700/60 text-left transition flex items-center justify-between"
                            >
                              <span className="text-[11px] font-bold text-zinc-300">Full</span>
                              <span className="text-xs font-black text-brand-orange">
                                {dish.full_price !== null ? `₹${dish.full_price}` : 'Custom'}
                              </span>
                            </button>
                          ) : (
                            <div className="w-full py-1 px-1 rounded-xl bg-brand-orange/15 border border-brand-orange/40 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleDecrement(dish, 'Full')}
                                className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-200 hover:text-white flex items-center justify-center transition active:scale-90"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <div className="text-center">
                                <span className="text-[10px] font-bold text-brand-orange block leading-none">
                                  Full
                                </span>
                                <span className="text-xs font-black text-white leading-tight">
                                  {fullCount}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleIncrement(dish, 'Full')}
                                className="w-6 h-6 rounded-lg bg-brand-orange text-white flex items-center justify-center transition active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
