# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify checkout replacement application built with React + TypeScript. It provides a custom checkout experience for Shopify stores, replacing the default checkout flow. The app is embedded into Shopify stores via an iframe and communicates with a backend API (Laravel/PHP) for cart, order, and payment operations. Supports multi-shop/tenant setup via URL-based shop parameter.

## Commands

```bash
yarn dev          # Start dev server (Vite)
yarn build        # Type check + production build
yarn lint         # ESLint check for .ts/.tsx files
yarn preview      # Preview production build locally
yarn postinstall  # Apply patches (patch-package)
```

## Architecture

### Entry Point
- `src/main.tsx` - Initializes Sentry from `<meta>` tags, configures phone format from `phone_format` meta, renders `<Global>`
- `src/Global.tsx` - Wraps app with SWR config (fetcher via `swr_api`), Apollo Client (`ApolloStoreFrontClient`), `<App>`, and `<Analytics>`
- `src/App.tsx` - React Router with 3 main routes, paths are prefixed by `getGlobalBase()` (reads `site_base` meta tag, defaults to `/a/s`):
  - `{base}/additional/:token` - Upsell/post-purchase page (lazy-loaded `Additional` component)
  - `{base}/orders/:token/:action?` - Order confirmation / thank-you page
  - `{base}/checkouts/:token/:action?` - Main checkout flow (loader preloads cart via `PreloadCart` + Apollo `createQueryPreloader`)
  - `{base}/approve/:token` - Payment approval flow

### Multi-Shop / Dynamic Routing
- Route prefix is determined at runtime by `getGlobalBase()` (from `globalSettings.ts`) instead of being hardcoded
- API calls use `getFinalPath()` to dynamically construct URLs
- The `shop` route param is supported for multi-tenant setups; route loader IDs switch between `checkout_container` and `shop_checkout_container`
- `useCurrentLoaderData()` hook abstracts this with `useRouteLoaderData`

### Data Layer
- **SWR** for REST API calls (custom `swr_api` fetcher via axios). Container pattern wraps SWR responses into React Context providers.
- **Apollo Client** for Shopify Storefront GraphQL API. Configured in `src/lib/checkout.ts` with:
  - URL from `storefront_url` or `api_version` meta tags
  - Error link, RetryLink, and MutationQueueLink
  - Custom InMemoryCache typePolicies for Cart delivery options
  - `ApolloPreloader = createQueryPreloader(client)` for route-level data prefetching
- **Configuration from `<meta>` tags**: Features are gated via `getArrayFromMeta('features')`, global settings via `getJsonFromMeta('settings')`, phone format via `getJsonFromMeta('phone_format')`

### Container Pattern (`src/container/`)
Three container creation patterns from `src/lib/SimpleContainer.tsx`:
- `createSWRContainer<T>` - Wraps a SWR hook call in a context provider; optionally renders a fallback while loading/error
- `createSimpleContainer<T>` - Basic context provider without data fetching
- `createLoaderContainer<T>` - Wraps React Router `useLoaderData()` in a context with `<Outlet />`
- `src/container/` contains: `CheckoutContext` (SWR), `CurrencyContext` (simple), `FormContext` (rc-field-form), `PaymentContext`, `ShopContext`, `SummaryContext` (watches form for shipping/insurance changes)

### Route Layout
- `ShopifyCheckoutFrame` - Parent component providing checkout data via loader
- `src/shopify/checkouts/index.tsx` - Main checkout layout with `Left` (form) and `Right` (order summary) panels, nav bar, error boundaries, analytics events (`Produce`, `Beacon`)

### Key Directories
- `src/shopify/checkouts/` - Checkout page components: step screens (`PaymentMethodStep`, `ShippingMethodStep`, `BillingAddressStep`, `LocalizedFields`), fragments (`Summary`, `Policy`, `LineItem`, `Left`, `Right`, `Image`, `SingleCheckoutForm`, `ShopifyCouponForm`, `ApproveIt`)
- `src/shopify/checkouts/hooks/` - `useCurrentLoaderData`, `useSummary`, `useUpdateContactInformation`
- `src/shopify/fragments/` - Reusable UI: `WhyChooseUs`, `DeliveryTip`, `Pixels`, `Beacon`, `Produce`, `HighDemandCountDown`, `PaypalQuicklyButton`, `ShopifyCheckoutFrame`, `SummaryFrame`
- `src/shopify/context/` - `ShopifyContext` (shop info, money formatting), `CartStorage` (cart token persistence with cookie/localStorage), `ShopifyCheckoutContext`, `ShopifyDiscountCodeContext`
- `src/shopify/hooks/` - `useVariant`, `useCleanCartCookie`, `useFormValidate` (Zod-based form validation)
- `src/shopify/lib/` - Utilities: `payment.ts`, `helper.ts`, `globalSettings.ts` (settings from meta), `ArrayHelper.ts`
- `src/shopify/additional/` - Upsell page with fragments: `Product`, `ProductContainer`, `Covers`, `Images`, `Variants`, `Swatch`, `ProductOptions`, `InputNumber`
- `src/shopify/order/` - Order confirmation page

