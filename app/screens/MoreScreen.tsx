import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import { Button, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/useAuthStore";

const MoreScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "More">>();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      logout();
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
