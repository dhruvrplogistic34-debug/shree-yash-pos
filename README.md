# 🍜 Shree Yash Hotel — Restaurant POS, Inventory & Sales Analytics PWA

A fast, mobile-first Progressive Web App (PWA) built specifically for **Shree Yash Hotel** to streamline rapid Chinese and Indian food order taking, table management, raw ingredient tracking, and sales intelligence.

---

## 🌟 Key Features & Architecture

### 1. Dual-Mode Database (Supabase + High-Performance LocalStorage Fallback)
- **Supabase Cloud (PostgreSQL)**: Fully configured schema in [`schema.sql`](file:///d:/shree-yash-pos/schema.sql) with Row Level Security (RLS) policies and seed queries for all 50+ menu items, kitchen stock, and orders.
- **Offline / Zero-Config LocalStorage Fallback**: If `.env` Supabase keys are not yet configured or internet drops in the kitchen, the app automatically and seamlessly falls back to high-speed offline storage with rich seed data.

### 2. Sleek Dark-Mode Mobile UI/UX
- Designed with `#0F1115` dark background, `#1A1D24` elevated card surfaces, and warm orange `#F97316` primary accents.
- Authentic Indian Veg (green dot in square) and Non-Veg (red/brown dot in square) FSSAI-style indicators.
- Large thumb-friendly 48px+ tap targets for one-handed mobile order taking.

---

## 📱 4 Strictly Separated Modules (Bottom Navigation)

### 🏷️ Tab 1: New Order (POS Screen — Read-Only Menu)
- **Zero Accidental Edits**: The master menu cannot be deleted or altered from this screen during busy rush hours.
- **Filters & Search**: Fast search bar, Cuisine toggles (*All*, *Chinese*, *Indian*), Category pills (*Soups*, *Starters*, *Noodles*, *Rice*, etc.), and Veg/Non-Veg filter.
- **Half / Full Quick-Add**: Each dish card shows side-by-side **Half ₹XX** and **Full ₹XX** tap buttons with instant `−` / `+` counters once added to the tray.
- **Custom Price Handling**: For dishes with variable market price (such as *Shree Yash Special Noodles* or *Shree Yash Special Rice*), tapping the card opens a quick numeric keypad modal to enter the custom price for that order.
- **Out of Stock Protection**: Dishes flagged as out of stock in Menu Manager are greyed out with a "Sold Out" badge.
- **Sticky Bottom Checkout Drawer**:
  - Live item count and total in ₹.
  - Expandable drawer with item breakdown and subtotals.
  - **Order Type Selector**: *Dine-In* with Table #1–15 thumb grid selector, or *Takeaway / Parcel*.
  - **Kitchen Notes**: Quick chips for *Less Spicy*, *No Ajinomoto*, *Extra Schezwan*, *Crispy*, *Separate Gravy*, plus custom text input.
  - **Payment Mode**: *UPI / QR*, *Cash*, or *Pending / Unpaid*.
  - **Place Order & Generate Bill**: Confetti celebration followed by the Bill & Receipt Modal.

### 🖨️ Thermal Receipt & 1-Tap WhatsApp Sharing
- **Thermal Print Mode**: Standard 58mm / 80mm monospaced receipt formatting triggered via `window.print()` with clean `@media print` CSS.
- **Print KOT (Kitchen Order Ticket)**: Formats a dedicated kitchen ticket showing Table # / Parcel, item names, half/full portions, quantities, and chef instructions without prices.
- **1-Tap WhatsApp Sharing**: Generates an emoji-formatted bill and opens `https://wa.me/?text=...` (or sends directly to the customer's mobile number if entered).

### 📖 Tab 2: Menu Manager (Isolated Admin Section)
- Master menu management across all cuisines (Chinese, Indian, etc.) and categories.
- **Add New Dish / Category Form**: Name, Cuisine (select or type new like *Indian*), Category (select or type new like *Roti/Naan*, *Paneer Main Course*, *Biryani*), Veg/Non-Veg type, Half Price (₹), Full Price (₹), and a checkbox for *Variable / Custom Market Price*.
- **Live Edit & Toggle**: Edit dish prices anytime, toggle the **"Out of Stock"** switch (which instantly greys out the dish on the POS screen without deleting it), or permanently delete dishes with a confirmation modal.

### 📦 Tab 3: Kitchen Stock & Ingredients Tracker
- Tracks kitchen raw materials: Hakka Noodles, Basmati Rice, Chicken, Eggs, Schezwan Sauce, Soy Sauce, Cooking Oil, Cabbage, Capsicum, Garlic, Packaging Containers, Soup Bowls, etc.
- Displays Current Quantity, Unit (`kg`, `liters`, `packets`, `pcs`), and Minimum Alert Threshold.
- Quick `−` / `+` thumb adjustment buttons for rapid kitchen updates.
- **Needs Refill / Shopping List Banner**: Automatically highlights low-stock items when current quantity drops at or below the minimum threshold.
- **1-Tap WhatsApp Shopping List**: "Copy Shopping List" copies a formatted checklist to clipboard or sends directly to vendors via WhatsApp.

### 📊 Tab 4: Sales Analytics (360° Business View)
- **Time Filters**: *Today*, *Yesterday*, *This Week*, *This Month*, and *Custom Date Range*.
- **Financial Metric Cards**:
  - Total Revenue (₹) (Paid Gross)
  - Total Orders
  - Average Order Value (AOV in ₹)
  - Pending / Unpaid Total (₹)
- **Multi-Perspective Visual Breakdowns**:
  - **Payment Split**: Segmented progress bar showing UPI vs. Cash vs. Unpaid percentages and ₹ values.
  - **Top Selling Dishes**: Ranked by plates sold and total revenue with visual progress bars.
  - **Portion Split**: Half plates vs. Full plates order ratio.
  - **Category Performance**: Revenue share across Soups, Starters, Noodles, and Rice.
  - **Order Type Split**: Dine-In vs. Takeaway/Parcel ratio.
  - **Peak Hours Rush Heatmap**: 24-hour distribution highlighting Lunch Rush (12–2 PM) and Dinner Rush (7–10 PM).
  - **Past Orders Log**: Searchable list of past orders with 1-tap **Reprint / View Bill** and 1-tap **Mark Paid** for pending orders.

---

## 🚀 Getting Started

### Local Development
```bash
# 1. Navigate to project directory
cd d:\shree-yash-pos

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev
```

### Production Build & PWA Testing
```bash
npm run build
npm run preview
```

---

## 🗄️ Supabase PostgreSQL Setup (Optional)

1. Create a new project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase Dashboard.
3. Open [`schema.sql`](file:///d:/shree-yash-pos/schema.sql) and paste its entire contents, then click **Run**.
4. In your Supabase Project Settings, copy your **Project URL** and **anon public API Key**.
5. Create a `.env` file in `d:\shree-yash-pos\.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
   ```
6. Restart the dev server (`npm run dev`). The header badge will change to **Supabase Online** with live cloud synchronization!

---

## 📲 How to Install as Mobile App (PWA)

- **Android (Chrome)**: Tap the **App** button in the header, or open Chrome menu (`⋮`) and tap **"Add to Home screen"** / **"Install App"**.
- **iOS (Safari)**: Tap the **Share** button (box with upward arrow) and tap **"Add to Home Screen"**.
