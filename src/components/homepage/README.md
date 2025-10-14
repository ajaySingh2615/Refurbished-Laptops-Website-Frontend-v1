# Homepage Components

This folder contains all the components for the homepage sections.

## Components

### HeroSection

- **File**: `HeroSection.jsx`
- **Purpose**: Main hero section with animated background, title, and call-to-action buttons
- **Features**:
  - Parallax scrolling effect
  - Framer Motion animations
  - Responsive design
  - Brand strip integration

### BrandStrip

- **File**: `BrandStrip.jsx`
- **Purpose**: Auto-scrolling brand logos strip
- **Features**:
  - Continuous horizontal scrolling animation
  - Uses actual brand logos from `/public/companies_logo/`
  - Hover to pause animation
  - Fallback text for missing logos

### BannerCarousel

- **File**: `BannerCarousel.jsx`
- **Purpose**: Responsive banner carousel with smooth animations
- **Features**:
  - Auto-rotating slides (5-second intervals)
  - Smooth slide transitions with Framer Motion
  - Navigation arrows and dots
  - Progress bar indicator
  - Responsive design for all devices
  - Touch-friendly controls
  - Accessible navigation
  - Hidden on mobile and tablet (desktop only)

### FeaturedSection

- **File**: `FeaturedSection.jsx`
- **Purpose**: Features showcase section highlighting company benefits
- **Features**:
  - Three key features with icons (Quality Check, Replacement, Warranty)
  - Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
  - Animated icons with hover effects
  - Staggered animations on scroll
  - Call-to-action button
  - Light blue color scheme for trust and quality

### ShopByBrandSection

- **File**: `ShopByBrandSection.jsx`
- **Purpose**: Brand showcase section with clickable brand cards
- **Features**:
  - Four brand cards (Apple, Dell, HP, Lenovo)
  - Clickable cards that navigate to products page with brand filter
  - Responsive grid layout (1 column mobile, 2 tablet, 4 desktop)
  - Hover effects with image scaling and overlay
  - Brand name overlay on each card
  - Error handling for missing images
  - Light gray background with full-width design

### HomePage

- **File**: `HomePage.jsx`
- **Purpose**: Complete homepage layout (standalone version)
- **Features**:
  - Scroll tracking for hero animations
  - Placeholder for additional sections

## Usage

```jsx
import { HeroSection, BrandStrip, BannerCarousel, FeaturedSection, ShopByBrandSection, HomePage } from '../components/homepage';

// Use individual components
<HeroSection scrollY={scrollY} />
<BrandStrip />
<BannerCarousel />
<FeaturedSection />
<ShopByBrandSection />

// Or use the complete homepage
<HomePage />
```

## Assets

The components use images from:

- `/public/hero-section/` - Hero background images
- `/public/companies_logo/` - Brand logos
- `/public/banners/` - Banner carousel images
- `/public/shop_by_brand/` - Brand showcase images

## Dependencies

- `framer-motion` - For animations
- `react-icons` - For icons (HiShoppingBag)
- `lucide-react` - For navigation icons (ChevronLeft, ChevronRight)

## Styling

CSS animations and styles are defined in `/src/index.css`:

- `.animate-scroll` - Brand strip scrolling animation
- `.home-hero` - Hero section background styling
- `.carousel-slide-enter/exit` - Banner carousel slide animations
