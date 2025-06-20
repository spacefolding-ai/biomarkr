import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const DotLoader: React.FC = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    dot1.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    dot2.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    dot3.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);

    // Offset the start of each dot's animation
    setTimeout(() => {
      dot2.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    }, 250);

    setTimeout(() => {
      dot3.value = withRepeat(withTiming(1, { duration: 500 }), -1, true);
    }, 500);
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: dot1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: dot2.value,
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: dot3.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.dot, animatedStyle1]} />
      <Animated.View style={[styles.dot, animatedStyle2]} />
      <Animated.View style={[styles.dot, animatedStyle3]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: "#010101",
    marginHorizontal: 2,
  },
});

export default DotLoader;
