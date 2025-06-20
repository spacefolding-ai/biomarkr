import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { ExtractionStatus } from "../types/ExtractionStatus.enum";

interface Props {
  status: ExtractionStatus;
}

const getProgress = (status: ExtractionStatus): number => {
  switch (status) {
    case "pending":
      return 0;
    case "processing":
      return 98;
    case "saving":
      return 99;
    case "done":
      return 100;
    case "error":
    case "unsupported":
      return 99.5;
    default:
      return 0;
  }
};

const ExtractionProgressBar: React.FC<Props> = ({ status }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = getProgress(status);
    if (status === "processing") {
      progress.value = withSequence(
        withTiming(30, { duration: 5000 }),
        withTiming(60, { duration: 5000 }),
        withTiming(target, { duration: 15000 })
      );
    } else {
      progress.value = withTiming(target, { duration: 20000 });
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View
      style={{
        height: 4,
        width: "100%",
        backgroundColor: "#eee",
        borderRadius: 2,
        overflow: "hidden",
        marginTop: 8,
      }}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            backgroundColor: status === "error" ? "red" : "#4CAF50",
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export default ExtractionProgressBar;
