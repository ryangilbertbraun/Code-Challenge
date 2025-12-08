# Lottie Animations

Place your Lottie JSON animation files in this directory.

## Usage

To use a Lottie animation in the LoginBackground:

1. Place your `.json` Lottie file in this directory (e.g., `splash-animation.json`)
2. Update `src/screens/AuthScreen.tsx` to use the Lottie animation instead of the image

### Example:

```typescript
// In AuthScreen.tsx, replace:
const backgroundImg = require("../../assets/images/avatar.png");

// With:
const lottieAnimation = require("../../assets/animations/splash-animation.json");

// Then update the LoginBackground component:
<LoginBackground
  avatarTop={avatarTop}
  lottieSource={lottieAnimation} // Use lottieSource instead of avatarSource
/>;
```

## Current Setup

The LoginBackground component now supports both:

- **Image avatars**: Pass `avatarSource` prop with an image
- **Lottie animations**: Pass `lottieSource` prop with a Lottie JSON file

The component will automatically detect which one you're using and render accordingly.
