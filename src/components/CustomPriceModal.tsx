import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { X, Delete, Check } from 'lucide-react';
import { VegBadge } from './VegBadge';

export const CustomPriceModal: React.FC = () => {
  const { customPriceRequest, closeCustomPriceModal, confirmCustomPrice } = usePOS();
  const [priceStr, setPriceStr] = useState<string>('');

  useEffect(() => {
    if (customPriceRequest) {
      setPriceStr('');
    }
  }, [customPriceRequest]);

  if (!customPriceRequest) return null;

  const { menuItem, portion } = customPriceRequest;

  const handleKeypadPress = (val: string) => {
    if (priceStr.length >= 5) return; // prevent overflow
    setPriceStr(prev => prev + val);
  };

  const handleBackspace = () => {
    setPriceStr(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPriceStr('');
  };

  const handlePreset = (amount: number) => {
    setPriceStr(amount.toString());
  };

  const handleConfirm = () => {
    const num = parseFloat(priceStr);
    if (!num || num <= 0) {
      alert('Please enter a valid price in ₹');
      return;
    }
    confirmCustomPrice(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in">
      <div className="bg-[#1A1D24] border border-[#2D3342] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2.5">
            <VegBadge isVeg={menuItem.is_veg} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-orange bg-brand-orange/15 px-2 py-0.5 rounded">
                  {portion} Plate
                </span>
                <span className="text-xs text-zinc-400">Custom Market Price</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{menuItem.name}</h3>
            </div>
          </div>
          <button
            onClick={closeCustomPriceModal}
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Box */}
        <div className="bg-[#0F1115] border border-zinc-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            Enter Price for this Order
          </span>
          <div className="flex items-baseline gap-1 text-4xl font-extrabold text-brand-orange">
            <span className="text-2xl text-zinc-400">₹</span>
            <span>{priceStr || '0'}</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-4 gap-1.5">
          {[120, 160, 200, 250].map(val => (
            <button
              key={val}
              type="button"
              onClick={() => handlePreset(val)}
              className="py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 text-zinc-200 text-xs font-bold transition active:scale-95"
            >
              ₹{val}
            </button>
          ))}
        </div>

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(key => (
            <button
              key={key}
              type="button"
              onClick={() => handleKeypadPress(key)}
              className="h-14 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 text-2xl font-bold text-white border border-zinc-700/40 shadow-sm active:scale-95 transition flex items-center justify-center"
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700/50 text-sm font-bold text-zinc-400 border border-zinc-700/30 active:scale-95 transition flex items-center justify-center"
          >
            C
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-14 rounded-2xl bg-zinc-800/90 hover:bg-zinc-700/90 text-2xl font-bold text-white border border-zinc-700/40 active:scale-95 transition flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 border border-zinc-700/30 active:scale-95 transition flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={closeCustomPriceModal}
            className="py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!priceStr || parseFloat(priceStr) <= 0}
            className="py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-extrabold text-sm shadow-glow-orange flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Check className="w-4 h-4" />
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
};
