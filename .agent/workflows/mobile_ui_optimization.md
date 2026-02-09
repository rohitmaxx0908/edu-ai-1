---
description: Mobile UI Optimization Workflow
---

# Mobile UI Optimization Strategy

This workflow documents the "Elite" mobile optimization standards applied to the application.

## 1. Navigation System (Floating Island)
- **Concept**: A floating glassmorphic dock instead of a fixed bottom bar.
- **Implementation**:
  - `fixed bottom-8 left-1/2 -translate-x-1/2`
  - `backdrop-blur-3xl`
  - Active state: Glowing animated pill using `layoutId` concept (simulated with CSS/motion).
- **File**: `App.tsx`

## 2. Horizontal Scroll Patterns
- **Concept**: Transform dense grids into swipeable carousels on mobile to save vertical space.
- **Classes**: `flex overflow-x-auto snap-x snap-mandatory no-scrollbar`
- **Application**:
  - `Dashboard.tsx`: Market Intel cards.
  - `ProfileForm.tsx`: Step progress indicator.
  - `NewsHub.tsx`: Filter tabs.

## 3. List-Detail Views
- **Concept**: On mobile, split screens must toggle between List and Detail.
- **Logic**:
  - List: `hidden lg:flex` when item selected.
  - Detail: `hidden lg:flex` when no item selected.
  - Back Button: `lg:hidden` absolute positioned button in Detail view.
- **File**: `NewsHub.tsx`

## 4. Typography Scaling
- **Headings**: `text-2xl md:text-5xl` for Hero sections.
- **Body**: `text-sm md:text-base`.
- **Labels**: `text-[9px]` uppercase tracking-widest.

## 5. Touch Targets
- **Buttons**: Minimum `h-12` or `p-4` for easy tapping.
- **Inputs**: `text-lg` to prevent iOS zoom (16px rule).

## 6. Glassmorphism Standard
- **Background**: `bg-slate-900/80 backdrop-blur-3xl`
- **Borders**: `border-white/10`
- **Shadows**: `shadow-2xl`
- **Noise Texture**: Always include standard noise overlay `opacity-20 mix-blend-overlay`.
