import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface ThumbnailProps {
  src: string | null | undefined;
  size?: number;
}

export const Thumbnail: React.FC<ThumbnailProps> = ({ src, size = 80 }) => {
  if (!src) {
    return (
      <View style={[styles.placeholder, { width: size, height: size }]}>
        <Text style={styles.placeholderText}>No image</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri: src }}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="cover"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#ccc",
  },
  placeholderText: {
    fontSize: 10,
    color: "#666",
  },
});
