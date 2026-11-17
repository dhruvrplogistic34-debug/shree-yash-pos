import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { MenuItem } from '../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  BookOpen,
} from 'lucide-react';
import { VegBadge } from '../components/VegBadge';

export const MenuManagerTab: React.FC = () => {
  const { menuItems, addNewDish, updateDish, toggleOutOfStockDish, deleteDish } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);
  const [deletingDish, setDeletingDish] = useState<MenuItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('Chinese');
  const [customCuisine, setCustomCuisine] = useState('');
  const [category, setCategory] = useState('Starters');
  const [customCategory, setCustomCategory] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [halfPrice, setHalfPrice] = useState<string>('');
  const [fullPrice, setFullPrice] = useState<string>('');

  // Extract Cuisines & Categories
  const cuisines = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(m => m.cuisine && set.add(m.cuisine));
    set.add('Chinese');
    set.add('Indian');
    return Array.from(set);
  }, [menuItems]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(m => m.category && set.add(m.category));
    set.add('Soups');
    set.add('Starters');
    set.add('Noodles');
    set.add('Rice');
    set.add('Roti / Naan');
    set.add('Main Course');
    set.add('Biryani');
    return Array.from(set);
  }, [menuItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (filterCuisine !== 'All' && item.cuisine !== filterCuisine) return false;
      if (filterCategory !== 'All' && item.category !== filterCategory) return false;
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
  }, [menuItems, filterCuisine, filterCategory, searchQuery]);

  const openAddModal = () => {
    setName('');
    setCuisine('Chinese');
    setCustomCuisine('');
    setCategory('Starters');
    setCustomCategory('');
    setIsVeg(true);
    setIsCustomPrice(false);
    setHalfPrice('');
    setFullPrice('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setName(dish.name);
    setCuisine(dish.cuisine);
    setCustomCuisine('');
    setCategory(dish.category);
    setCustomCategory('');
    setIsVeg(dish.is_veg);
    setIsCustomPrice(dish.half_price === null && dish.full_price === null);
    setHalfPrice(dish.half_price !== null ? dish.half_price.toString() : '');
    setFullPrice(dish.full_price !== null ? dish.full_price.toString() : '');
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a dish name');
      return;
    }

    const finalCuisine = customCuisine.trim() || cuisine;
    const finalCategory = customCategory.trim() || category;

    const parsedHalf = isCustomPrice ? null : halfPrice ? parseFloat(halfPrice) : null;
    const parsedFull = isCustomPrice ? null : fullPrice ? parseFloat(fullPrice) : null;

    if (editingDish) {
      await updateDish({
        ...editingDish,
        name: name.trim(),
        cuisine: finalCuisine,
        category: finalCategory,
        is_veg: isVeg,
        half_price: parsedHalf,
        full_price: parsedFull,
      });
      setEditingDish(null);
    } else {
      await addNewDish({
        name: name.trim(),
        cuisine: finalCuisine,
        category: finalCategory,
        is_veg: isVeg,
        half_price: parsedHalf,
        full_price: parsedFull,
        is_out_of_stock: false,
      });
      setIsAddModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingDish) return;
    await deleteDish(deletingDish.id);
    setDeletingDish(null);
  };

  const totalDishes = menuItems.length;
  const outOfStockCount = menuItems.filter(m => m.is_out_of_stock).length;

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Top Banner & Add Dish Action */}
      <div className="bg-[#1A1D24] border border-[#2B303E] rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-orange" />
            <h2 className="text-base font-extrabold text-white">Master Menu Manager</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage master pricing, stock availability, or add new dishes &amp; cuisines.
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-semibold">
              Total: {totalDishes}
            </span>
            {outOfStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-500/30 font-semibold">
                {outOfStockCount} Out of Stock
              </span>
            )}
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow-orange active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          Add New Dish
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search master menu..."
            className="w-full bg-[#1A1D24] border border-zinc-800 rounded-2xl pl-10 pr-9 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <select
            value={filterCuisine}
            onChange={e => setFilterCuisine(e.target.value)}
            className="bg-[#1A1D24] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-hidden"
          >
            <option value="All">All Cuisines</option>
            {cuisines.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="bg-[#1A1D24] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Master Menu Table / List */}
      <div className="space-y-2">
        {filteredItems.map(dish => {
          const isOutOfStock = Boolean(dish.is_out_of_stock);

          return (
            <div
              key={dish.id}
              className={`bg-[#1A1D24] border rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                isOutOfStock ? 'border-rose-900/40 bg-zinc-900/60' : 'border-[#262A36]'
              }`}
            >
              {/* Left Column: Veg Badge, Name, Category */}
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="mt-1">
                  <VegBadge isVeg={dish.is_veg} size="md" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{dish.name}</h4>
                    {isOutOfStock && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800/40">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                      {dish.cuisine}
                    </span>
                    <span>&bull;</span>
                    <span className="text-zinc-300">{dish.category}</span>
                  </div>
                </div>
              </div>

              {/* Price Details */}
              <div className="flex items-center gap-3 text-xs flex-shrink-0">
                <div className="bg-[#0F1115] px-2.5 py-1.5 rounded-xl border border-zinc-800 flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-zinc-500 block leading-tight">Half</span>
                    <span className="font-bold text-white">
                      {dish.half_price !== null ? `₹${dish.half_price}` : 'Var'}
                    </span>
                  </div>
                  <div className="w-[1px] h-6 bg-zinc-800" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block leading-tight">Full</span>
                    <span className="font-bold text-white">
                      {dish.full_price !== null ? `₹${dish.full_price}` : 'Var'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls: Out of Stock Switch, Edit, Delete */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                {/* Out of Stock Switch */}
                <button
                  type="button"
                  onClick={() => toggleOutOfStockDish(dish.id, !isOutOfStock)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
                    isOutOfStock
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20'
                  }`}
                  title={isOutOfStock ? 'Click to make Available' : 'Click to mark Out of Stock'}
                >
                  {isOutOfStock ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-rose-400" />
                      <span>Sold Out</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-emerald-400" />
                      <span>Available</span>
                    </>
                  )}
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(dish)}
                  className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/40 transition active:scale-95"
                  title="Edit Dish"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeletingDish(dish)}
                  className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/40 transition active:scale-95"
                  title="Delete Dish"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT DISH MODAL */}
      {(isAddModalOpen || editingDish) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 overflow-y-auto animate-in fade-in">
          <div className="bg-[#1A1D24] border border-[#2F3443] w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-orange" />
                {editingDish ? 'Edit Dish Details' : 'Add New Dish to Menu'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingDish(null);
                }}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="space-y-3.5 text-xs">
              {/* Dish Name */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Paneer Tikka Masala, Chicken 65"
                  className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange"
                />
              </div>

              {/* Veg / Non-Veg Option */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Food Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVeg(true)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                      isVeg
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-glow-veg/30'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <VegBadge isVeg={true} size="sm" />
                    Vegetarian
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVeg(false)}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                      !isVeg
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-glow-nonveg/30'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <VegBadge isVeg={false} size="sm" />
                    Non-Vegetarian
                  </button>
                </div>
              </div>

              {/* Cuisine Selection */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Cuisine
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={cuisine}
                    onChange={e => setCuisine(e.target.value)}
                    className="bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    {cuisines.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="New">+ Create New...</option>
                  </select>
                  {cuisine === 'New' && (
                    <input
                      type="text"
                      value={customCuisine}
                      onChange={e => setCustomCuisine(e.target.value)}
                      placeholder="e.g. Indian, Tandoor"
                      className="bg-[#0F1115] border border-brand-orange rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden"
                    />
                  )}
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="New">+ Create New...</option>
                  </select>
                  {category === 'New' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      placeholder="e.g. Biryani, Desserts"
                      className="bg-[#0F1115] border border-brand-orange rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden"
                    />
                  )}
                </div>
              </div>

              {/* Variable Price Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-700/50">
                  <input
                    type="checkbox"
                    checked={isCustomPrice}
                    onChange={e => setIsCustomPrice(e.target.checked)}
                    className="w-4 h-4 accent-brand-orange rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">Variable / Custom Price</span>
                    <span className="text-[10px] text-zinc-400">
                      Cashier enters price on-the-fly for this special dish
                    </span>
                  </div>
                </label>
              </div>

              {/* Half & Full Prices (if not custom) */}
              {!isCustomPrice && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300 uppercase tracking-wider">
                      Half Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={halfPrice}
                      onChange={e => setHalfPrice(e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-zinc-300 uppercase tracking-wider">
                      Full Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={fullPrice}
                      onChange={e => setFullPrice(e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange"
                    />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingDish(null);
                  }}
                  className="py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold flex items-center justify-center gap-1.5 shadow-glow-orange active:scale-95 transition"
                >
                  <Check className="w-4 h-4" />
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingDish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1A1D24] border border-rose-900/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Delete Menu Item?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Are you sure you want to permanently delete{' '}
                <span className="font-bold text-white">"{deletingDish.name}"</span>? This cannot be
                undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDish(null)}
                className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg active:scale-95 transition"
              >
                Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
