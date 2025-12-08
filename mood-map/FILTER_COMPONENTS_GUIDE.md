# Filter Components - Viewing in Storybook

## ✅ Components Created

All filter UI components have been successfully implemented:

1. **EmotionSlider** - Dual sliders for emotion range selection (min/max)
2. **SearchBar** - Debounced text input (300ms default)
3. **TypeFilter** - Toggle buttons for entry type selection (text/video/both)
4. **FilterPanel** - Main container with all filters + clear button

## 🔄 How to See Them in Storybook

Since the app is already running, you need to **reload** to pick up the new stories:

### Option 1: Reload in Terminal

In the terminal where `npm start` is running, press:

```
r
```

### Option 2: Reload in App

- **iOS Simulator**: Press `Cmd + R`
- **Android Emulator**: Press `R` twice
- **Physical Device**: Shake device → "Reload"

### Option 3: Restart App

```bash
# Stop the current process (Ctrl+C)
# Then restart
cd mood-map
npm start
```

## 📱 What You'll See

After reloading, you should see a new **"Filters"** section in Storybook with:

### Filters/EmotionSlider (6 stories)

- Happiness
- Sadness
- Anger
- Fear
- WithCustomRange
- AllEmotions

### Filters/SearchBar (4 stories)

- Default
- WithCustomPlaceholder
- WithFastDebounce (100ms)
- WithSlowDebounce (1000ms)

### Filters/TypeFilter (3 stories)

- BothSelected
- TextOnly
- VideoOnly

### Filters/FilterPanel (1 story)

- Default (complete filter panel with all controls)

## 🎨 Component Features

### EmotionSlider

- Color-coded emotion indicators
- Dual sliders for min/max range
- Real-time percentage display
- Prevents min > max and max < min

### SearchBar

- Debounced input (configurable delay)
- Clear button (appears when text entered)
- Search icon
- Placeholder text

### TypeFilter

- Segmented control design
- Three options: Text, Video, Both
- Ensures at least one type always selected
- Visual feedback on selection

### FilterPanel

- Combines all filter components
- "Clear All" button (only shows when filters active)
- Scrollable content
- Organized sections

## 🧪 Testing the Components

1. **EmotionSlider**: Drag the sliders and watch the percentage update
2. **SearchBar**: Type text and see the debounced value update below
3. **TypeFilter**: Tap buttons to switch between filter modes
4. **FilterPanel**: Try the complete filtering experience

## 📂 File Locations

```
mood-map/components/filters/
├── EmotionSlider.tsx
├── EmotionSlider.stories.tsx
├── SearchBar.tsx
├── SearchBar.stories.tsx
├── TypeFilter.tsx
├── TypeFilter.stories.tsx
├── FilterPanel.tsx
├── FilterPanel.stories.tsx
└── index.ts
```

## 🔧 Troubleshooting

### Still not seeing the Filters section?

1. **Check Storybook is enabled**:

   ```typescript
   // mood-map/storybook.config.ts
   export const ENABLE_STORYBOOK = true; // ← Should be true
   ```

2. **Clear cache and restart**:

   ```bash
   cd mood-map
   rm -rf .expo node_modules/.cache
   npm start -- --clear
   ```

3. **Verify files exist**:

   ```bash
   ls -la components/filters/*.stories.tsx
   ```

4. **Check for errors in Metro bundler** - Look at the terminal output

## ✨ Next Steps

Once you see the components in Storybook:

- Test each component interactively
- Verify the design matches the theme
- Check that state management works correctly
- Try the FilterPanel to see all components together

---

**Task Status**: ✅ Task 19 Complete - All filter UI components implemented with Storybook stories
