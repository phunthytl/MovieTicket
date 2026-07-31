---
name: SuperStar Dark Premium
colors:
  background: "#0b1121"
  surface: "#111827"
  surface-hover: "#1f2937"
  primary: "#fbbf24"
  primary-hover: "#f59e0b"
  accent-cyan: "#06b6d4"
  accent-vip-silver: "linear-gradient(135deg, #cbd5e1, #94a3b8)"
  accent-vip-gold: "linear-gradient(135deg, #fbbf24, #d97706)"
  accent-vip-diamond: "linear-gradient(135deg, #22d3ee, #06b6d4, #3b82f6)"
  text: "#ffffff"
  text-muted: "#9ca3af"
  border: "#374151"
typography:
  headline-lg: { fontFamily: Outfit, fontSize: 32px, fontWeight: 700, lineHeight: 1.2 }
  headline-md: { fontFamily: Outfit, fontSize: 24px, fontWeight: 600, lineHeight: 1.3 }
  body-md: { fontFamily: Inter, fontSize: 16px, fontWeight: 400, lineHeight: 1.6 }
  body-sm: { fontFamily: Inter, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  label-md: { fontFamily: Inter, fontSize: 14px, fontWeight: 600, lineHeight: 1.2 }
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
components:
  chat-bubble-user:
    backgroundColor: "{colors.primary}"
    textColor: "#0b1121"
    rounded: "{rounded.lg}"
    padding: 12px
  chat-bubble-ai:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 12px
  floating-button:
    backgroundColor: "{colors.primary}"
    size: 56px
    rounded: "{rounded.full}"
---

# SuperStar Dark Premium Design System

## Overview
A dark, premium, and futuristic theme for the SuperStar Cinema Booking Platform.
The visual design utilizes dark blue-gray foundations accented with brilliant gold and cyan highlights. Micro-animations and soft glowing shadows are used to indicate premium features (VIP badges and AI assistant).

## Colors
- **Background (#0b1121):** Deep cinematic night blue.
- **Surface (#111827):** Slightly lighter blue-gray for cards, modals, and chat bubbles.
- **Primary Gold (#fbbf24):** Golden accent for active selection, calls to action, and highlighting important items.
- **Accent Cyan (#06b6d4):** High-tech tone representing AI assistant features and recommendations.
- **VIP Badges:** Dynamic linear gradients representing Silver, Gold, and Diamond tiers.

## Typography
- Fonts are imported from Google Fonts:
  - **Outfit** for clean, round, modern headings.
  - **Inter** for neutral, highly-readable body copy and labels.

## Shapes
- Generous border-radii (`lg: 12px` and `xl: 16px`) are used on container blocks, chat windows, and card components to soften the layout and provide a premium, modern feel.

## Do's and Don'ts
- **Do** use `linear-gradient` and box-shadow glows only for special features like VIP tiers and AI elements.
- **Don't** use standard default purple/blue colors for components.
- **Do** ensure chat text against dark surfaces has at least a 4.5:1 contrast ratio.
- **Do** include subtle sliding/scaling animations for the opening and closing of floating panels.
