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
  - Error handling for missing images
  - Light gray background with full-width design

### ShopByProcessorSection

- **File**: `ShopByProcessorSection.jsx`
- **Purpose**: Processor showcase section with clickable processor cards
- **Features**:
  - Three processor cards (Intel, AMD, Apple)
  - Clickable cards that navigate to products page with processor filter
  - Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
  - Hover effects with image scaling
  - Intel/AMD filter by CPU field, Apple by brand
  - Light blue background with full-width design
  - 3:2 aspect ratio images (1200x800)

### CompanyLogoSection

- **File**: `CompanyLogoSection.jsx`
- **Purpose**: Company logos showcase section for brand trust
- **Features**:
  - Twelve company logos in infinite horizontal scroll
  - Continuous scrolling animation (40s duration)
  - Pause on hover for better user interaction
  - Grayscale logos with color on hover
  - White cards with subtle shadows
  - Responsive sizing for all devices
  - Light gray background with full-width design
  - Trust-building messaging

### HomePage

- **File**: `HomePage.jsx`
- **Purpose**: Complete homepage layout (standalone version)
- **Features**:
  - Scroll tracking for hero animations
  - Placeholder for additional sections

## Usage

```jsx
import { HeroSection, BrandStrip, BannerCarousel, FeaturedSection, ShopByBrandSection, ShopByProcessorSection, CompanyLogoSection, HomePage } from '../components/homepage';

// Use individual components
<HeroSection scrollY={scrollY} />
<BrandStrip />
<BannerCarousel />
<FeaturedSection />
<ShopByBrandSection />
<ShopByProcessorSection />
<CompanyLogoSection />

// Or use the complete homepage
<HomePage />
```

## Assets

The components use images from:

- `/public/hero-section/` - Hero background images
- `/public/companies_logo/` - Brand logos
- `/public/banners/` - Banner carousel images
- `/public/shop_by_brand/` - Brand showcase images
- `/public/shop_by_processor/` - Processor showcase images (1200x800)

## Dependencies

- `framer-motion` - For animations
- `react-icons` - For icons (HiShoppingBag)
- `lucide-react` - For navigation icons (ChevronLeft, ChevronRight)

## Styling

CSS animations and styles are defined in `/src/index.css`:

- `.animate-scroll` - Brand strip scrolling animation
- `.home-hero` - Hero section background styling
- `.carousel-slide-enter/exit` - Banner carousel slide animations
