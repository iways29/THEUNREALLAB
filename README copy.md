# The Unreal Lab

> We Make the Unreal Real.

A product studio at the edge of AI and human experience.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS custom properties + Tailwind
- **Fonts**: Syne + DM Mono (Google Fonts)
- **Deployment**: Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  layout.tsx       # Root layout with metadata
  page.tsx         # Main page (assembles all sections)
  globals.css      # Global styles, animations, CSS variables

components/
  Cursor.tsx       # Custom cursor with trailing ring
  Navbar.tsx       # Fixed navbar with scroll effect
  Hero.tsx         # Full-viewport hero section
  Marquee.tsx      # Auto-scrolling ticker
  Products.tsx     # Products grid (Mumba.ai + coming soon)
  Manifesto.tsx    # About / manifesto section
  CTA.tsx          # Call-to-action section
  Footer.tsx       # Site footer
  ScrollReveal.tsx # Intersection observer for reveal animations
```

## Deployment

Push to GitHub and connect to [Vercel](https://vercel.com).

```bash
npm run build   # Build for production
```

## Customization

- Update product links in `components/Products.tsx`
- Edit email in `components/CTA.tsx` and `components/Footer.tsx`
- Add social links in `components/Footer.tsx`
- Update metadata in `app/layout.tsx`
