---
name: All Available Luxury System
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#37393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c8c6c5'
  primary: '#c8c6c5'
  on-primary: '#313030'
  primary-container: '#1a1a1a'
  on-primary-container: '#848282'
  inverse-primary: '#5f5e5e'
  secondary: '#e9c349'
  on-secondary: '#3c2f00'
  secondary-container: '#af8d11'
  on-secondary-container: '#342800'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#181a1a'
  on-tertiary-container: '#818383'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  display-xl:
    fontFamily: Noto Serif
    fontSize: 72px
    fontWeight: '400'
    lineHeight: 84px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Noto Serif
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 80px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

The visual identity of this design system centers on exclusivity, precision, and futuristic minimalism. It is engineered to showcase high-value lifestyle accessories—such as horological masterpieces and avant-garde tech—by treating the UI as a curated gallery space rather than a traditional storefront.

The aesthetic combines the weight of traditional luxury with the lightness of modern digital interfaces. By merging **Minimalism** with **Glassmorphism**, the design system achieves a "digital atelier" feel. It prioritizes generous whitespace to allow product photography to breathe, evoking an emotional response of calm, confidence, and sophistication. The target audience is the discerning modern collector who values both heritage craftsmanship and technological advancement.

## Colors

The palette is anchored by **Deep Charcoal**, providing a high-contrast, immersive environment that feels more premium than standard blacks. **Rich Gold** is used sparingly as a "precious metal" accent for calls-to-action, active states, and signifying rarity. 

**Soft Beige** and **Crisp White** serve as the canvas elements, breaking up the dark interface to prevent visual fatigue and to highlight product details. This design system utilizes a dark-mode-first approach to emphasize the "futuristic luxury" brand pillar, using gold-tinted neutrals to maintain warmth within a digital space.

## Typography

This design system employs a sophisticated typographic hierarchy that contrasts the literary authority of **Noto Serif** with the technical precision of **Inter**. 

Headlines utilize Noto Serif with slightly tightened letter-spacing to create a sense of bespoke editorial design. For UI elements, labels, and long-form descriptions, Inter provides maximum legibility and a modern, utilitarian counterpoint. The "Label-Caps" style is specifically reserved for product categories and technical specifications, reinforcing the futuristic, organized nature of the brand.

## Layout & Spacing

This design system follows a **Fixed Grid** model for desktop to ensure a curated, controlled visual experience. A 12-column grid is used with generous 80px outer margins to create the "gallery" effect. 

The spacing rhythm is based on an 8px modular scale. High-end luxury is communicated through "unnecessary" whitespace; therefore, section gaps are intentionally large (120px+) to ensure that no two product categories compete for the user's attention simultaneously. Padding within components is kept expansive to evoke a sense of lightness and air.

## Elevation & Depth

Depth in this design system is achieved through **Glassmorphism** and highly diffused **Ambient Shadows**. Instead of traditional solid shadows, surfaces use a 10-20% opacity white or gold tint with a high backdrop blur (20px-40px) to simulate frosted glass.

Tiered depth is created by:
1.  **Base Layer:** Solid Deep Charcoal.
2.  **Surface Layer:** Semi-transparent Charcoal with a subtle 1px border (Crisp White at 10% opacity).
3.  **Floating Elements:** Glassmorphic panels with soft, extra-diffused shadows (Blur: 30px, Y: 10px, Opacity: 30%).

This creates a "floating" UI that feels holographic and futuristic, consistent with the lifestyle tech focus.

## Shapes

The shape language balances softness with architectural structure. A base roundedness of **1rem (16px)** is applied to primary containers and product cards to soften the high-contrast aesthetic and make the interface feel approachable.

Small components like buttons and tags use a consistent 0.5rem radius, while large promotional hero sections may utilize the full 1.5rem (rounded-xl) for a more immersive, "contained" look. Interactive elements never use sharp 0px corners, maintaining the "premium lifestyle" feel throughout the user journey.

## Components

### Buttons
Primary buttons are solid Rich Gold with Charcoal text, utilizing a slight hover expansion. Secondary buttons are "Ghost" style with a Soft Beige 1px border and glassmorphic background blur.

### Cards
Product cards are the core of this design system. They feature a 1px internal border, no visible background (until hover), and high-resolution imagery. On hover, a glassmorphic overlay appears with product technical specs.

### Inputs
Search and form fields are minimalist—bottom-border only or very subtle Soft Beige fills—to avoid cluttering the refined layout.

### Lifestyle-Specific Elements
- **Spec-Sheets:** A dedicated technical grid component for watch movements or tech specs using the "Label-Caps" typography.
- **Rarity Indicators:** Small, glassmorphic chips with Gold text to denote "Limited Edition" or "Available Now" status.
- **Immersive Carousels:** Full-width scrollable areas with no visible scrollbars, relying on horizontal momentum and subtle progress indicators.