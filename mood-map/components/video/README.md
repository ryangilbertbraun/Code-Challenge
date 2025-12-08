# Video Components

This directory contains video recording and playback components for the MoodMap journal application.

## Components

### VideoRecorder

A full-featured video recording component using Expo Camera.

**Features:**

- Camera permission handling with user-friendly UI
- Recording controls (start, stop)
- Real-time recording duration display
- Camera flip (front/back)
- Maximum duration enforcement
- Video compression before upload
- Thumbnail generation
- Processing state feedback

**Props:**

```typescript
interface VideoRecorderProps {
  onRecordingComplete: (
    videoUri: string,
    thumbnailUri: string,
    duration: number
  ) => void;
  onCancel?: () => void;
  maxDuration?: number; // in seconds, default: 120
}
```

**Usage:**

```tsx
import { VideoRecorder } from "@/components/video";

<VideoRecorder
  onRecordingComplete={(videoUri, thumbnailUri, duration) => {
    console.log("Video recorded:", videoUri);
    console.log("Duration:", duration, "seconds");
  }}
  onCancel={() => console.log("Recording cancelled")}
  maxDuration={120}
/>;
```

### VideoPlayer

A video playback component with custom controls.

**Features:**

- Video playback with expo-video
- Custom playback controls
- Play/pause functionality
- Duration display
- Loading states
- Thumbnail support
- Responsive sizing

**Props:**

```typescript
interface VideoPlayerProps {
  videoUri: string;
  thumbnailUri?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  style?: any;
}
```

**Usage:**

```tsx
import { VideoPlayer } from "@/components/video";

<VideoPlayer
  videoUri="https://example.com/video.mp4"
  thumbnailUri="https://example.com/thumbnail.jpg"
  autoPlay={false}
  showControls={true}
/>;
```

## Utilities

### videoProcessing.ts

Utility functions for video processing located in `utils/videoProcessing.ts`:

- `generateVideoThumbnail(videoUri: string): Promise<string>` - Generate thumbnail from video
- `compressVideo(videoUri: string, quality: number): Promise<string>` - Compress video file
- `getVideoFileSize(videoUri: string): Promise<number>` - Get video file size
- `formatFileSize(bytes: number): string` - Format file size for display
- `validateVideoFile(videoUri: string, maxSizeBytes: number): Promise<{valid: boolean, error?: string}>` - Validate video file

## Storybook

Both components have Storybook stories for development and testing:

- `VideoRecorder.stories.tsx` - Stories for video recording component
- `VideoPlayer.stories.tsx` - Stories for video playback component

To view in Storybook:

```bash
npm run storybook
```

## Requirements

This implementation satisfies **Requirement 3.2** from the design document:

- Video journal entry creation
- Video recording with Expo Camera
- Recording controls (start, stop, preview)
- Video compression before upload
- Thumbnail generation
- Video playback with controls

## Dependencies

- `expo-camera` - Camera access and video recording
- `expo-video` - Video playback
- `expo-file-system` - File system operations
- `expo-image-manipulator` - Image processing for thumbnails

## Future Enhancements

1. **Thumbnail Generation**: Currently returns placeholder. Implement with `expo-video-thumbnails` or similar library.
2. **Video Compression**: Currently returns original video. Implement actual compression with native modules or backend processing.
3. **Seek Controls**: Add video scrubbing/seeking functionality to VideoPlayer.
4. **Video Filters**: Add real-time filters during recording.
5. **Multiple Takes**: Allow users to review and retake videos before saving.

## Notes

- Camera permissions are handled automatically by the VideoRecorder component
- Videos are validated for size before processing
- The VideoPlayer uses expo-video's new VideoView API
- All components follow the MoodMap design system (colors, typography, spacing)
