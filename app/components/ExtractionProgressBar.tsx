import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ExtractionStatus } from "../types/ExtractionStatus.enum";

interface Props {
  status: ExtractionStatus;
  reportId?: string; // Add optional reportId for better tracking
}

const getProgress = (status: ExtractionStatus): number => {
  switch (status) {
    case ExtractionStatus.PENDING:
      return 15;
    case ExtractionStatus.PROCESSING:
      return 95;
    case ExtractionStatus.SAVING:
      return 99;
    case ExtractionStatus.DONE:
      return 100;
    case ExtractionStatus.ERROR:
    case ExtractionStatus.UNSUPPORTED:
    default:
      return 0;
  }
};

// Global storage for progress states to persist across re-renders
const progressStateMap = new Map<
  string,
  {
    currentProgress: number;
    lastStatus: ExtractionStatus;
    lastUpdateTime: number;
    isAnimating: boolean;
  }
>();

const getStatusConfig = (status: ExtractionStatus) => {
  switch (status) {
    case ExtractionStatus.PENDING:
      return {
        icon: "📄",
        message: "Document uploaded",
        color: "#2196F3", // Blue
        pulseColor: "#E3F2FD",
      };
    case ExtractionStatus.PROCESSING:
      return {
        icon: "🤖",
        message: "Analyzing with AI",
        color: "#FF9800", // Orange
        pulseColor: "#FFF3E0",
      };
    case ExtractionStatus.SAVING:
      return {
        icon: "💾",
        message: "Saving results",
        color: "#9C27B0", // Purple
        pulseColor: "#F3E5F5",
      };
    case ExtractionStatus.DONE:
      return {
        icon: "✅",
        message: "Analysis complete!",
        color: "#4CAF50", // Green
        pulseColor: "#E8F5E8",
      };
    case ExtractionStatus.ERROR:
      return {
        icon: "❌",
        message: "Processing failed",
        color: "#F44336", // Red
        pulseColor: "#FFEBEE",
      };
    case ExtractionStatus.UNSUPPORTED:
      return {
        icon: "⚠️",
        message: "File type not supported",
        color: "#FF5722", // Deep Orange
        pulseColor: "#FBE9E7",
      };
    default:
      return {
        icon: "📄",
        message: "Processing",
        color: "#9E9E9E", // Grey
        pulseColor: "#F5F5F5",
      };
  }
};

