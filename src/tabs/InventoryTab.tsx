import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { InventoryItem } from '../types';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  Copy,
  Share2,
  Search,
  X,
  Edit2,
  Trash2,
  Check,
  PackageCheck,
  ShoppingCart,
} from 'lucide-react';

export const InventoryTab: React.FC = () => {
  const {
    inventoryItems,
    lowStockItems,
    adjustIngredientStock,
    addNewIngredient,
    updateIngredient,
    deleteIngredient,
    showToast,
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'All' | 'LowStock'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [minThreshold, setMinThreshold] = useState('');
  const [category, setCategory] = useState('Raw Materials');

  // Filtered ingredients
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      if (filterMode === 'LowStock' && item.current_quantity > item.min_threshold) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          (item.category && item.category.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [inventoryItems, filterMode, searchQuery]);

  const openAddModal = () => {
    setName('');
    setQuantity('');
    setUnit('kg');
    setMinThreshold('5');
    setCategory('Raw Materials');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setQuantity(item.current_quantity.toString());
    setUnit(item.unit);
    setMinThreshold(item.min_threshold.toString());
    setCategory(item.category || 'Raw Materials');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedQty = parseFloat(quantity) || 0;
    const parsedMin = parseFloat(minThreshold) || 5;

    if (editingItem) {
      await updateIngredient({
        ...editingItem,
        name: name.trim(),
        current_quantity: parsedQty,
        unit,
        min_threshold: parsedMin,
        category,
      });
      setEditingItem(null);
    } else {
      await addNewIngredient({
        name: name.trim(),
        current_quantity: parsedQty,
        unit,
        min_threshold: parsedMin,
        category,
      });
      setIsAddModalOpen(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingItem) return;
    await deleteIngredient(deletingItem.id);
    setDeletingItem(null);
  };

  // Generate WhatsApp formatted shopping list
  const generateShoppingListText = () => {
    let text = `🛒 *SHREE YASH HOTEL - KITCHEN SHOPPING LIST*\n`;
    text += `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}\n`;
    text += `Low stock items requiring immediate restock:\n`;
    text += `------------------------------------\n`;

    lowStockItems.forEach((item, idx) => {
      const needed = Math.max(0, item.min_threshold * 2 - item.current_quantity);
      text += `${idx + 1}. [ ] *${item.name}*\n`;
      text += `    Current: ${item.current_quantity} ${item.unit} | Min Alert: ${item.min_threshold} ${item.unit}\n`;
      text += `    Suggested Order: ~${Math.ceil(needed)} ${item.unit}\n`;
    });

    text += `------------------------------------\n`;
    text += `Sent from Shree Yash POS Inventory Tracker`;
    return text;
  };

  const copyShoppingList = async () => {
    const text = generateShoppingListText();
    try {
      await navigator.clipboard.writeText(text);
      showToast('Shopping list copied to clipboard!', 'success');
    } catch (err) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Shopping list copied to clipboard!', 'success');
    }
  };

  const shareViaWhatsApp = () => {
    const text = generateShoppingListText();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* LOW STOCK / REFILL BANNER */}
      {lowStockItems.length > 0 ? (
        <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-[#1A1D24] border border-amber-500/50 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-amber-200">
                  Needs Refill / Shopping List ({lowStockItems.length} items low)
                </h3>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Stock is at or below minimum threshold. Prepare supplier order.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Item Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {lowStockItems.map(item => (
              <span
                key={item.id}
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-black/40 border border-amber-500/30 text-amber-200"
              >
                {item.name}:{' '}
                <span className="text-rose-400">
                  {item.current_quantity} {item.unit}
                </span>{' '}
                (min {item.min_threshold})
              </span>
            ))}
          </div>

          {/* 1-Tap WhatsApp Actions */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={copyShoppingList}
              className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95 transition"
            >
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              Copy Shopping List
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              WhatsApp to Vendor
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#1A1D24] border border-emerald-500/30 rounded-3xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-300">All Kitchen Stock is Optimal</h3>
            <p className="text-xs text-zinc-400">
              No ingredients are below minimum alert thresholds.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar: Search, Filter, Add Ingredient */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search raw ingredients..."
              className="w-full bg-[#1A1D24] border border-zinc-800 rounded-2xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-[#1A1D24] border border-zinc-800 p-0.5 rounded-xl">
            <button
              onClick={() => setFilterMode('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filterMode === 'All' ? 'bg-zinc-700 text-white' : 'text-zinc-400'
              }`}
            >
              All ({inventoryItems.length})
            </button>
            <button
              onClick={() => setFilterMode('LowStock')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                filterMode === 'LowStock'
                  ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  : 'text-zinc-400'
              }`}
            >
              Low ({lowStockItems.length})
            </button>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-orange active:scale-95 transition flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Ingredient
        </button>
      </div>

      {/* Ingredient Items Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredItems.map(item => {
          const isLow = item.current_quantity <= item.min_threshold;

          return (
            <div
              key={item.id}
              className={`bg-[#1A1D24] border rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition shadow-sm ${
                isLow ? 'border-amber-500/40 bg-amber-950/10' : 'border-[#262A36]'
              }`}
            >
              {/* Item Details */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span className="text-[11px] bg-zinc-800 px-1.5 py-0.2 rounded">
                      {item.category || 'Raw Material'}
                    </span>
                    <span>&bull;</span>
                    <span className="text-[11px]">Min Alert: {item.min_threshold} {item.unit}</span>
                  </div>
                </div>

                {isLow ? (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Low Stock
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                    Safe
                  </span>
                )}
              </div>

              {/* Quantity Counter & Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                {/* Stock Controls */}
                <div className="flex items-center gap-2 bg-[#0F1115] border border-zinc-800 p-1 rounded-xl">
                  <button
                    onClick={() => adjustIngredientStock(item.id, -1)}
                    className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center justify-center active:scale-90 transition"
                    title="-1 unit"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="px-2 text-center">
                    <span
                      className={`text-base font-black ${
                        isLow ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {item.current_quantity}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-semibold block leading-none">
                      {item.unit}
                    </span>
                  </div>

                  <button
                    onClick={() => adjustIngredientStock(item.id, 1)}
                    className="w-8 h-8 rounded-lg bg-brand-orange hover:bg-orange-600 text-white flex items-center justify-center active:scale-90 transition"
                    title="+1 unit"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Edit & Delete Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition"
                    title="Edit threshold/name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingItem(item)}
                    className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT INGREDIENT MODAL */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 overflow-y-auto animate-in fade-in">
          <div className="bg-[#1A1D24] border border-[#2F3443] w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-4 my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-brand-orange" />
                {editingItem ? 'Edit Ingredient' : 'Add Kitchen Ingredient'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                }}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Hakka Noodles, Soy Sauce, Cooking Oil"
                  className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2.5 text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 uppercase tracking-wider">
                    Current Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-zinc-300 uppercase tracking-wider">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="liters">liters (Liters)</option>
                    <option value="packets">packets (Packets)</option>
                    <option value="pcs">pcs (Pieces)</option>
                    <option value="crates">crates (Crates)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Min Alert Threshold ({unit})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={minThreshold}
                  onChange={e => setMinThreshold(e.target.value)}
                  placeholder="e.g. 5"
                  className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white placeholder-zinc-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-zinc-500 block">
                  Alert is triggered when stock drops at or below this value.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-zinc-300 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-[#0F1115] border border-zinc-700/80 rounded-xl px-3 py-2 text-white focus:outline-hidden"
                >
                  <option value="Raw Materials">Raw Materials</option>
                  <option value="Grains & Noodles">Grains &amp; Noodles</option>
                  <option value="Meat & Poultry">Meat &amp; Poultry</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Sauces & Condiments">Sauces &amp; Condiments</option>
                  <option value="Oils & Fats">Oils &amp; Fats</option>
                  <option value="Packaging Materials">Packaging Materials</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-extrabold flex items-center justify-center gap-1.5 shadow-glow-orange active:scale-95 transition"
                >
                  <Check className="w-4 h-4" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1A1D24] border border-rose-900/50 w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white">Remove Ingredient?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Remove <span className="font-bold text-white">"{deletingItem.name}"</span> from inventory
                tracking?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs active:scale-95 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
