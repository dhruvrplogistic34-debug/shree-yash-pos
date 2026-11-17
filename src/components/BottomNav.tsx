import React from 'react';
import { usePOS } from '../context/POSContext';
import { TabType } from '../types';
import { Utensils, BookOpen, Boxes, BarChart3 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartItemCount, lowStockItems } = usePOS();

  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'pos',
      label: 'New Order',
      icon: <Utensils className="w-5 h-5" />,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
      badgeColor: 'bg-brand-orange text-white',
    },
    {
      id: 'menu',
      label: 'Menu Manager',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 'inventory',
      label: 'Kitchen Stock',
      icon: <Boxes className="w-5 h-5" />,
      badge: lowStockItems.length > 0 ? lowStockItems.length : undefined,
      badgeColor: 'bg-amber-500 text-zinc-950 font-black',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#12141A]/95 backdrop-blur-lg border-t border-[#232733] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-1">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none py-1 ${
                isActive ? 'text-brand-orange' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-brand-orange shadow-glow-orange" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'scale-110 bg-brand-orange/15 text-brand-orange' : ''
                  }`}
                >
                  {tab.icon}
                </div>

                {tab.badge !== undefined && (
                  <span
                    className={`absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg ${
                      tab.badgeColor || 'bg-brand-orange text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] font-semibold tracking-tight ${
                  isActive ? 'text-white' : 'text-zinc-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