const ExtractionProgressBar: React.FC<Props> = ({ status, reportId }) => {
  const progress = useSharedValue(0);
  const pulseOpacity = useSharedValue(1);
  const statusConfig = getStatusConfig(status);

  // Add local state for current progress percentage to trigger re-renders
  const [currentProgress, setCurrentProgress] = useState(0);

  // Create a unique key for this progress bar instance
  const instanceKey = reportId || `status-${status}-${Date.now()}`;

  // Use refs for local state
  const continuousProgressRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);
  const mountTimeRef = useRef(Date.now());

  // Get or create persistent state for this instance
  const getPersistedState = () => {
    if (!progressStateMap.has(instanceKey)) {
      progressStateMap.set(instanceKey, {
        currentProgress: 0,
        lastStatus: status,
        lastUpdateTime: Date.now(),
        isAnimating: false,
      });
    }
    return progressStateMap.get(instanceKey)!;
  };

  const updatePersistedState = (
    updates: Partial<{
      currentProgress: number;
      lastStatus: ExtractionStatus;
      lastUpdateTime: number;
      isAnimating: boolean;
    }>
  ) => {
    const currentState = getPersistedState();
    const newState = {
      ...currentState,
      ...updates,
      lastUpdateTime: Date.now(),
    };
    progressStateMap.set(instanceKey, newState);

    // Update local state to trigger re-render
    if (updates.currentProgress !== undefined) {
      setCurrentProgress(updates.currentProgress);
    }
  };

  // Clear continuous progress timer
  const clearContinuousProgress = () => {
    if (continuousProgressRef.current) {
      clearInterval(continuousProgressRef.current);
      continuousProgressRef.current = null;
      updatePersistedState({ isAnimating: false });
    }
  };

  // Start continuous progress filling for ongoing states
  const startContinuousProgress = (
    startValue: number,
    maxValue: number,
    incrementPerSecond: number
  ) => {
    clearContinuousProgress();

    const persistedState = getPersistedState();
    const currentValue = Math.max(persistedState.currentProgress, startValue);

    updatePersistedState({
      currentProgress: currentValue,
      isAnimating: true,
    });

    console.log(
      `🔄 [${instanceKey}] Starting continuous progress from ${currentValue}% to ${maxValue}%`
    );

    continuousProgressRef.current = setInterval(() => {
      const state = getPersistedState();
      const newProgress = Math.min(
        state.currentProgress + incrementPerSecond,
        maxValue
      );

      updatePersistedState({ currentProgress: newProgress });

      // Smoothly animate to new progress value
      progress.value = withTiming(newProgress, { duration: 800 });

      // Stop when we reach max value
      if (newProgress >= maxValue) {
        console.log(
          `✅ [${instanceKey}] Continuous progress completed at ${newProgress}%`
        );
        clearContinuousProgress();
      }
    }, 1000);
  };

  useEffect(() => {
    const persistedState = getPersistedState();
    const hasStatusChanged = persistedState.lastStatus !== status;
    const isFirstRender = !isInitializedRef.current;

    // Initialize progress with persisted value and update local state
    if (isFirstRender) {
      progress.value = persistedState.currentProgress;
      setCurrentProgress(persistedState.currentProgress);
      isInitializedRef.current = true;
      console.log(
        `🎬 [${instanceKey}] Initializing with ${persistedState.currentProgress}% (status: ${status})`
      );
    }

    // Only proceed if status actually changed or it's the first render
    if (!hasStatusChanged && !isFirstRender) {
      console.log(
        `📊 [${instanceKey}] Status unchanged (${status}), continuing existing animation from ${persistedState.currentProgress}%`
      );
      return;
    }

    if (hasStatusChanged) {
      console.log(
        `🎬 [${instanceKey}] Status changed from ${persistedState.lastStatus} to ${status}, continuing from ${persistedState.currentProgress}%`
      );
    }

    // Update persisted status
    updatePersistedState({ lastStatus: status });

    // Clear any existing continuous progress
    clearContinuousProgress();

    const currentValue = persistedState.currentProgress;

    // Different animations based on status, continuing from current position
    if (status === ExtractionStatus.PENDING) {
      if (currentValue < 10) {
        // Initial progress animation
        progress.value = withTiming(10, { duration: 800 });
        updatePersistedState({ currentProgress: 10 });
        // Slowly fill to 15% over time
        setTimeout(() => startContinuousProgress(10, 15, 0.3), 800);
      } else {
        // Already past pending stage, just start slow progress
        startContinuousProgress(currentValue, 15, 0.3);
      }
    } else if (status === ExtractionStatus.PROCESSING) {
      // Processing starts at 16% and gradually fills to 95% (AI processing takes most time)
      const startValue = Math.max(currentValue, 16);
      if (currentValue < 16) {
        // Transition from pending (15%) to processing start (16%)
        progress.value = withTiming(16, { duration: 800 });
        updatePersistedState({ currentProgress: 16 });
        // Then start continuous progress from 16% to 95%
        setTimeout(() => startContinuousProgress(16, 95, 0.8), 800);
      } else {
        // Already in processing phase, continue filling to 95%
        startContinuousProgress(currentValue, 95, 0.8);
      }
    } else if (status === ExtractionStatus.SAVING) {
      // Saving stage: 96% to 99% with 5-second visible duration
      clearContinuousProgress();
      const startValue = Math.max(currentValue, 96);

      // Quick transition to 96% first
      progress.value = withTiming(96, { duration: 800 });
      updatePersistedState({ currentProgress: 96 });

      // Then slowly fill from 96% to 99% over 5 seconds so user can see this stage
      setTimeout(() => {
        console.log(
          `💾 [${instanceKey}] Starting visible saving animation (96% → 99%)`
        );
        startContinuousProgress(96, 99, 0.6); // 0.6% per second = 5 seconds total
      }, 800);
    } else if (status === ExtractionStatus.DONE) {
      // Final completion with a satisfying fill from current position
      clearContinuousProgress();
      const targetProgress = getProgress(status);
      progress.value = withTiming(targetProgress, { duration: 600 });
      updatePersistedState({ currentProgress: targetProgress });
    } else {
      // Error states or other - stop continuous progress
      clearContinuousProgress();
      const targetProgress = getProgress(status);
      if (targetProgress === 0) {
        // Reset for error states
        progress.value = withTiming(targetProgress, { duration: 800 });
        updatePersistedState({ currentProgress: targetProgress });
      } else {
        // Continue from current for other states
        const startValue = Math.max(currentValue, targetProgress);
        progress.value = withTiming(startValue, { duration: 800 });
        updatePersistedState({ currentProgress: startValue });
      }
    }

    // Pulse animation for active states - only restart if status changed
    if (
      status === ExtractionStatus.PENDING ||
      status === ExtractionStatus.PROCESSING ||
      status === ExtractionStatus.SAVING
    ) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      pulseOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearContinuousProgress();
      // Clean up old states (older than 5 minutes)
      const cutoffTime = Date.now() - 5 * 60 * 1000;
      for (const [key, state] of progressStateMap.entries()) {
        if (state.lastUpdateTime < cutoffTime) {
          progressStateMap.delete(key);
        }
      }
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const isActiveState =
    status === ExtractionStatus.PENDING ||
    status === ExtractionStatus.PROCESSING ||
    status === ExtractionStatus.SAVING;

  return (
    <View
      style={{
        marginVertical: 16,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Status Message with Progress Fill */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: "#F0F0F0", // Background color
          width: "100%",
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              backgroundColor: statusConfig.pulseColor,
              borderRadius: 20,
            },
            animatedStyle,
            isActiveState ? pulseStyle : { opacity: 1 },
          ]}
        />

        <Animated.View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              zIndex: 1,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                marginRight: 8,
              }}
            >
              {statusConfig.icon}
            </Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: statusConfig.color,
              }}
            >
              {statusConfig.message}
              {isActiveState ? "..." : ""}
            </Text>
          </View>

          {isActiveState && (
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: statusConfig.color,
              }}
            >
              {Math.round(currentProgress || getProgress(status))}%
            </Text>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

export default ExtractionProgressBar;