### UI Layer
- `src/page/` - Checkout forms (`AddressForm`, `ContactInformationForm`), step components (`ContactInformationStep`, `PaymentMethodStep` sub-components), UI components (`Media`, `Input`, `RegionSelector`, `RadioGroup`, `Selector`, `FloatLabel`, `Check`, `LogoImage`, `Report`, `Analytics`, `NewMedia`)
- `src/components/ui/` - shadcn-style primitives (`button`, `input`, `select`, `checkbox`, `dialog`, `tooltip`, `breadcrumb`, `Skeleton`, `SmartDiv`, `CountriesSelector`, `PhoneInput`, `PhoneInput2`, `Divider`)
- `src/components/frames/` - Layout frames: `PageFrame`, `NavFrame`, `FormContainer`, `Frame`, `BoxFrame`, `StepFrame`, `StepBlock`, `BreadcrumbNavigator`, `PaymentMethodFrame`, `StandardFormFrame`, `InsuranceFrame`, `ShippingListFrame`, `RightFrame`, `PayingContainer`, `CouponFormFrame`, `FooterFrame`, `SingleFormFrame`, `NavigationBarFrame`, `StandardNavigationBarFrame`
- `src/components/fragments/` - Reusable: `Price`, `Loading`, `LoadingContainer`, `AsyncButton`, `CountDown`, `FormItem`, `LazyRender`, `Line`, `Tooltip`, `XForm`
- `src/components/cart/` - Cart-specific components: `CartCountDown`, `Line`
- `src/assets/` - Card brand SVG icons: `visa`, `mastercard`, `amex`, `discover`, `paypal`, `zones`

### Payments
- `src/payments/` - `AsiaBill.tsx`, `PaypalCard.tsx`, `PaypalField.tsx` fragment, `usePaypalCardFields` hook
- `src/shopify/lib/payment.ts` - Payment processing logic
- `src/payments/hooks/` - Payment-specific hooks

### Analytics & Pixels
- `src/components/pixels/` - Platform pixels: `FacebookPixel`, `SnapchatPixel`, `TiktokPixel`, `NewsbreakPixel`, `usePlatformPixel`
- `src/shopify/fragments/Pixels.tsx` - Pixel integration component
- `src/page/components/Analytics.tsx` - Analytics wrapper
- `src/shopify/fragments/Produce.tsx` - Event production/dispatch
- `src/shopify/fragments/Beacon.tsx` - Beacon tracking

### Geo & Address
- `src/geo/` - Address verification: `Nominatim` (OpenStreetMap), `ZipSuggest` (zip code autocomplete), `Census` (US Census geocoding), `GeoAddress`

### Form System
- Uses `@rc-component/form` (replaces `rc-field-form`) with `Form.useWatch` for reactive field watching
- `src/container/FormContext.ts` - Form context provider
- Validation via `Zod` schemas in `useFormValidate`, `MethodValidators`, `regex`

### GraphQL
- `src/query/checkouts/` - `queries.ts`, `mutations.ts`, `fragments/fragments.ts`, `cache/caches.ts`, `cache/useCartCache.ts`
- `src/gql/` - `GetDeliveryGroupQuery.ts`

### Build Notes
- Production build inlines CSS into a single HTML output via `inline-tailwind-css` Vite plugin
- `index.blade.php` is injected into the final HTML for Laravel integration
- MSW service worker (`mockServiceWorker.js`) is deleted from dist after build via `removeMSW` plugin
- Source maps optionally uploaded to Sentry (currently commented out) and deleted
- Path aliases: `@/`, `@hooks/`, `@components/`, `@lib/`, `@utils/`, `@query/`

### Tech Stack
- **React 19** with **React Router v6** (createBrowserRouter + loaders + route loader data)
- **SWR** for REST data fetching with custom axios fetcher
- **Apollo Client** for Shopify Storefront GraphQL API (with retry, error, mutation queue links)
- **@rc-component/form** for form state management
- **Tailwind CSS 3** + **Radix UI** + **Lucide** icons + **class-variance-authority** + **tailwind-merge**
- **Zod** for validation, **google-libphonenumber** for phone validation
- **Sentry** for error tracking (configured from meta tags)
- **Vite 5** with SWC plugin (fast refresh), PostCSS, Autoprefixer
- **Big.js** for monetary calculations
- **MSW** for API mocking in development
- **patch-package** for dependency patches

### Environment
- `.env` - Local dev config (VITE_API, VITE_BASE, VITE_DEV_PORT, VITE_API_REMOTE_HOST, VITE_API_PORT)
- `.env.production` - Production overrides
- `.env.sentry-build-plugin` - Sentry auth token (currently unused)
- Configuration is driven by `<meta>` tags in `index.html` at runtime (not build-time env vars)
