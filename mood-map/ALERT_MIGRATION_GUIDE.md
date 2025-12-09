# Alert Dialog Migration Guide

This guide explains how to migrate from React Native's `Alert.alert()` to the custom `AlertDialog` component.

## Overview

The custom alert system provides:

- Beautiful design that matches the MoodMap app aesthetic
- Blur background overlay (iOS) with smooth animations
- Customizable buttons with different styles (default, cancel, destructive)
- Consistent user experience across the app
- Easy-to-use hook-based API

## Setup

The `AlertProvider` has been added to the root layout (`app/_layout.tsx`), so the alert system is available throughout the app.

## Usage

### 1. Import the hook

```tsx
import { useAlert } from "@/contexts/AlertContext";
```

### 2. Get the alert instance

```tsx
const alert = useAlert();
```

### 3. Show alerts

#### Simple Alert (OK button only)

**Before:**

```tsx
Alert.alert("Success", "Your entry has been created!");
```

**After:**

```tsx
alert.show({
  title: "Success",
  message: "Your entry has been created!",
});
```

#### Alert with Custom Buttons

**Before:**

```tsx
Alert.alert("Delete Entry", "Are you sure?", [
  { text: "Cancel", style: "cancel" },
  { text: "Delete", style: "destructive", onPress: handleDelete },
]);
```

**After:**

```tsx
alert.show({
  title: "Delete Entry",
  message: "Are you sure?",
  buttons: [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: handleDelete },
  ],
});
```

#### Alert with Callback

**Before:**

```tsx
Alert.alert("Success", "Entry created!", [
  {
    text: "OK",
    onPress: () => router.back(),
  },
]);
```

**After:**

```tsx
alert.show({
  title: "Success",
  message: "Entry created!",
  buttons: [
    {
      text: "OK",
      onPress: () => router.back(),
    },
  ],
});
```

## Button Styles

The alert dialog supports three button styles:

- `"default"` - Primary button with app's primary color (dusty rose)
- `"cancel"` - Secondary button with neutral gray background
- `"destructive"` - Red button for destructive actions (delete, logout, etc.)

## Migration Checklist

Files that need to be updated:

- [x] `screens/CreateEntryScreen.tsx` - ✅ Updated
- [x] `screens/ProfileScreen.tsx` - ✅ Updated
- [ ] `screens/EntryDetailScreen.tsx`
- [ ] `components/video/VideoRecorder.tsx`
- [ ] `components/video/VideoRecorder.stories.tsx`
- [ ] `components/journal/EntryCard.stories.tsx`
- [ ] `components/journal/QuickActions.stories.tsx`
- [ ] `components/journal/VideoEntryDetail.tsx`

## Search and Replace Pattern

1. Find all `Alert.alert(` calls in your codebase
2. Replace with `alert.show({`
3. Convert positional parameters to object properties:
   - First parameter → `title`
   - Second parameter → `message`
   - Third parameter (array) → `buttons`
4. Add `const alert = useAlert();` to the component
5. Add `import { useAlert } from "@/contexts/AlertContext";`
6. Remove `Alert` from React Native imports

## Example Complete Migration

**Before:**

```tsx
import { Alert } from "react-native";

function MyComponent() {
  const handleDelete = () => {
    Alert.alert("Delete Item", "This cannot be undone", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: confirmDelete },
    ]);
  };

  return <Button onPress={handleDelete} />;
}
```

**After:**

```tsx
import { useAlert } from "@/contexts/AlertContext";

function MyComponent() {
  const alert = useAlert();

  const handleDelete = () => {
    alert.show({
      title: "Delete Item",
      message: "This cannot be undone",
      buttons: [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: confirmDelete },
      ],
    });
  };

  return <Button onPress={handleDelete} />;
}
```

## Notes

- The alert automatically dismisses when any button is pressed
- Tapping the backdrop only dismisses if there's a cancel button
- The dialog is centered and responsive to different screen sizes
- Animations are handled automatically
- The component uses the app's theme colors and typography
