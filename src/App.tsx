import React from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { CustomPriceModal } from './components/CustomPriceModal';
import { ReceiptModal } from './components/ReceiptModal';
import { POSTab } from './tabs/POSTab';
import { MenuManagerTab } from './tabs/MenuManagerTab';
import { InventoryTab } from './tabs/InventoryTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';

const MainAppContent: React.FC = () => {
  const { activeTab } = usePOS();

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex flex-col font-sans selection:bg-brand-orange selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Active Tab Screen */}
      <main className="flex-1 w-full">
        {activeTab === 'pos' && <POSTab />}
        {activeTab === 'menu' && <MenuManagerTab />}
        {activeTab === 'inventory' && <InventoryTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>

      {/* Sticky Bottom Order Drawer (on POS tab) */}
      <CheckoutDrawer />

      {/* Modals */}
      <CustomPriceModal />
      <ReceiptModal />

      {/* 4-Tab Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <POSProvider>
      <MainAppContent />
    </POSProvider>
  );
};

export default App;
