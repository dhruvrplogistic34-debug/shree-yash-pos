import React, { useState, useMemo } from 'react';
import { usePOS } from '../context/POSContext';
import { DateFilterType, Order } from '../types';
import {
  TrendingUp,
  CreditCard,
  Banknote,
  Clock,
  Printer,
  CheckCircle2,
  Calendar,
  Flame,
  Search,
  PieChart,
  ShoppingBag,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { orders, markOrderPaid, openReceiptModal } = usePOS();

  const [dateFilter, setDateFilter] = useState<DateFilterType>('today');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Filter Orders by Date
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter(order => {
      const orderDate = new Date(order.created_at);

      if (dateFilter === 'today') {
        return orderDate >= startOfToday;
      }
      if (dateFilter === 'yesterday') {
        return orderDate >= startOfYesterday && orderDate < startOfToday;
      }
      if (dateFilter === 'week') {
        return orderDate >= startOfWeek;
      }
      if (dateFilter === 'month') {
        return orderDate >= startOfMonth;
      }
      if (dateFilter === 'custom') {
        if (customStart && new Date(orderDate) < new Date(customStart)) return false;
        if (customEnd) {
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }
        return true;
      }
      return true;
    });
  }, [orders, dateFilter, customStart, customEnd]);

  // Financial Overview Aggregations
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total_amount, 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;

  const averageOrderValue = useMemo(() => {
    if (totalOrdersCount === 0) return 0;
    return Math.round(totalRevenue / (filteredOrders.filter(o => o.payment_status === 'paid').length || 1));
  }, [totalRevenue, totalOrdersCount, filteredOrders]);

  // Payment Breakdown
  const paymentStats = useMemo(() => {
    let upi = 0;
    let cash = 0;
    let unpaid = 0;

    filteredOrders.forEach(o => {
      if (o.payment_status === 'unpaid' || o.payment_mode === 'unpaid') {
        unpaid += o.total_amount;
      } else if (o.payment_mode === 'upi') {
        upi += o.total_amount;
      } else {
        cash += o.total_amount;
      }
    });

    const sum = upi + cash + unpaid || 1;
    return {
      upi,
      cash,
      unpaid,
      upiPct: Math.round((upi / sum) * 100),
      cashPct: Math.round((cash / sum) * 100),
      unpaidPct: Math.round((unpaid / sum) * 100),
    };
  }, [filteredOrders]);

  // Top Selling Dishes
  const topSellingDishes = useMemo(() => {
    const map = new Map<string, { name: string; category: string; quantity: number; revenue: number }>();

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const key = item.item_name;
        const current = map.get(key) || {
          name: item.item_name,
          category: item.category,
          quantity: 0,
          revenue: 0,
        };
        current.quantity += item.quantity;
        current.revenue += item.subtotal;
        map.set(key, current);
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7);
  }, [filteredOrders]);

  // Portion Split (Half vs Full)
  const portionStats = useMemo(() => {
    let half = 0;
    let full = 0;

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.portion === 'Half') half += item.quantity;
        else full += item.quantity;
      });
    });

    const total = half + full || 1;
    return {
      half,
      full,
      halfPct: Math.round((half / total) * 100),
      fullPct: Math.round((full / total) * 100),
    };
  }, [filteredOrders]);

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, number>();
    let totalCatRevenue = 0;

    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.category || 'Other';
        const current = map.get(cat) || 0;
        map.set(cat, current + item.subtotal);
        totalCatRevenue += item.subtotal;
      });
    });

    return Array.from(map.entries()).map(([category, amount]) => ({
      category,
      amount,
      pct: totalCatRevenue ? Math.round((amount / totalCatRevenue) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredOrders]);

  // Order Type Breakdown (Dine-In vs Takeaway)
  const orderTypeStats = useMemo(() => {
    let dineIn = 0;
    let takeaway = 0;

    filteredOrders.forEach(order => {
      if (order.order_type === 'dine_in') dineIn++;
      else takeaway++;
    });

    const total = dineIn + takeaway || 1;
    return {
      dineIn,
      takeaway,
      dineInPct: Math.round((dineIn / total) * 100),
      takeawayPct: Math.round((takeaway / total) * 100),
    };
  }, [filteredOrders]);

  // Peak Hours Heatmap (Hours 11 AM to 23 PM)
  const hourlyOrders = useMemo(() => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 10); // 10:00 to 23:00
    const counts = new Map<number, number>();

    hours.forEach(h => counts.set(h, 0));

    filteredOrders.forEach(order => {
      const h = new Date(order.created_at).getHours();
      if (counts.has(h)) {
        counts.set(h, (counts.get(h) || 0) + 1);
      }
    });

    const maxCount = Math.max(...Array.from(counts.values()), 1);

    return hours.map(h => ({
      hour: h,
      label: h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`,
      count: counts.get(h) || 0,
      intensity: (counts.get(h) || 0) / maxCount,
      isRush: h >= 12 && h <= 14 ? 'Lunch Rush' : h >= 19 && h <= 22 ? 'Dinner Rush' : null,
    }));
  }, [filteredOrders]);

  // Searchable Past Orders Log
  const pastOrdersList = useMemo(() => {
    return filteredOrders.filter(order => {
      if (orderStatusFilter === 'paid' && order.payment_status !== 'paid') return false;
      if (orderStatusFilter === 'unpaid' && order.payment_status !== 'unpaid') return false;

      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        return (
          order.order_number.toLowerCase().includes(q) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(q)) ||
          (order.customer_phone && order.customer_phone.includes(q)) ||
          (order.table_number && order.table_number.toString().includes(q))
        );
      }
      return true;
    });
  }, [filteredOrders, orderStatusFilter, orderSearchQuery]);

  return (
    <div className="pb-32 pt-2 px-3 sm:px-4 max-w-4xl mx-auto space-y-4">
      {/* Date Filter Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {(['today', 'yesterday', 'week', 'month', 'custom'] as DateFilterType[]).map(df => {
            const labels: Record<DateFilterType, string> = {
              today: 'Today',
              yesterday: 'Yesterday',
              week: 'This Week',
              month: 'This Month',
              custom: 'Custom Range',
            };
            return (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 ${
                  dateFilter === df
                    ? 'bg-brand-orange text-white shadow-glow-orange/30'
                    : 'bg-[#1A1D24] text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                }`}
              >
                {labels[df]}
              </button>
            );
          })}
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === 'custom' && (
          <div className="bg-[#1A1D24] border border-zinc-800 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">From Date</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full bg-[#0F1115] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 block mb-1">To Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full bg-[#0F1115] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 4 FINANCIAL OVERVIEW METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Revenue */}
        <div className="bg-[#1A1D24] border border-[#262A36] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Revenue</span>
            <span className="w-2 h-2 rounded-full bg-brand-orange" />
          </div>
          <div className="my-1.5">
            <div className="text-xl sm:text-2xl font-black text-white">₹{totalRevenue}</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Paid Gross
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-[#1A1D24] border border-[#262A36] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="my-1.5">
            <div className="text-xl sm:text-2xl font-black text-white">{totalOrdersCount}</div>
            <span className="text-[10px] text-zinc-400 font-semibold">Total Completed</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-[#1A1D24] border border-[#262A36] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Bill (AOV)</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="my-1.5">
            <div className="text-xl sm:text-2xl font-black text-white">₹{averageOrderValue}</div>
            <span className="text-[10px] text-zinc-400 font-semibold">Per order avg</span>
          </div>
        </div>

        {/* Pending Unpaid Total */}
        <div className="bg-[#1A1D24] border border-[#262A36] rounded-2xl p-3.5 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending</span>
            <Clock className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="my-1.5">
            <div className="text-xl sm:text-2xl font-black text-rose-400">
              ₹{paymentStats.unpaid}
            </div>
            <span className="text-[10px] text-rose-300 font-semibold">
              {filteredOrders.filter(o => o.payment_status === 'unpaid').length} unpaid bills
            </span>
          </div>
        </div>
      </div>

      {/* PAYMENT SPLIT BAR CARD */}
      <div className="bg-[#1A1D24] border border-[#262A36] rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-brand-orange" /> Payment Split
          </h3>
          <span className="text-zinc-400 font-medium">Total: ₹{totalRevenue + paymentStats.unpaid}</span>
        </div>

        {/* Multi-segmented Progress Bar */}
        <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${paymentStats.upiPct}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`UPI: ${paymentStats.upiPct}%`}
          />
          <div
            style={{ width: `${paymentStats.cashPct}%` }}
            className="bg-amber-500 h-full transition-all duration-500"
            title={`Cash: ${paymentStats.cashPct}%`}
          />
          <div
            style={{ width: `${paymentStats.unpaidPct}%` }}
            className="bg-rose-500 h-full transition-all duration-500"
            title={`Unpaid: ${paymentStats.unpaidPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 block">UPI</span>
              <span className="font-bold text-white">₹{paymentStats.upi}</span>
              <span className="text-[10px] text-zinc-500 ml-1">({paymentStats.upiPct}%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 block">Cash</span>
              <span className="font-bold text-white">₹{paymentStats.cash}</span>
              <span className="text-[10px] text-zinc-500 ml-1">({paymentStats.cashPct}%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-zinc-400 block">Unpaid</span>
              <span className="font-bold text-rose-400">₹{paymentStats.unpaid}</span>
              <span className="text-[10px] text-zinc-500 ml-1">({paymentStats.unpaidPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: TOP DISHES & PORTION / ORDER TYPE SPLIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Top Selling Dishes */}
        <div className="bg-[#1A1D24] border border-[#262A36] rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-brand-orange" /> Top Selling Dishes
            </h3>
            <span className="text-[10px] font-bold text-zinc-400">By Plates Sold</span>
          </div>

          <div className="space-y-2.5">
            {topSellingDishes.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No order data for selected period</p>
            ) : (
              topSellingDishes.map((dish, idx) => (
                <div key={dish.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-zinc-800 text-[10px] font-bold flex items-center justify-center text-brand-orange flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-zinc-200 truncate">{dish.name}</span>
                    </div>
                    <div className="text-right flex items-center gap-2 flex-shrink-0">
                      <span className="font-extrabold text-white">{dish.quantity} plates</span>
                      <span className="text-zinc-400 text-[11px]">₹{dish.revenue}</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(100, (dish.quantity / (topSellingDishes[0].quantity || 1)) * 100)}%`,
                      }}
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Portion Split & Order Type Split */}
        <div className="space-y-3">
          {/* Portion Split Card */}
          <div className="bg-[#1A1D24] border border-[#262A36] rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-amber-400" /> Portion Split (Half vs Full)
              </h3>
              <span className="text-[10px] text-zinc-400">Plate Ratio</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-[#0F1115] border border-zinc-800/80 rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  Half Plates
                </span>
                <span className="text-xl font-black text-brand-orange">{portionStats.half}</span>
                <span className="text-[11px] font-semibold text-zinc-400 block mt-0.5">
                  {portionStats.halfPct}% of orders
                </span>
              </div>
              <div className="bg-[#0F1115] border border-zinc-800/80 rounded-2xl p-3 text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  Full Plates
                </span>
                <span className="text-xl font-black text-white">{portionStats.full}</span>
                <span className="text-[11px] font-semibold text-zinc-400 block mt-0.5">
                  {portionStats.fullPct}% of orders
                </span>
              </div>
            </div>
          </div>

          {/* Order Type Split (Dine-In vs Takeaway) */}
          <div className="bg-[#1A1D24] border border-[#262A36] rounded-3xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Dine-In vs Takeaway / Parcel
              </h3>
              <span className="text-[10px] text-zinc-400">Order Channel</span>
            </div>

            <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${orderTypeStats.dineInPct}%` }}
                className="bg-brand-orange h-full"
              />
              <div
                style={{ width: `${orderTypeStats.takeawayPct}%` }}
                className="bg-blue-500 h-full"
              />
            </div>

            <div className="flex justify-between text-xs pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                <span className="font-semibold text-zinc-300">
                  Dine-In: {orderTypeStats.dineIn} ({orderTypeStats.dineInPct}%)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-zinc-300">
                  Takeaway: {orderTypeStats.takeaway} ({orderTypeStats.takeawayPct}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORY & CUISINE PERFORMANCE */}
      <div className="bg-[#1A1D24] border border-[#262A36] rounded-3xl p-4 shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-white">
          Category Revenue Share (Soups, Starters, Noodles, Rice)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {categoryStats.map(cat => (
            <div
              key={cat.category}
              className="bg-[#0F1115] border border-zinc-800/80 rounded-2xl p-3 flex flex-col justify-between"
            >
              <span className="text-[11px] font-bold text-zinc-400">{cat.category}</span>
              <div className="mt-1">
                <span className="text-base font-black text-white">₹{cat.amount}</span>
                <span className="text-[10px] text-brand-orange font-bold ml-1.5">
                  {cat.pct}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PEAK HOURS HEATMAP / HOURLY CHART */}
      <div className="bg-[#1A1D24] border border-[#262A36] rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-orange" /> Peak Hours Rush Heatmap
          </h3>
          <span className="text-[10px] text-zinc-400">10 AM to 11 PM</span>
        </div>

        {/* Hourly Bars */}
        <div className="flex items-end gap-1.5 h-28 pt-4 px-1 overflow-x-auto no-scrollbar">
          {hourlyOrders.map(h => (
            <div
              key={h.hour}
              className="flex-1 min-w-[20px] flex flex-col items-center justify-end h-full group"
            >
              <span className="text-[9px] font-bold text-zinc-400 mb-1 opacity-0 group-hover:opacity-100 transition">
                {h.count}
              </span>
              <div
                style={{ height: `${Math.max(8, h.intensity * 75)}px` }}
                className={`w-full rounded-t-md transition-all ${
                  h.count > 0
                    ? h.isRush
                      ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-glow-orange/30'
                      : 'bg-zinc-600 hover:bg-zinc-500'
                    : 'bg-zinc-800/40'
                }`}
                title={`${h.label}: ${h.count} orders ${h.isRush ? `(${h.isRush})` : ''}`}
              />
              <span className="text-[8px] font-semibold text-zinc-500 mt-1 whitespace-nowrap">
                {h.hour % 2 === 0 ? h.label.replace(' ', '') : ''}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-400 pt-1 border-t border-zinc-800">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-brand-orange" />
            <span>Rush Hours (12-2 PM Lunch / 7-10 PM Dinner)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-zinc-700" />
            <span>Regular Hours</span>
          </div>
        </div>
      </div>

      {/* SEARCHABLE PAST ORDERS LOG */}
      <div className="bg-[#1A1D24] border border-[#262A36] rounded-3xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Past Orders Log ({pastOrdersList.length})
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#0F1115] border border-zinc-800 p-0.5 rounded-xl text-xs">
            {(['all', 'paid', 'unpaid'] as const).map(st => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                  orderStatusFilter === st
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar for Orders */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={orderSearchQuery}
            onChange={e => setOrderSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer, Phone, or Table..."
            className="w-full bg-[#0F1115] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-brand-orange"
          />
        </div>

        {/* Order Items List */}
        <div className="space-y-2 pt-1 max-h-96 overflow-y-auto">
          {pastOrdersList.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">No orders matching criteria</p>
          ) : (
            pastOrdersList.map(order => {
              const isUnpaid = order.payment_status === 'unpaid';
              const formattedTime = new Date(order.created_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
              });

              return (
                <div
                  key={order.id}
                  className={`bg-[#0F1115] border rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                    isUnpaid ? 'border-rose-900/40 bg-rose-950/10' : 'border-zinc-800/80'
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-brand-orange">
                        #{order.order_number}
                      </span>
                      <span className="text-[10px] font-semibold text-zinc-400">
                        {formattedDate} {formattedTime}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                          order.order_type === 'dine_in'
                            ? 'bg-zinc-800 text-zinc-200'
                            : 'bg-blue-950 text-blue-300'
                        }`}
                      >
                        {order.order_type === 'dine_in'
                          ? `Table #${order.table_number || '1'}`
                          : 'Takeaway'}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-1 truncate">
                      {order.items.map(i => `${i.item_name} (${i.portion}) x${i.quantity}`).join(', ')}
                    </div>

                    {order.customer_name && (
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        Customer: {order.customer_name}{' '}
                        {order.customer_phone ? `(${order.customer_phone})` : ''}
                      </div>
                    )}
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                    <div className="text-right">
                      <span className="text-base font-black text-white">₹{order.total_amount}</span>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-zinc-500 uppercase">{order.payment_mode}</span>
                        <span
                          className={`font-bold uppercase ${
                            isUnpaid ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          &bull; {order.payment_status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Mark Paid action if unpaid */}
                      {isUnpaid && (
                        <button
                          onClick={() => markOrderPaid(order.id)}
                          className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm active:scale-95 transition"
                          title="Mark order as paid"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Paid
                        </button>
                      )}

                      {/* Reprint / View Receipt */}
                      <button
                        onClick={() => openReceiptModal(order)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition"
                        title="View / Reprint Bill"
                      >
                        <Printer className="w-3.5 h-3.5 text-brand-orange" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
