# El Waha Pumps Website Rebuild

A fast, modern, and responsive B2B industrial website for **El Waha Pumps** (شركة الواحة لخدمات الآبار والطلمبات), rebuilt using Next.js (App Router), TypeScript, and Tailwind CSS.

## Features
- **Multi-language Support (RTL/LTR)**: Primary Arabic (RTL) and secondary English (LTR) with dynamic URL routing (`/ar` and `/en`) and a custom path-preserving language switcher.
- **Performance Optimized**: Built using Next.js Static Site Generation (SSG), loading optimized Google Fonts (Tajawal and Inter), and utilizing native CSS animations to replace heavy slider plugins.
- **Lead Generation Focused**: Custom contact form with Suspense, click-to-call links, and a floating WhatsApp button.
- **Clean Structure**: 100% type-safe components.

---

## Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run Development Server
Start the local server at `http://localhost:3000`:
```bash
npm run dev
```

### 3. Production Build
Build and optimize the application for deployment (outputs static/SSR optimized routes):
```bash
npm run build
```

---

## How to Add or Modify Content (Zero-Layout-Code Maintenance)

All pages are data-driven. You can add, edit, or remove products, services, and agent brands simply by updating the translation dictionaries and list arrays. No layout code modifications are needed.

### 1. Adding/Modifying a Service
Service details are dynamically compiled for pages like `/ar/services/[slug]` and `/en/services/[slug]`.

1. **Add Translations**:
   Open `src/dictionaries/ar.json` and `src/dictionaries/en.json`. Add a new service entry inside the `"servicesData"` block:
   ```json
   // in ar.json
   "servicesData": {
     "my-new-service": {
       "title": "عنوان الخدمة الجديدة",
       "short": "وصف مختصر للخدمة يظهر في الشبكة.",
       "desc": "الوصف التفصيلي الكامل للخدمة يظهر في صفحة التفاصيل..."
     }
   }
   ```
   Add the exact same key structure with English translations inside `en.json`.

2. **Register the Service**:
   Open `src/app/[lang]/services/[slug]/page.tsx` and add your service slug (`"my-new-service"`) to the `serviceSlugs` array:
   ```typescript
   const serviceSlugs = [
     "pump-supply",
     // ...
     "my-new-service" // Add your slug here
   ];
   ```
   - If it is a **Supply** service, register its slug in `supplyServiceIds` inside:
     - `src/app/[lang]/page.tsx`
     - `src/app/[lang]/services/page.tsx`
     - `src/app/[lang]/services/[slug]/page.tsx` (in the `isSupply` condition).
   - If it is a **Maintenance** service, register its slug in `maintenanceServiceIds` inside the same files.

---

### 2. Adding/Modifying a Product
Products are displayed on the showcase page (`/products`) and the home page.

1. **Add Translations**:
   Add a new product entry inside the `"productsData"` block in `ar.json` and `en.json`:
   ```json
   "productsData": {
     "my-new-product": {
       "title": "طلمبة أعماق موديل X",
       "category": "pumps", // Can be "motors", "pumps", or "electrical"
       "desc": "المواصفات والخصائص التفصيلية للطلمبة الجديدة..."
     }
   }
   ```

2. **Register the Product**:
   Open `src/components/ProductTabs.tsx` and append your product object to the `products` list:
   ```typescript
   {
     id: "my-new-product",
     title: dict.productsData["my-new-product"].title,
     category: "pumps", // Match the category key
     desc: dict.productsData["my-new-product"].desc,
   }
   ```

---

### 3. Adding/Modifying an Agent (Brand Partner)
Brand pages are compiled dynamically at `/agents/[slug]`.

1. **Add Translations**:
   Add the brand entry inside the `"agentsData"` block in `ar.json` and `en.json`:
   ```json
   "agentsData": {
     "brand-slug": {
       "name": "اسم الماركة التجارية",
       "title": "التصنيف الرئيسي (مثال: محركات كهروميكانيكية)",
       "desc": "شرح تفصيلي للعلامة التجارية وحجم شراكتنا..."
     }
   }
   ```

2. **Register the Agent**:
   Open `src/app/[lang]/agents/[slug]/page.tsx` and `src/app/[lang]/agents/page.tsx` and append the slug (e.g. `"brand-slug"`) to the respective `agentSlugs` or `agents` arrays.
   
3. **Register Product Lines**:
   In `src/app/[lang]/agents/[slug]/page.tsx`, define the brand's product lines list in `productLinesMap` for both languages:
   ```typescript
   "brand-slug": lang === "ar"
     ? [
         "خط المنتجات الأول",
         "خط المنتجات الثاني",
       ]
     : [
         "First Product Line",
         "Second Product Line",
       ]
   ```
