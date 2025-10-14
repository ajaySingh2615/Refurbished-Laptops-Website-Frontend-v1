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

### HomePage

- **File**: `HomePage.jsx`
- **Purpose**: Complete homepage layout (standalone version)
- **Features**:
  - Scroll tracking for hero animations
  - Placeholder for additional sections

## Usage

```jsx
import { HeroSection, BrandStrip, HomePage } from '../components/homepage';

// Use individual components
<HeroSection scrollY={scrollY} />
<BrandStrip />

// Or use the complete homepage
<HomePage />
```

## Assets

The components use images from:

- `/public/hero-section/` - Hero background images
- `/public/companies_logo/` - Brand logos

## Dependencies

- `framer-motion` - For animations
- `react-icons` - For icons (HiShoppingBag)

## Styling

CSS animations and styles are defined in `/src/index.css`:

- `.animate-scroll` - Brand strip scrolling animation
- `.home-hero` - Hero section background styling
