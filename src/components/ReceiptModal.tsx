import React, { useRef, useState } from 'react';
import { usePOS } from '../context/POSContext';
import { X, Printer, Share2, UtensilsCrossed, CheckCircle2, Clock } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, closeReceiptModal } = usePOS();
  const [isKotMode, setIsKotMode] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!activeReceipt) return null;

  const formattedDate = new Date(activeReceipt.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(activeReceipt.created_at).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = (kot: boolean = false) => {
    setIsKotMode(kot);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleWhatsAppShare = () => {
    let text = `*SHREE YASH HOTEL*\n`;
    text += `Bill No: #${activeReceipt.order_number}\n`;
    text += `Date: ${formattedDate} ${formattedTime}\n`;
    text += `Type: ${activeReceipt.order_type === 'dine_in' ? `Dine-In (Table #${activeReceipt.table_number})` : 'Takeaway / Parcel'}\n`;
    if (activeReceipt.customer_name) text += `Customer: ${activeReceipt.customer_name}\n`;
    text += `--------------------------------\n`;

    activeReceipt.items.forEach((item, idx) => {
      text += `${idx + 1}. ${item.item_name} (${item.portion}) x ${item.quantity} = ₹${item.subtotal}\n`;
    });

    text += `--------------------------------\n`;
    text += `*TOTAL AMOUNT: ₹${activeReceipt.total_amount}*\n`;
    text += `Payment: ${activeReceipt.payment_mode.toUpperCase()} (${activeReceipt.payment_status.toUpperCase()})\n`;
    if (activeReceipt.kitchen_notes) text += `Note: ${activeReceipt.kitchen_notes}\n`;
    text += `--------------------------------\n`;
    text += `Thank you! Visit again.\n`;

    const cleanPhone = activeReceipt.customer_phone?.replace(/\D/g, '') || '';
    const phoneParam = cleanPhone.length >= 10 ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) : '';
    const url = phoneParam
      ? `https://wa.me/${phoneParam}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 overflow-y-auto animate-in fade-in">
      <div className="bg-[#1A1D24] border border-[#2F3443] w-full max-w-sm rounded-3xl p-5 shadow-2xl flex flex-col gap-4 my-auto">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Order Confirmed
            </span>
          </div>
          <button
            onClick={closeReceiptModal}
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Paper Container */}
        <div
          ref={receiptRef}
          id="printable-receipt"
          className="bg-white text-zinc-950 p-5 rounded-2xl shadow-inner font-mono text-xs select-text border border-zinc-200"
        >
          {/* Header */}
          <div className="text-center pb-3 border-b-2 border-dashed border-zinc-300">
            <h2 className="text-base font-extrabold tracking-tight uppercase">
              SHREE YASH HOTEL
            </h2>
            <p className="text-[10px] text-zinc-600 font-sans font-medium uppercase tracking-wider">
              Chinese Cuisine & Fast Food Specialists
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">Contact: +91 98765 43210</p>
          </div>

          {/* Ticket Type Banner (Bill vs KOT) */}
          <div className="py-2 text-center border-b border-dashed border-zinc-300">
            <span className="font-extrabold text-sm uppercase tracking-wider">
              {isKotMode ? '--- KITCHEN ORDER TICKET (KOT) ---' : 'TAX INVOICE / CASH BILL'}
            </span>
          </div>

          {/* Meta Info */}
          <div className="py-2 border-b border-dashed border-zinc-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="font-semibold">Order: #{activeReceipt.order_number}</span>
              <span>{formattedDate} {formattedTime}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Type: {activeReceipt.order_type === 'dine_in' ? 'Dine-In' : 'Takeaway / Parcel'}</span>
              {activeReceipt.table_number && (
                <span className="bg-zinc-900 text-white px-1.5 py-0.2 rounded font-sans text-[10px]">
                  TABLE #{activeReceipt.table_number}
                </span>
              )}
            </div>
            {activeReceipt.customer_name && (
              <div>
                Customer: <span className="font-bold">{activeReceipt.customer_name}</span>
                {activeReceipt.customer_phone ? ` (${activeReceipt.customer_phone})` : ''}
              </div>
            )}
            {activeReceipt.kitchen_notes && (
              <div className="bg-amber-100 text-amber-950 p-1 rounded text-[10px] font-sans font-semibold mt-1">
                Kitchen Note: {activeReceipt.kitchen_notes}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="py-2 border-b-2 border-dashed border-zinc-300">
            <div className="grid grid-cols-12 font-bold pb-1 text-[10px] uppercase border-b border-zinc-200">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              {!isKotMode && <span className="col-span-2 text-right">Rate</span>}
              {!isKotMode && <span className="col-span-2 text-right">Amt</span>}
            </div>

            <div className="pt-1.5 space-y-1.5">
              {activeReceipt.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                  <div className="col-span-6">
                    <span className="font-medium">{item.item_name}</span>
                    <span className="block text-[9px] text-zinc-500 font-sans">
                      ({item.portion} plate)
                    </span>
                  </div>
                  <div className="col-span-2 text-center font-bold">{item.quantity}</div>
                  {!isKotMode && (
                    <div className="col-span-2 text-right text-zinc-600">₹{item.price}</div>
                  )}
                  {!isKotMode && (
                    <div className="col-span-2 text-right font-bold">₹{item.subtotal}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bill Totals (Hidden in KOT) */}
          {!isKotMode && (
            <div className="py-2 space-y-1 border-b border-dashed border-zinc-300 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Items Count:</span>
                <span>{activeReceipt.item_count} items</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-1">
                <span>NET PAYABLE:</span>
                <span className="text-base">₹{activeReceipt.total_amount}</span>
              </div>
              <div className="flex justify-between text-[11px] pt-1">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase tracking-wider text-emerald-800">
                  {activeReceipt.payment_mode} ({activeReceipt.payment_status})
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 text-center text-[10px] text-zinc-500">
            <p className="font-sans font-medium">Thank you for dining with us!</p>
            <p className="font-sans">Please visit again</p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-col gap-2 pt-1 no-print">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handlePrint(false)}
              className="py-3 px-3 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-glow-orange active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              Thermal Bill
            </button>
            <button
              onClick={() => handlePrint(true)}
              className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-400" />
              Print KOT
            </button>
          </div>

          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
            1-Tap WhatsApp Share
          </button>
        </div>
      </div>
    </div>
  );
};
