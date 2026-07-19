# 🌱 Yieldy

Track your garden harvests and measure your return on investment.

## Stack

- **Expo SDK 52** (React Native)
- **Expo Router v4** — file-based navigation
- **Expo SQLite + Drizzle ORM** — local-first persistence
- **Zustand** — UI state management
- **Reanimated 3** — animations

## Getting started

```bash
npm install
npx expo start
```

## Structure

```
app/
  (tabs)/       ← screens: Accueil, Journal, Récap, Renta, Réglages
  (sheets)/     ← modal sheets: Form, Invest, Legume, Bac
src/
  db/           ← Drizzle schema + migrations
  store/        ← Zustand stores
  hooks/        ← custom React hooks
  utils/        ← helpers (formatting, calculations)
  types/        ← shared TypeScript types
```

## Branching

```
main    ← production
dev     ← integration (base de travail)
feat/*  ← features
fix/*   ← bug fixes
```
