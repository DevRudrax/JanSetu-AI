---
name: JanSetu AI Design System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#444651'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#757682'
  outline-variant: '#c5c5d3'
  surface-tint: '#4059aa'
  primary: '#00236f'
  on-primary: '#ffffff'
  primary-container: '#1e3a8a'
  on-primary-container: '#90a8ff'
  inverse-primary: '#b6c4ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#00311f'
  on-tertiary: '#ffffff'
  tertiary-container: '#004a31'
  on-tertiary-container: '#27c38a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#00164e'
  on-primary-fixed-variant: '#264191'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
  slate-text: '#1E293B'
  slate-muted: '#64748B'
  border-light: '#E2E8F0'
  status-success: '#059669'
  status-warning: '#F59E0B'
  status-error: '#DC2626'
typography:
  display-lg:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
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
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  touch-target-min: 44px
---

## Brand & Style
The design system is engineered for **JanSetu AI**, focusing on the intersection of government-grade reliability and cutting-edge artificial intelligence. The brand personality is **authoritative, transparent, and efficient**. It seeks to evoke a sense of civic duty coupled with modern technological progress.

The design style follows a **Modern Corporate** aesthetic with **Minimalist** influences. It prioritizes information density and accessibility over decorative elements. The visual language is "Crisp & Functional," utilizing high-contrast borders and a structured grid to ensure trust and clarity for citizens and government officials alike.

## Colors
The palette is rooted in **Deep Navy (#1E3A8A)** to establish institutional trust, while **Bright Blue (#2563EB)** serves as the interactive driver for SaaS actions. 

- **Primary & Secondary:** Used for headers, primary navigation, and high-priority call-to-actions.
- **Tertiary (Emerald):** Reserved specifically for "Success" states, completion indicators, and positive growth metrics.
- **Neutral:** The background utilizes **Soft Slate (#F8FAFC)** to reduce eye strain compared to pure white, providing a sophisticated canvas for data-heavy interfaces.
- **Contrast Compliance:** All text-to-background combinations must meet WCAG AA standards at minimum, favoring AAA for body content.

## Typography
This design system pairs **Public Sans** for headings—leveraging its institutional and highly legible structure—with **Inter** for body and UI elements to ensure maximum clarity in data-dense SaaS environments.

- **Scale:** A modular scale is used to maintain a clear information hierarchy.
- **Accessibility:** Line heights are generous (1.5x for body) to assist readability for diverse user demographics.
- **Weight:** Semi-bold (600) is used for section headers to provide strong visual anchors without the aggression of heavy black weights.

## Layout & Spacing
The layout utilizes a **Fixed Grid** model for desktop to ensure content remains readable and professional, transitioning to a fluid model for mobile.

- **Grid:** 12-column system for desktop, 4-column for mobile.
- **Rhythm:** An 8px linear scale (with 4px increments for tight UI) governs all padding and margins.
- **Touch Targets:** All interactive elements maintain a minimum size of 44x44px to ensure accessibility for older citizens or users with motor impairments.
- **Breakpoints:**
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px

## Elevation & Depth
To maintain a "GovTech" feel, this design system avoids heavy shadows. Instead, it uses **Low-Contrast Outlines** and **Tonal Layers** to create depth.

- **Planes:** The base layer is Slate (#F8FAFC). Content cards use a pure White (#FFFFFF) fill with a 1px border (#E2E8F0).
- **Shadows:** When necessary for modals or dropdowns, use a single "Ambient" shadow: `0 4px 6px -1px rgba(0, 0, 0, 0.05)`.
- **States:** Hover states are indicated by a subtle shift in background color or a 2px primary-colored border-bottom, rather than a vertical lift.

## Shapes
The shape language is **Soft and Precise**. A 4px (0.25rem) base radius is used for most components to strike a balance between friendly modern software and formal government architecture.

- **Buttons & Inputs:** 4px radius (Soft).
- **Cards & Modals:** 8px radius (rounded-lg).
- **Status Pills:** Fully rounded (Pill-shaped) to distinguish them from actionable buttons.

## Components
- **Buttons:** Primary buttons use a solid Navy (#1E3A8A) background with White text. Secondary buttons use a Navy outline with a White background. No gradients are permitted.
- **Input Fields:** Use a 1px slate border. Focus states must use a 2px blue ring (#2563EB) for high visibility.
- **Status Chips:** Use a light tint of the status color for the background (e.g., light emerald) with dark emerald text for the label.
- **Cards:** Cards should be flat with a 1px border. Header areas within cards should have a subtle slate-50 background to separate metadata from content.
- **Data Tables:** Highly structured with 1px horizontal dividers only. Header rows should be slightly darker (#F1F5F9) to anchor the data.
- **AI Indicators:** Elements powered by AI should feature a subtle "Indigo Glow" or a specific "AI-Sparkle" icon to denote machine-generated content, maintaining transparency.