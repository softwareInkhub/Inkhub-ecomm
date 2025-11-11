# Inkhub Next.js Application

This is a Next.js conversion of the Inkhub temporary tattoos e-commerce application, using TypeScript and the App Router architecture.

## 📁 Project Structure

```
next-client/
├── app/                          # Next.js App Router pages
│   ├── api/                     # API routes (backend endpoints)
│   │   ├── health/
│   │   ├── create-razorpay-order/
│   │   ├── verify-payment/
│   │   ├── create-shopify-order/
│   │   ├── validate-discount/
│   │   └── razorpay-webhook/
│   ├── cart/                    # Cart page
│   ├── categories/              # Categories page
│   ├── category/[categoryName]/ # Dynamic category pages
│   ├── checkout/                # Checkout page
│   ├── my-orders/               # Orders page
│   ├── offers/                  # Offers page
│   ├── order-success/           # Success page
│   ├── privacy-policy/          # Privacy policy
│   ├── product/[id]/            # Dynamic product pages
│   ├── profile/                 # User profile
│   ├── search/                  # Search page
│   ├── terms-conditions/        # Terms & conditions
│   ├── track-order/             # Order tracking
│   ├── trends/                  # Trends page
│   ├── wishlist/                # Wishlist page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── components/                   # React components (to be converted)
│   ├── BottomNavbar.tsx         # ✅ Bottom navigation
│   ├── FixedHeader.tsx          # ✅ Fixed header
│   └── ... (35 more to convert)
├── lib/                         # Services and utilities
│   ├── shopifyService.ts        # ✅ Shopify integration
│   ├── razorpayService.ts       # ✅ Razorpay payment
│   ├── productsService.ts       # ✅ Products management
│   └── gokwikService.ts         # ✅ GoKwik payment
├── public/                      # Static assets
│   └── images/                  # Product images
├── types/                       # TypeScript type definitions
│   └── index.ts                 # ✅ Common types
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── .env.local                   # Environment variables (create this!)
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd next-client
npm install
```

### 2. Setup Environment Variables

Create a `.env.local` file in the `next-client` directory:

```env
# Shopify Configuration
NEXT_PUBLIC_SHOPIFY_STORE_URL=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
SHOPIFY_API_VERSION=2024-01

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Backend API URL (if using separate backend)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# GoKwik Configuration (Optional)
NEXT_PUBLIC_GOKWIK_MID=your_merchant_id
GOKWIK_SECRET_KEY=your_secret_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## ✅ Completed Conversions

- [x] **Project Structure** - Next.js App Router setup
- [x] **TypeScript Configuration** - Types and interfaces
- [x] **Environment Setup** - Configuration files
- [x] **Services** - All services converted to TypeScript
  - shopifyService.ts
  - razorpayService.ts
  - productsService.ts
  - gokwikService.ts
- [x] **API Routes** - All backend endpoints
  - /api/health
  - /api/create-razorpay-order
  - /api/verify-payment
  - /api/create-shopify-order
  - /api/validate-discount
  - /api/razorpay-webhook
- [x] **Page Routes** - All pages with placeholders
- [x] **Layout** - Root layout with proper metadata
- [x] **Assets** - Images copied to public folder
- [x] **Initial Components** - BottomNavbar, FixedHeader

## 🔄 Remaining Work: Component Conversion

The following 35 components need to be converted from JSX to TypeScript and moved to the `components/` folder:

### Navigation & Layout (2/4 done)
- [x] BottomNavbar.tsx
- [x] FixedHeader.tsx
- [ ] CategorySection.jsx
- [ ] SeeAllCategoriesBtn.jsx

### Product Display
- [ ] ProductsSection.jsx
- [ ] ProductDetailModal.jsx
- [ ] LatestDrops.jsx
- [ ] LatestDropsInline.jsx
- [ ] RecentlyViewedSection.jsx

### Hero Sections
- [ ] HeroBannerSection.jsx
- [ ] HeroSection.jsx
- [ ] HeroGridSection.jsx
- [ ] HeroPosterInline.jsx
- [ ] HeroPostersScrollableSection.jsx
- [ ] PosterSection.jsx

### Offers & Promotions
- [ ] CountdownBanner.jsx
- [ ] LandscapeOffers.jsx
- [ ] OffersInline.jsx
- [ ] OffersSection.jsx
- [ ] PromoSection.jsx
- [ ] TrendingBanner.jsx

### Profile & User
- [ ] ProfileCard.jsx
- [ ] ProfileHeader.jsx
- [ ] ProfileActionGrid.jsx
- [ ] ProfileSettingsList.jsx
- [ ] ProfileSummaryCards.jsx

### Modals
- [ ] AddressSelectionModal.jsx
- [ ] ContactModal.jsx
- [ ] DatePickerModal.jsx
- [ ] LocationModal.jsx
- [ ] LoginModal.jsx
- [ ] MapLocationPicker.jsx
- [ ] PhoneVerificationModal.jsx
- [ ] ScheduleDeliveryModal.jsx
- [ ] SwipeModal.jsx

### Notifications
- [ ] CartToast.jsx
- [ ] WishlistToast.jsx

## 📝 Component Conversion Guide

To convert a component from JSX to TypeScript:

### 1. Copy the component file

```bash
# From the original src/components folder
cp ../src/components/YourComponent.jsx ./components/YourComponent.tsx
```

### 2. Update imports

Change:
```jsx
import { useNavigate } from 'react-router-dom'
```

To:
```tsx
import { useRouter } from 'next/navigation'
```

### 3. Add type annotations

```tsx
interface YourComponentProps {
  title: string
  onClose?: () => void
}

