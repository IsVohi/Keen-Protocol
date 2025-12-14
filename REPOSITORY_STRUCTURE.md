# KEEN Protocol - Repository Structure

## Overview
KEEN is a decentralized oracle protocol built on Ergo blockchain using Next.js 16, React 19, and TypeScript.

## Directory Structure

```
keen/
├── app/                          # Next.js App Router directory
│   ├── favicon.ico               # Site favicon
│   ├── globals.css               # Global styles and CSS variables
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main homepage component
│
├── components/                   # React components
│   ├── ui/                       # Reusable UI components (shadcn/ui)
│   │   ├── alert.tsx             # Alert/notification component
│   │   ├── badge.tsx             # Badge component
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx               # Card container component
│   │   ├── dialog.tsx            # Modal dialog component
│   │   ├── dropdown-menu.tsx      # Dropdown menu component
│   │   ├── input.tsx             # Input field component
│   │   ├── label.tsx             # Form label component
│   │   └── tabs.tsx              # Tabs component
│   │
│   ├── aggregation-view.tsx      # Price aggregation display
│   ├── background-animation.tsx  # Background particle animations
│   ├── dispute-panel.tsx          # Dispute submission panel
│   ├── kyc-modal.tsx             # KYC verification modal
│   ├── oracle-dashboard.tsx      # Oracle stats dashboard
│   ├── price-submission.tsx      # Price submission form
│   ├── registration-form.tsx      # Oracle registration form
│   ├── theme-toggle.tsx          # Dark/light theme switcher
│   └── wallet-connect.tsx        # Ergo wallet connection
│
├── lib/                          # Utility libraries and business logic
│   ├── ergo-contracts.ts          # Oracle contract interactions
│   ├── ergo-wallet.ts             # Ergo wallet integration (Nautilus)
│   └── utils.ts                  # General utility functions
│
├── public/                       # Static assets
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── assests/                      # Additional assets (images)
│   ├── opening.png
│   ├── register.png
│   └── reward.png
│
├── .gitignore                    # Git ignore rules
├── components.json               # shadcn/ui configuration
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── next-env.d.ts                 # Next.js TypeScript definitions
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependency versions
├── postcss.config.mjs            # PostCSS configuration
├── README.md                     # Project documentation
└── tsconfig.json                 # TypeScript configuration

```

## Key Files Description

### Core Application Files

#### `app/page.tsx`
- Main application entry point
- Handles wallet connection state
- Manages oracle registration status
- Renders main UI with tabs for different features

#### `app/layout.tsx`
- Root layout wrapper
- Sets up fonts and metadata
- Includes Vercel Analytics

#### `app/globals.css`
- Global CSS styles
- Tailwind CSS configuration
- CSS custom properties (colors, themes)
- Background animation keyframes

### Component Files

#### Core Components
- **`oracle-dashboard.tsx`**: Displays oracle statistics (reputation, rewards, submissions, accuracy)
- **`price-submission.tsx`**: Form for submitting BTC/USD prices
- **`aggregation-view.tsx`**: Shows current epoch submissions and aggregated median
- **`registration-form.tsx`**: Oracle registration with KYC
- **`dispute-panel.tsx`**: Submit disputes for incorrect aggregations
- **`wallet-connect.tsx`**: Connect/disconnect Ergo wallet (Nautilus)
- **`background-animation.tsx`**: Animated background particles

### Library Files

#### `lib/ergo-contracts.ts`
- Main contract interaction logic
- Oracle registration
- Price submission
- Reward distribution
- Reputation management
- Local state management with localStorage persistence

#### `lib/ergo-wallet.ts`
- Ergo wallet connection (Nautilus)
- Address retrieval
- Balance checking
- Transaction signing/submission

## Technology Stack

### Frontend Framework
- **Next.js 16.0.10** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type safety

### Styling
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Component library built on Radix

### Blockchain Integration
- **Ergo Wallet API** - Nautilus wallet integration
- Custom contract interaction layer

### State Management
- React Hooks (useState, useEffect, useMemo)
- localStorage for persistence

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Features

1. **Oracle Registration**: Register as an oracle with stake
2. **Price Submission**: Submit BTC/USD prices for aggregation
3. **Aggregation**: View and trigger price aggregation
4. **Reputation System**: Track oracle reputation based on accuracy
5. **Rewards**: Earn and withdraw rewards for accurate submissions
6. **Disputes**: Challenge incorrect aggregations
7. **Wallet Integration**: Connect with Ergo Nautilus wallet
8. **Theme Support**: Light/dark mode toggle

## Data Persistence

- Uses `localStorage` to persist:
  - Oracle registration status
  - Reputation and stats
  - Price submissions
  - Aggregated prices
  - Address mappings

## Configuration Files

- **`tsconfig.json`**: TypeScript compiler options
- **`next.config.ts`**: Next.js build and runtime configuration
- **`postcss.config.mjs`**: PostCSS plugins (Tailwind)
- **`eslint.config.mjs`**: Code linting rules
- **`components.json`**: shadcn/ui component configuration

## Build Output

- **`.next/`**: Next.js build output (generated, not in repo)
- **`node_modules/`**: Dependencies (not in repo)

## Notes

- The project uses mock transactions for development
- Contract addresses need to be configured in `lib/ergo-contracts.ts`
- State persists across page refreshes via localStorage
- Background animations are subtle and non-intrusive

