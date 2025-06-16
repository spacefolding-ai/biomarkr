import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { handleLogout as performLogout } from "../services/auth";
import Toast from "react-native-toast-message";

const MoreScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "More">>();

  const handleLogout = async () => {
    try {
      await performLogout();
      Toast.show({
        type: "success",
        text1: "Logged out",
        text2: "You have been successfully logged out.",
      });
      // Navigate to the Auth stack and then to the Login tab
      navigation.navigate("Auth", { screen: "Login" });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Logout failed",
        text2: error.message || "An error occurred during logout.",
      });
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MoreScreen;
