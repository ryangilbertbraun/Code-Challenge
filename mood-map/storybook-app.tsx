/**
 * Storybook Entry Point
 *
 * Run this file directly to view component stories:
 * 1. Temporarily rename this file to App.tsx
 * 2. Rename the original App.tsx to App.backup.tsx
 * 3. Run: npm start
 * 4. When done, restore the original names
 *
 * Or use the separate storybook route: /storybook
 */

import { view } from "@storybook/react-native";

// Import all stories

// Filter components
import "./components/filters/EmotionSlider.stories";
import "./components/filters/FilterPanel.stories";
import "./components/filters/SearchBar.stories";
import "./components/filters/TypeFilter.stories";

// Journal components
import "./components/journal/ActivityCalendar.stories";
import "./components/journal/EmotionVisualization.stories";
import "./components/journal/EntryCard.stories";
import "./components/journal/JournalStats.stories";
import "./components/journal/MoodBadge.stories";
import "./components/journal/QuickActions.stories";
import "./components/journal/TextEntryDetail.stories";
import "./components/journal/VideoEntryDetail.stories";
import "./components/journal/WelcomeHeader.stories";

// Video components
import "./components/video/VideoPlayer.stories";
import "./components/video/VideoRecorder.stories";

const StorybookUI = view;

export default StorybookUI;
