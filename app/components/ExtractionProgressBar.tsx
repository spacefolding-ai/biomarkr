import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
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
      return 33;
    case "saving":
      return 66;
    case "done":
      return 100;
    case "error":
    case "unsupported":
      return 100;
    default:
      return 0;
  }
};

const ExtractionProgressBar: React.FC<Props> = ({ status }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(getProgress(status), { duration: 500 });
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
