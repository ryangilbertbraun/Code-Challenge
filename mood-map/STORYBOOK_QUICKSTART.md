# 🚀 Storybook Quick Start

## View Your Components in 3 Steps

### 1️⃣ Enable Storybook

```typescript
// Open: mood-map/storybook.config.ts
export const ENABLE_STORYBOOK = true; // ← Change this
```

### 2️⃣ Start the App

```bash
cd mood-map
npm start
```

### 3️⃣ Open on Device

- Press `i` for iOS
- Press `a` for Android
- Scan QR for physical device

## 🎨 What You'll See

**33 Interactive Stories** showcasing:

- ✅ MoodBadge (8 stories)
- ✅ EmotionVisualization (7 stories)
- ✅ EntryCard (7 stories)
- ✅ TextEntryDetail (5 stories)
- ✅ VideoEntryDetail (6 stories)

## 🎯 For Your Demo

**Best Stories to Show**:

1. `EntryCard > AllStates` - Shows everything at once
2. `EmotionVisualization > PositiveDetailed` - Beautiful mood display
3. `TextEntryDetail > WithAnalysis` - Complete feature
4. `VideoEntryDetail > ComplexEmotions` - Advanced visualization
5. `MoodBadge > AllEmotions` - Design system showcase

## 🔄 Switch Back to App

```typescript
// In storybook.config.ts
export const ENABLE_STORYBOOK = false; // ← Change back
```

## 📖 More Info

- Full guide: `STORYBOOK.md`
- Setup details: `STORYBOOK_SETUP.md`
- Component overview: `COMPONENT_SHOWCASE.md`

---

**That's it! You're ready to impress! 🌟**
