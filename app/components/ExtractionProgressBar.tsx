import React, { useEffect } from "react";
import { Text, View } from "react-native";
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
    case ExtractionStatus.PENDING:
      return 0;
    case ExtractionStatus.PROCESSING:
      return 95;
    case ExtractionStatus.DONE:
      return 100;
    case ExtractionStatus.ERROR:
    case ExtractionStatus.UNSUPPORTED:
    default:
      return 0;
  }
};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const getStatusText = (status: ExtractionStatus, progress: number) => {
  if (status === ExtractionStatus.PROCESSING && progress >= 95) {
    return "Analyzing...";
  }
  return capitalizeFirstLetter(status) + "...";
};

const ExtractionProgressBar: React.FC<Props> = ({ status }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    const target = getProgress(status);
    if (status === ExtractionStatus.PROCESSING) {
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
      <Text style={{ marginTop: 4, textAlign: "center", color: "#555" }}>
        {getStatusText(status, progress.value)}
      </Text>
    </View>
  );
};

export default ExtractionProgressBar;