const YourComponent: React.FC<YourComponentProps> = ({ title, onClose }) => {
  // ...
}
```

### 4. Replace routing

- `useNavigate()` → `useRouter()`
- `navigate('/path')` → `router.push('/path')`
- `<Link to="/path">` → `<Link href="/path">`

### 5. Handle image imports

Replace:
```jsx
import myImage from '../assets/images/image.jpg'
```

With:
```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image src="/images/image.jpg" alt="..." width={500} height={300} />
```

### 6. Add 'use client' directive

If the component uses hooks or browser APIs:
```tsx
'use client'

import React from 'react'
// ...
```

## 🎨 Styling

The app uses a combination of:
- **Global CSS** in `app/globals.css`
- **Tailwind CSS** for utility classes
- **CSS Modules** (optional, for component-specific styles)

Original component styles need to be extracted from `src/index.css` and either:
1. Added to `app/globals.css`
2. Created as component-specific CSS modules
3. Converted to Tailwind utility classes

## 🔑 Key Differences from React App

### Routing
- React Router → Next.js App Router
- `useNavigate()` → `useRouter()`
- `<Link to>` → `<Link href>`

### Images
- Direct imports → `/public` folder + Next.js `<Image />`

### API Calls
- Can use `/api` routes (server-side) or external backend
- Services updated to use `process.env.NEXT_PUBLIC_*`

### State Management
- Client-side state remains the same
- Can add server components for better performance

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔗 API Endpoints

All API endpoints are available at `/api/*`:
- `GET /api/health` - Health check
- `POST /api/create-razorpay-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment
- `POST /api/create-shopify-order` - Create Shopify order
- `POST /api/validate-discount` - Validate discount code
- `POST /api/razorpay-webhook` - Razorpay webhook handler

## 🎯 Next Steps

1. **Convert remaining components** (35 components)
2. **Extract and organize CSS** from original app
3. **Implement full page functionality** for each route
4. **Add error boundaries** and loading states
5. **Optimize images** using Next.js Image component
6. **Add SEO metadata** to each page
7. **Implement server-side rendering** where beneficial
8. **Add unit tests** for components and services

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

When converting components:
1. Maintain the original functionality
2. Add proper TypeScript types
3. Follow Next.js best practices
4. Update this README with your progress

## 📄 License

Same as the original Inkhub application.
