# Storybook for MoodMap Components

This project includes Storybook for React Native to showcase and test UI components in isolation.

## 🚀 Quick Start

### 1. Enable Storybook Mode

Open `storybook.config.ts` and set:

```typescript
export const ENABLE_STORYBOOK = true;
```

### 2. Start the Development Server

```bash
npm start
```

Then press:

- `i` for iOS simulator
- `a` for Android emulator
- Scan QR code with Expo Go app on your device

### 3. Browse Components

Once the app loads, you'll see the Storybook UI with all available component stories organized by category.

## 📚 Available Stories

### Journal Components

#### MoodBadge

- Individual emotion badges with different sizes
- Shows emotion name, value, and color indicator
- Stories: Happiness, Sadness, Anger, Fear, All Sizes

#### EmotionVisualization

- Complete mood metadata display
- Compact and detailed variants
- Stories: Positive, Negative, Neutral, Mixed moods

#### EntryCard

- Journal entry preview cards
- Text and video entry types
- Stories: With analysis, Loading, Error states

#### TextEntryDetail

- Full text entry view with mood analysis
- Stories: Success, Loading, Error, Pending, Mixed emotions

#### VideoEntryDetail

- Full video entry view with Hume emotion data
- Stories: Success, Loading, Error, Complex emotions

## 🎨 Using Storybook

### Interactive Controls

Use the on-device controls addon to:

- Adjust component props in real-time
- Test different emotion values (0-1 range)
- Switch between variants and sizes
- Test different states (loading, error, success)

### Testing Components

1. **Visual Testing**: Review component appearance across different states
2. **Interaction Testing**: Tap components to test press handlers
3. **Responsive Testing**: Test on different device sizes
4. **Dark Mode**: Test components in light/dark themes (if implemented)

## 🔧 Adding New Stories

Create a new `.stories.tsx` file next to your component:

```typescript
import type { Meta, StoryObj } from "@storybook/react-native";
import YourComponent from "./YourComponent";

const meta = {
  title: "Category/YourComponent",
  component: YourComponent,
  argTypes: {
    // Define interactive controls
  },
} satisfies Meta<typeof YourComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};
```

Then update `.storybook/storybook.requires.ts` to include your new story.

## 🎯 Best Practices

1. **Create stories for all UI components** - Helps with development and documentation
2. **Include multiple states** - Loading, error, success, empty states
3. **Use realistic data** - Mock data should represent real-world scenarios
4. **Test edge cases** - Long text, empty values, extreme numbers
5. **Document props** - Use argTypes to describe what each prop does

## 🔄 Switching Back to Normal App

To return to the regular app:

1. Open `storybook.config.ts`
2. Set `ENABLE_STORYBOOK = false`
3. Reload the app

## 📱 Presenting to Stakeholders

Storybook is perfect for:

- **Design reviews** - Show components in isolation
- **Client demos** - Demonstrate UI without backend dependencies
- **QA testing** - Test all component states systematically
- **Documentation** - Living documentation of your component library

## 🐛 Troubleshooting

### Storybook not loading

- Ensure `ENABLE_STORYBOOK = true` in `storybook.config.ts`
- Clear Metro bundler cache: `npm start -- --clear`

### Stories not appearing

- Check that story files are imported in `.storybook/storybook.requires.ts`
- Verify story file naming: `*.stories.tsx`

### Component errors

- Check that all dependencies are installed
- Verify import paths are correct
- Ensure mock data matches TypeScript types

## 📖 Resources

- [Storybook for React Native Docs](https://github.com/storybookjs/react-native)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Component Story Format](https://storybook.js.org/docs/react/api/csf)
